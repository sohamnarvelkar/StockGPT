
export interface PredictionScenario {
  caseName: 'Bull' | 'Base' | 'Bear';
  priceRange: string;
  probability: string;
  description: string;
  targetPrice: number; // For charting
}

export interface AnalysisSection {
  title: string;
  content: string; // Markdown supported
}

export interface SignalData {
  recommendation: 'BUY' | 'SELL' | 'HOLD' | 'STRONG BUY' | 'STRONG SELL';
  confidenceScore: number; // 0-100
  rationale: string;
}

export interface KeyMetrics {
  peRatio: string;
  marketCap: string;
  epsGrowth: string;
  profitMargin: string;
  roe: string;
  rsi: string; // Technical 14D
  shortTermTrend: 'Bullish' | 'Bearish' | 'Neutral';
}

export interface StockRecommendation {
  symbol: string;
  name: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  targetPrice?: number;
  rationale: string;
  metrics?: KeyMetrics; // Added for comparison
}

export interface NewsArticle {
  title: string;
  source: string;
  url: string;
  published: string;
  summary: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
}

export interface StockGPTResponse {
  symbol: string; // "AAPL" or "PORTFOLIO" or "MACRO"
  companyName: string; // or "Market Analysis"
  currentPrice?: number; // Optional, estimated
  currency?: string; // e.g. "$", "₹", "€"
  summary: string;
  sections: AnalysisSection[]; // Introduction, Fundamentals, Technicals, Macro, Risks, Takeaways
  scenarios: PredictionScenario[]; // Default (usually 12M) for backward compat
  forecasts?: {
    "1M": PredictionScenario[];
    "6M": PredictionScenario[];
    "12M": PredictionScenario[];
  };
  signal: SignalData;
  metrics?: KeyMetrics; // Added for comparison
  portfolioAllocation?: { asset: string; percentage: number }[]; // For portfolio optimization
  recommendations?: StockRecommendation[]; // Peer/Sector recommendations
  news?: NewsArticle[];
  groundingMetadata?: any; // To store source chunks if needed
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  data?: StockGPTResponse; // If assistant, may contain structured data
  timestamp: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  initialPrice: number;
  condition: 'ABOVE' | 'BELOW';
  status: 'ACTIVE' | 'TRIGGERED';
  createdAt: number;
}
