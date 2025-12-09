import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { StockGPTResponse } from "../types";

const apiKey = process.env.API_KEY || '';
const REQUEST_TIMEOUT_MS = 90000; // 90s timeout for complex chains

class StockGPTError extends Error {
  constructor(message: string, public isRetryable: boolean = false) {
    super(message);
    this.name = "StockGPTError";
  }
}

// Validation Helper to prevent UI crashes
const validateSchema = (data: any): boolean => {
  if (!data || typeof data !== 'object') return false;
  
  // Required Strings
  if (typeof data.symbol !== 'string' || typeof data.summary !== 'string') return false;
  
  // Required Objects/Arrays
  if (!data.signal || typeof data.signal !== 'object') return false;
  if (!Array.isArray(data.scenarios) || data.scenarios.length === 0) return false;
  if (!Array.isArray(data.sections)) return false;

  // Validate Scenario Structure
  const validScenarios = data.scenarios.every((s: any) => 
    s.caseName && s.priceRange && s.probability
  );
  if (!validScenarios) return false;

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

// Exponential Backoff Retry
async function retryOperation<T>(operation: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    if (retries <= 0) throw error;
    
    // Classify Retryable Errors
    const isNetworkError = error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Failed to fetch'));
    const isServerOverload = error.status === 503 || error.status === 429 || error.message?.includes('overloaded');
    const isJsonError = error.message.includes('JSON') || error.message.includes('structure') || error.message.includes('validation');
    const isTimeout = error.message === 'TIMEOUT';

    if (isNetworkError || isServerOverload || isJsonError || isTimeout) {
      console.warn(`Analysis failed (${error.message}). Retrying in ${delay}ms... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryOperation(operation, retries - 1, delay * 2);
    }
    
    throw error;
  }
}

export const analyzeStock = async (query: string): Promise<StockGPTResponse> => {
  // 1. Input Validation
  const cleanQuery = query.trim();
  if (!cleanQuery) throw new StockGPTError("Query cannot be empty.");
  if (cleanQuery.length < 2) throw new StockGPTError("Query is too short. Please enter a valid ticker or question.");

  // 2. Connectivity Check
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new StockGPTError("No internet connection detected. Please check your network settings.");
  }

  if (!apiKey) {
    throw new StockGPTError("API Key is missing. Please set it in the environment.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemPrompt = `
    You are StockGPT, an advanced financial analysis engine. 
    You combine quantitative modeling, fundamental analysis, technical indicators, and macro assessment.
    
    Your goal is to provide a probability-based deep dive into the user's query (ticker, portfolio, or macro question).
    
    SCOPE & RECOGNITION:
    - GLOBAL MARKETS: US (NYSE/NASDAQ), Europe, Asia.
    - INDIAN MARKETS (CRITICAL PRIORITY): You must accurately identify and prioritize Indian stocks (NSE/BSE).
      * Recognize tickers with ".NS" (NSE) or ".BO" (BSE) suffixes (e.g. "RELIANCE.NS", "TCS.BO").
      * Recognize common Indian company names even without suffixes (e.g., "Reliance", "TCS", "HDFC Bank", "Infosys", "ITC", "Tata Motors", "Bajaj Finance", "Zomato").
      * If a ticker/name is ambiguous (e.g., "TATAMOTORS" vs US ADR, or "Maruti"), ALWAYS prioritize the primary Indian listing (NSE) unless the user explicitly asks for the ADR or foreign listing.
    - CRYPTO & COMMODITIES.

    Follow these strict tasks:
    1. MARKET IDENTIFICATION:
       - Determine the listing exchange and currency.
       - **Indian Stocks**: STRICTLY use Indian Rupees (₹) for all price targets, current prices, and financial figures (Crores/Lakhs preferred for fundamentals).
       - **US/Global Stocks**: Use the local currency ($, €, etc.).
       - Benchmarks: Use S&P 500/Nasdaq for US, Nifty 50/Sensex for India.

    2. COMPREHENSIVE ANALYSIS:
       - Business Model & Competitive Moat.
       - Fundamentals: Revenue growth, Margins (EBITDA/PAT), P/E vs Sector, Debt/Equity.
       - For Indian stocks: Analyze recent Quarterly Results (Q1/Q2/Q3/Q4), YoY growth, and order book positions.

    3. TECHNICAL ANALYSIS:
       - Moving Averages (20/50/200 DMA).
       - RSI, MACD, Bollinger Bands.
       - Key Support & Resistance Levels.
       - For Indian Stocks: Compare relative strength against Nifty 50 or Bank Nifty.

    4. PRICE PREDICTIONS (Probabilistic) - MULTI-TIMEFRAME:
       - Generate Bull/Base/Bear scenarios for THREE distinct timeframes:
         * Short-term (1 Month)
         * Medium-term (6 Months)
         * Long-term (12 Months)
       - Provide target prices, probabilities, and specific drivers for each.

    5. SIGNAL GENERATION:
       - Buy/Sell/Hold with Confidence Score (0-100).

    6. PORTFOLIO OPTIMIZATION (if applicable).

    7. GLOBAL MARKET & MACRO ANALYSIS (Dedicated Section):
       - REQUIRED: Create a dedicated section titled "Global Market & Macro Analysis".
       - This section must differentiate between GLOBAL factors and LOCAL factors based on the asset.
       - IF INDIAN ASSET: Focus on RBI Policy, Monsoon, Inflation, FII Flows, US Fed impact on INR.
       - IF US/GLOBAL: Focus on Fed Policy, Treasury Yields, Inflation, Geopolitics.

    8. RECENT NEWS INTELLIGENCE:
       - Use Google Search to find 3-5 of the most recent and relevant news articles.
       - Prioritize major financial news outlets.
       - Ensure URLs are valid.

    9. RISK ASSESSMENT:
       - Company specific and Macro risks.

    CONSTRAINTS:
    - Never guarantee outcomes. Use "likely", "probable".
    - Be professional, concise, and data-driven.
    - Format text sections with Markdown (lists, bolding).
    - Use Google Search to get the latest price, news, and live market data.

    CRITICAL OUTPUT FORMAT:
    You must return ONLY a valid JSON object. Do not include any conversational text.
    Structure:
    {
      "symbol": "string (Ticker or MACRO)",
      "companyName": "string",
      "currentPrice": number,
      "currency": "string",
      "summary": "string",
      "sections": [{ "title": "string", "content": "string" }],
      "forecasts": {
        "1M": [{ "caseName": "Bull"|"Base"|"Bear", "priceRange": "string", "probability": "string", "description": "string", "targetPrice": number }],
        "6M": [{ "caseName": "Bull"|"Base"|"Bear", "priceRange": "string", "probability": "string", "description": "string", "targetPrice": number }],
        "12M": [{ "caseName": "Bull"|"Base"|"Bear", "priceRange": "string", "probability": "string", "description": "string", "targetPrice": number }]
      },
      "scenarios": [ ...copy of 12M array for backward compatibility... ],
      "signal": { "recommendation": "BUY/SELL/HOLD", "confidenceScore": number, "rationale": "string" },
      "portfolioAllocation": [{ "asset": "string", "percentage": number }],
      "news": [{ "title": "string", "source": "string", "url": "string", "published": "string", "summary": "string" }]
    }
  `;

  // Encapsulate Logic for Retry
  const performAnalysis = async (): Promise<StockGPTResponse> => {
    // API Call
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

    // Finish Reason Handling
    const candidate = response.candidates?.[0];
    if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
        const reason = candidate.finishReason;
        if (reason === 'SAFETY') throw new Error("Safety filters triggered. Please modify your query.");
        if (reason === 'RECITATION') throw new Error("Content blocked due to copyright.");
        throw new Error(`Model stopped unexpectedly: ${reason}`);
    }

    let text = response.text;
    if (!text) throw new Error("Received empty response from AI.");

    // Sanitization
    text = text.trim();
    if (text.startsWith('```json')) {
      text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Parsing
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    
    if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
      throw new Error("Invalid JSON structure received from model.");
    }
    
    text = text.substring(jsonStart, jsonEnd + 1);

    let data: StockGPTResponse;
    try {
        data = JSON.parse(text) as StockGPTResponse;
    } catch (parseError) {
        throw new Error("JSON Parse Error: Malformed data structure.");
    }

    // Fallback: If AI fails to populate 'forecasts' but has 'scenarios', mock the forecasts
    if (!data.forecasts && data.scenarios) {
      data.forecasts = {
        "1M": data.scenarios,
        "6M": data.scenarios,
        "12M": data.scenarios
      };
    }

    // Schema Validation
    if (!validateSchema(data)) {
        console.error("Schema Validation Failed:", data);
        throw new Error("Response validation failed: Missing critical fields (Signal, Scenarios, or Symbol).");
    }

    // Attach Metadata
    if (candidate.groundingMetadata) {
        data.groundingMetadata = candidate.groundingMetadata;
    }

    return data;
  };

  try {
    return await retryOperation(performAnalysis);
  } catch (error: any) {
    console.error("StockGPT Pipeline Error:", error);
    
    if (error instanceof StockGPTError) throw error;

    // Error Mapping for User Experience
    if (error.message === 'TIMEOUT') {
        throw new StockGPTError("Analysis timed out. The market is complex—please try again or simplify your query.", true);
    }

    if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('network'))) {
         throw new StockGPTError("Network connection failed. Please check your internet connection.");
    }
    
    if (error.status === 400) {
        throw new StockGPTError("Invalid request. Please check your query syntax.");
    }
    if (error.status === 401 || error.status === 403) {
        throw new StockGPTError("API Access Denied. Please check your API Key configuration.");
    }
    if (error.status === 429) {
        throw new StockGPTError("High Traffic Volume. We're momentarily overloaded—please try again in 10 seconds.", true);
    }
    if (error.status >= 500) {
        throw new StockGPTError("AI Service Unavailable. Our providers are experiencing issues.", true);
    }
    
    // Catch-all with descriptive message
    throw new StockGPTError(error.message || "An unexpected system error occurred.", true);
  }
};
