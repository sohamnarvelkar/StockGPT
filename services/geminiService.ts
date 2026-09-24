import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { StockGPTResponse } from "../types";

// API Key must be obtained from process.env.API_KEY as per Google GenAI guidelines
const REQUEST_TIMEOUT_MS = 120000; // 120s for deep analysis

const DEFAULT_MODEL = 'gemini-2.5-flash';
const FALLBACK_MODELS = ['gemini-2.5-flash'];

const getModelCandidates = (): string[] => {
  const preferred = (process.env.GEMINI_MODEL || DEFAULT_MODEL).trim();
  return [...new Set([preferred, ...FALLBACK_MODELS])];
};

const isQuotaOrRateLimitError = (err: unknown): boolean => {
  const e = err as { status?: number; code?: number | string; message?: string };
  const status = e.status ?? (typeof e.code === 'number' ? e.code : undefined);
  if (status === 429) return true;
  const msg = (e.message || '').toLowerCase();
  return (
    msg.includes('quota') ||
    msg.includes('rate limit') ||
    msg.includes('resource_exhausted') ||
    msg.includes('resource exhausted') ||
    msg.includes('exceeded your current quota')
  );
};

export class StockGPTError extends Error {
  constructor(
    message: string, 
    public isRetryable: boolean = false,
    public code: string = 'UNKNOWN_ERROR'
  ) {
    super(message);
    this.name = "StockGPTError";
  }
}

// --- Error Mapping Utility ---
const mapGenAIError = (err: any): StockGPTError => {
    if (err instanceof StockGPTError) return err;

    const msg = (err.message || '').toLowerCase();
    const status = err.status || err.code;

    // Network / Connectivity
    if (msg.includes('fetch') || msg.includes('network') || msg.includes('connection') || msg.includes('offline')) {
        return new StockGPTError("Connection failed. Please check your internet connection.", true, 'NETWORK_ERROR');
    }
    
    // Timeout
    if (msg.includes('timeout') || msg.includes('aborted')) {
         return new StockGPTError("Analysis timed out. The market data took too long to retrieve.", true, 'TIMEOUT');
    }

    // Quota / Rate Limiting (429)
    if (isQuotaOrRateLimitError(err)) {
        return new StockGPTError(
          "Gemini API quota exceeded for the selected model. Wait a few minutes, check usage at ai.dev/rate-limit, or set GEMINI_MODEL=gemini-2.5-flash in .env.local.",
          true,
          'RATE_LIMIT'
        );
    }

    // Safety Filters
    if (msg.includes('safety') || msg.includes('blocked') || msg.includes('policy') || msg.includes('harmful')) {
        return new StockGPTError("Analysis blocked by AI safety filters. Please modify your query.", false, 'SAFETY_BLOCK');
    }

    // Parsing
    if (msg.includes('json') || msg.includes('parse') || msg.includes('syntax') || msg.includes('unexpected token')) {
        return new StockGPTError("Failed to structure market data. Retrying usually fixes this.", true, 'PARSE_ERROR');
    }

    // Service Unavailable
    if (status === 503 || status === 500 || msg.includes('overloaded') || msg.includes('unavailable')) {
        return new StockGPTError("AI Service temporarily unavailable. Please try again.", true, 'SERVICE_ERROR');
    }

    // Auth
    if (status === 401 || status === 403 || msg.includes('api key') || msg.includes('unauthorized')) {
        return new StockGPTError("Authentication failed. Please verify API configuration.", false, 'AUTH_ERROR');
    }

    // Default
    return new StockGPTError(err.message || "An unexpected error occurred.", true, 'UNKNOWN');
};

// Robust Data Repair
const repairData = (data: any): any => {
    if (!data || typeof data !== 'object') return data;

    // Force type to single
    data.type = 'single';

    // Ensure arrays exist
    if (!Array.isArray(data.sections)) data.sections = [];
    if (!Array.isArray(data.scenarios)) data.scenarios = [];
    
    // Filter invalid scenarios and ensure numeric targets
    data.scenarios = data.scenarios.filter((s: any) => s && s.caseName && s.priceRange).map((s: any) => ({
        ...s,
        targetPrice: typeof s.targetPrice === 'number' ? s.targetPrice : parseFloat(String(s.priceRange).replace(/[^0-9.]/g, '')) || 0
    }));

    // Fix Forecasts structure
    if (!data.forecasts || typeof data.forecasts !== 'object') {
        const fallback = data.scenarios.length > 0 ? data.scenarios : [];
        data.forecasts = {
            "1M": fallback,
            "6M": fallback,
            "12M": fallback
        };
    }

    // Ensure Signal exists
    if (!data.signal || typeof data.signal !== 'object') {
        data.signal = { 
            recommendation: 'HOLD', 
            confidenceScore: 50, 
            rationale: 'Insufficient data for signal generation.' 
        };
    }

    // Ensure Metrics exist
    if (!data.metrics || typeof data.metrics !== 'object') {
        data.metrics = {
            peRatio: "N/A",
            marketCap: "N/A",
            epsGrowth: "N/A",
            profitMargin: "N/A",
            roe: "N/A",
            rsi: "50",
            shortTermTrend: "Neutral"
        };
    }

    // Ensure Recommendations (Peers) have metrics
    if (Array.isArray(data.recommendations)) {
        data.recommendations = data.recommendations.map((rec: any) => ({
            ...rec,
            metrics: rec.metrics || {
                peRatio: "N/A",
                marketCap: "N/A",
                epsGrowth: "N/A",
                profitMargin: "N/A",
                roe: "N/A",
                rsi: "N/A"
            }
        }));
    }

    // Ensure critical strings
    if (!data.symbol) data.symbol = "UNKNOWN";
    if (!data.summary) data.summary = "No summary available.";
    if (!data.companyName) data.companyName = data.symbol;
    if (typeof data.currentPrice !== 'number') data.currentPrice = 0;

    return data;
};

