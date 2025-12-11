
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { StockGPTResponse } from "../types";

const apiKey = process.env.API_KEY || '';
const REQUEST_TIMEOUT_MS = 90000; // 90s timeout for complex chains

export class StockGPTError extends Error {
  constructor(message: string, public isRetryable: boolean = false) {
    super(message);
    this.name = "StockGPTError";
  }
}

// Robust Data Repair
const repairData = (data: any): any => {
    if (!data || typeof data !== 'object') return data;

    // Ensure arrays
    if (!Array.isArray(data.sections)) data.sections = [];
    if (!Array.isArray(data.scenarios)) data.scenarios = [];
    
    // Filter invalid scenarios
    data.scenarios = data.scenarios.filter((s: any) => s && s.caseName && s.priceRange);

    // Fix Forecasts
    if (!data.forecasts || typeof data.forecasts !== 'object') {
        const fallback = data.scenarios.length > 0 ? data.scenarios : [];
        data.forecasts = {
            "1M": fallback,
            "6M": fallback,
            "12M": fallback
        };
    }

    // Ensure Signal
    if (!data.signal || typeof data.signal !== 'object') {
        data.signal = { 
            recommendation: 'HOLD', 
            confidenceScore: 50, 
            rationale: 'Insufficient data for signal generation.' 
        };
    }

    // Ensure critical strings
    if (!data.symbol) data.symbol = "UNKNOWN";
    if (!data.summary) data.summary = "No summary available.";
    if (!data.companyName) data.companyName = data.symbol;

    return data;
};

// Validation Helper to prevent UI crashes
const validateSchema = (data: any): boolean => {
  if (!data || typeof data !== 'object') return false;
  
  // Required Strings
  if (typeof data.symbol !== 'string' || typeof data.summary !== 'string') return false;
  
  // Required Objects/Arrays
  if (!data.signal || typeof data.signal !== 'object') return false;
  
  // We need at least some content
  if (data.sections.length === 0 && data.scenarios.length === 0) return false;

  return true;
};

// Timeout Helper
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error("TIMEOUT"));
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