// Validation Helper
const validateSchema = (data: any): boolean => {
  if (!data || typeof data !== 'object') return false;
  
  // Single Mode Validation
  if (typeof data.symbol !== 'string' || typeof data.summary !== 'string') return false;
  if (!data.signal || typeof data.signal !== 'object') return false;
  
  // We need at least some content
  if (data.sections.length === 0 && data.scenarios.length === 0) return false;

  return true;
};

// Timeout Wrapper
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error("TIMEOUT_EXCEEDED"));
        }, ms);

        promise
            .then((value) => {
                clearTimeout(timer);
                resolve(value);
            })
            .catch((reason) => {
                clearTimeout(timer);
                reject(reason);
            });
    });
}

// Enhanced Retry Logic
async function retryOperation<T>(operation: () => Promise<T>, retries = 2, delay = 1000): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    const mappedError = mapGenAIError(error);

    // Don't retry if specifically non-retryable
    if (!mappedError.isRetryable) {
        throw mappedError;
    }

    if (retries <= 0) {
        throw mappedError;
    }
    
    console.warn(`Operation failed (${mappedError.code}). Retrying in ${delay}ms...`, error.message);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Exponential backoff
    return retryOperation(operation, retries - 1, delay * 2);
  }
}

export const getApiKey = (): string => {
  let key = '';
  if (typeof process !== 'undefined' && process.env?.API_KEY) {
    key = process.env.API_KEY;
  }
  if (!key && typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const metaEnv = (import.meta as any).env;
    key =
      metaEnv.VITE_GEMINI_API_KEY ||
      metaEnv.VITE_GOOGLE_API_KEY ||
      metaEnv.VITE_API_KEY ||
      metaEnv.GEMINI_API_KEY ||
      metaEnv.GOOGLE_API_KEY ||
      metaEnv.API_KEY ||
      '';
  }
  if (!key && typeof localStorage !== 'undefined') {
    key = localStorage.getItem('custom_gemini_api_key') || '';
  }
  return key.trim();
};