// Exponential Backoff Retry with Smart Filtering
async function retryOperation<T>(operation: () => Promise<T>, retries = 2, delay = 1000): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    // Determine if we should stop immediately (Non-retryable errors)
    const status = error.status || error.code;
    const msg = (error.message || '').toLowerCase();

    // 400: Bad Request, 401: Unauthorized, 403: Forbidden, 404: Not Found
    if (status === 400 || status === 401 || status === 403 || status === 404) {
        throw error;
    }
    
    // Safety filters are not retryable
    if (msg.includes('safety') || msg.includes('recitation')) {
        throw error;
    }

    if (retries <= 0) throw error;
    
    // Classify Retryable Errors
    const isNetworkError = 
        msg.includes('fetch') || 
        msg.includes('network') || 
        msg.includes('xhr') || 
        msg.includes('rpc failed') ||
        msg.includes('load failed') ||
        msg.includes('connection');
    
    const isServerOverload = 
        status === 429 || 
        status === 503 || 
        msg.includes('overloaded') || 
        msg.includes('capacity') ||
        msg.includes('quota'); // Sometimes temporary
    
    const isServerErr = status >= 500;
    const isJsonError = msg.includes('json') || msg.includes('structure') || msg.includes('validation') || msg.includes('syntax') || msg.includes('parsing');
    const isTimeout = msg === 'timeout';

    if (isNetworkError || isServerOverload || isServerErr || isJsonError || isTimeout) {
      console.warn(`Attempt failed (${msg}). Retrying in ${delay}ms... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryOperation(operation, retries - 1, delay * 2);
    }
    
    throw error;
  }
}

export const analyzeStock = async (query: string): Promise<StockGPTResponse> => {
  const cleanQuery = query.trim();
  if (!cleanQuery) throw new StockGPTError("Query cannot be empty.");

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new StockGPTError("No internet connection detected.", true);
  }

  if (!apiKey) {
    throw new StockGPTError("API Key is missing. Please configure your environment.", false);
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemPrompt = `
    You are StockGPT, an advanced financial analysis engine.
    
    TASK: Provide a deep financial analysis for: "${cleanQuery}".
    
    GUIDELINES:
    1. MARKET IDENTIFICATION:
       - Identify the correct listing (NSE/BSE for India, NYSE/NASDAQ for US).
       - Use local currency (₹ for India, $ for US).
    
    2. STRUCTURED ANALYSIS:
       - Executive Summary (Business, Moat).
       - Fundamentals (Revenue, Margins, P/E).
       - Technicals (RSI, MACD, Support/Resistance).
       - Macro Analysis (Inflation, Rates, Geopolitics).
       - Risks.

    3. PREDICTIONS & SIGNAL:
       - Short/Medium/Long term price targets (Bull/Base/Bear).
       - Signal: BUY/SELL/HOLD with confidence score (0-100).
    
    4. TOOLS:
       - Use Google Search for REAL-TIME price, news, and data.
    
    CRITICAL OUTPUT FORMAT:
    - You must return ONLY a valid JSON object.
    - DO NOT use markdown code blocks.
    - DO NOT add any text before or after the JSON.
    - JSON Structure:
    {
      "symbol": "string",
      "companyName": "string",
      "currentPrice": number,
      "currency": "string",
      "summary": "string",
      "sections": [{ "title": "string", "content": "string" }],
      "scenarios": [{ "caseName": "Bull"|"Base"|"Bear", "priceRange": "string", "probability": "string", "description": "string", "targetPrice": number }],
      "forecasts": {
        "1M": [ ...scenarios... ],
        "6M": [ ...scenarios... ],
        "12M": [ ...scenarios... ]
      },
      "signal": { "recommendation": "string", "confidenceScore": number, "rationale": "string" },
      "metrics": { "peRatio": "string", "marketCap": "string", "epsGrowth": "string", "profitMargin": "string", "roe": "string", "rsi": "string", "shortTermTrend": "string" },
      "portfolioAllocation": [{ "asset": "string", "percentage": number }],
      "recommendations": [{ "symbol": "string", "name": "string", "action": "string", "targetPrice": number, "rationale": "string", "metrics": { ... } }],
      "news": [{ "title": "string", "source": "string", "url": "string", "published": "string", "summary": "string", "sentiment": "string" }]
    }
  `;

  const performAnalysis = async (): Promise<StockGPTResponse> => {
    const response: GenerateContentResponse = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: query,
        config: {
          systemInstruction: systemPrompt,
          tools: [{ googleSearch: {} }],
        }
      }),
      REQUEST_TIMEOUT_MS
    );

    const candidate = response.candidates?.[0];
    if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
        // Handle specific finish reasons as errors
        throw new Error(`FINISH_REASON: ${candidate.finishReason}`);
    }

    let text = response.text || "";
    if (!text) throw new Error("Received empty response from AI.");

    // Aggressive JSON Extraction
    try {
        // 1. Remove markdown wrapping if present
        text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
        
        // 2. Find outer braces
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}');
        
        if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
             throw new Error("No JSON object found in response.");
        }
        
        const jsonString = text.substring(jsonStart, jsonEnd + 1);
        
        let rawData = JSON.parse(jsonString);
        
        // 3. Repair and Validate
        rawData = repairData(rawData);

        if (!validateSchema(rawData)) {
            console.error("Schema Invalid:", rawData);
            throw new Error("Validation failed: Data structure incomplete.");
        }

        // 4. Attach Metadata
        if (candidate.groundingMetadata) {
            rawData.groundingMetadata = candidate.groundingMetadata;
        }

        return rawData as StockGPTResponse;

    } catch (e: any) {
        console.error("Parsing/Validation Error:", e.message);
        throw new Error(`JSON Processing Error: ${e.message}`);
    }
  };

  try {
    return await retryOperation(performAnalysis);
  } catch (error: any) {
    console.error("StockGPT Pipeline Error:", error);
    
    if (error instanceof StockGPTError) throw error;

    const msg = (error.message || '').toLowerCase();
    const status = error.status || error.code;

    // Specific Error Mapping
    if (msg.includes('finish_reason: safety') || msg.includes('safety')) {
         throw new StockGPTError("Safety Filter Triggered: The query produced protected content. Please rephrase.", false);
    }
    if (msg.includes('finish_reason: recitation') || msg.includes('recitation')) {
         throw new StockGPTError("Content Limit: Response blocked due to recitation/copyright checks.", false);
    }
    if (status === 400) {
         throw new StockGPTError("Invalid Request: The query could not be processed.", false);
    }
    if (status === 401 || msg.includes('api key')) {
         throw new StockGPTError("Authorization Failed: Invalid or missing API Key.", false);
    }
    if (status === 403) {
         throw new StockGPTError("Access Denied: You may not have access to this model or region.", false);
    }
    if (status === 404) {
         throw new StockGPTError("Model Not Found: The requested AI model is unavailable.", false);
    }
    if (status === 429 || msg.includes('quota') || msg.includes('limit')) {
         throw new StockGPTError("High Traffic: Server is busy. Please try again in a moment.", true);
    }
    if (msg.includes('timeout')) {
         throw new StockGPTError("Analysis Timed Out: The request took too long. Please try again.", true);
    }
    if (msg.includes('network') || msg.includes('fetch') || msg.includes('connection')) {
         throw new StockGPTError("Network Error: Check your internet connection.", true);
    }
    
    // Fallback
    throw new StockGPTError("Data Processing Error: Unable to generate a valid analysis. Please try a different query.", true);
  }
};