export const analyzeStock = async (query: string): Promise<StockGPTResponse> => {
  const cleanQuery = query.trim();
  if (!cleanQuery) throw new StockGPTError("Query cannot be empty.", false, 'INVALID_INPUT');

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new StockGPTError("No internet connection detected.", true, 'OFFLINE');
  }

  // Check for API key
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new StockGPTError(
      "Gemini API Key is missing. Please configure GEMINI_API_KEY / VITE_GOOGLE_API_KEY in your Vercel project settings or .env.local file.",
      false,
      'NO_API_KEY'
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemPrompt = `
    You are StockGPT, an elite quantitative financial analysis engine.
    
    TASK: Perform a deep-dive financial analysis for: "${cleanQuery}".
    
    CORE OBJECTIVE: ACCURACY > 95%. 
    You MUST use the 'googleSearch' tool to verify the Latest Price, Market Cap, P/E Ratio, and Recent News. Do not rely solely on internal knowledge.
    
    PROTOCOL:
    1.  **Search & Verify**: First, search for the stock's real-time price, today's news, and latest quarterly results.
    2.  **Identify Market**: Correctly identify the exchange (NSE/BSE/NYSE/NASDAQ) and Currency.
    3.  **Analyze**: 
        -   **Overview**: Executive summary of the business and its "Economic Moat".
        -   **Fundamentals**: Revenue growth, Net Margins, Cash Flow health.
        -   **Technicals**: RSI (14D), MACD, Moving Averages (20/50/200 DMA).
        -   **Macro**: Interest rates, Inflation, Sector rotation, Geopolitics.
    4.  **Forecast**: Generate probabilistic price targets (Bull/Base/Bear) for 1M, 6M, and 12M.
    5.  **Signal**: Provide a BUY/SELL/HOLD recommendation with a 0-100 confidence score based on data convergence.

    CRITICAL OUTPUT RULES:
    -   Return ONLY valid JSON. No markdown formatting. No preamble.
    -   Ensure 'currentPrice' is a number (e.g. 150.50), not a string.
    -   Ensure 'metrics' are accurate and up-to-date.
    
    JSON STRUCTURE:
    {
      "type": "single",
      "symbol": "string (e.g. AAPL)",
      "companyName": "string",
      "currentPrice": number,
      "currency": "string (e.g. $ or ₹)",
      "summary": "string",
      "sections": [
        { "title": "Fundamentals", "content": "Markdown text..." },
        { "title": "Technicals", "content": "Markdown text..." },
        { "title": "Global Market & Macro Analysis", "content": "Detailed markdown covering rates, inflation, geopolitics..." },
        { "title": "Risks", "content": "Markdown text..." }
      ],
      "scenarios": [
         { "caseName": "Bull", "priceRange": "string", "probability": "string", "description": "string", "targetPrice": number },
         { "caseName": "Base", "priceRange": "string", "probability": "string", "description": "string", "targetPrice": number },
         { "caseName": "Bear", "priceRange": "string", "probability": "string", "description": "string", "targetPrice": number }
      ],
      "forecasts": {
        "1M": [ ...scenarios... ],
        "6M": [ ...scenarios... ],
        "12M": [ ...scenarios... ]
      },
      "signal": { "recommendation": "BUY"|"SELL"|"HOLD", "confidenceScore": number, "rationale": "string" },
      "metrics": { "peRatio": "string", "marketCap": "string", "epsGrowth": "string", "profitMargin": "string", "roe": "string", "rsi": "string", "shortTermTrend": "Bullish"|"Bearish"|"Neutral" },
      "portfolioAllocation": [{ "asset": "string", "percentage": number }],
      "recommendations": [
         { 
           "symbol": "PEER", 
           "name": "Peer Name", 
           "action": "string", 
           "targetPrice": number, 
           "rationale": "string", 
           "metrics": { "peRatio": "...", "marketCap": "...", "epsGrowth": "...", "profitMargin": "...", "roe": "...", "rsi": "..." } 
         }
      ],
      "news": [{ "title": "string", "source": "string", "url": "string", "published": "string", "summary": "string", "sentiment": "Positive"|"Negative"|"Neutral" }]
    }
  `;

  const runWithModel = async (model: string): Promise<StockGPTResponse> => {
    const config: any = {
      systemInstruction: systemPrompt,
      tools: [{ googleSearch: {} }],
    };

    // Only set thinking budget for models that support it
    if (model.includes('2.5') || model.includes('thinking')) {
      config.thinkingConfig = { thinkingBudget: 2048 };
    }

    const response: GenerateContentResponse = await withTimeout(
      ai.models.generateContent({
        model,
        contents: query,
        config,
      }),
      REQUEST_TIMEOUT_MS
    );

    const candidate = response.candidates?.[0];
    if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
        throw new Error(`FINISH_REASON: ${candidate.finishReason}`);
    }

    let text = response.text || "";
    if (!text) throw new Error("Received empty response from AI.");

    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');

    if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
         throw new Error("No valid JSON structure found in response.");
    }

    const jsonString = text.substring(jsonStart, jsonEnd + 1);
    let rawData;

    try {
        rawData = JSON.parse(jsonString);
    } catch (parseError) {
        throw new Error(`JSON Parse Failed: ${(parseError as Error).message}`);
    }

    rawData = repairData(rawData);

    if (!validateSchema(rawData)) {
        console.error("Schema Validation Failed:", rawData);
        throw new Error("Data missing critical fields (symbol, signal, sections).");
    }

    if (candidate?.groundingMetadata) {
        rawData.groundingMetadata = candidate.groundingMetadata;
    }

    return rawData as StockGPTResponse;
  };

  const performAnalysis = async (): Promise<StockGPTResponse> => {
    const models = getModelCandidates();
    let lastError: unknown;

    for (const model of models) {
      try {
        return await runWithModel(model);
      } catch (error: unknown) {
        lastError = error;
        if (isQuotaOrRateLimitError(error)) {
          console.warn(`Model ${model} quota/rate limited; trying next model if available.`);
          continue;
        }
        if (error instanceof StockGPTError) throw error;
        throw new Error((error as Error).message || "Failed to process AI response.");
      }
    }

    throw lastError ?? new Error("All configured Gemini models are unavailable.");
  };

  try {
    return await retryOperation(performAnalysis);
  } catch (error: any) {
    throw mapGenAIError(error);
  }
};