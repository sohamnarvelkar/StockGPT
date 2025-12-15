
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
  dividendYield?: string;
  debtToEquity?: string;
}

export interface StockRecommendation {
  symbol: string;
  name: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  targetPrice?: number;
  rationale: string;
  metrics?: KeyMetrics; // Added for context in Deep Dive
}

export interface NewsArticle {
  title: string;
  source: string;
  url: string;
  published: string;
  summary: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
}

export interface ComparisonCandidate {
  symbol: string;
  companyName: string;
  currentPrice: number;
  currency: string;
  signal: SignalData;
  pros: string[];
  cons: string[];
  targetPrice12M: number;
  metrics: KeyMetrics;
}

export interface StockGPTResponse {
  type: 'single'; // Strictly single mode
  
  symbol: string; 
  companyName: string; 
  currentPrice?: number; 
  currency?: string; 
  summary: string;
  sections: AnalysisSection[]; 
  scenarios: PredictionScenario[]; 
  forecasts?: {
    "1M": PredictionScenario[];
    "6M": PredictionScenario[];
    "12M": PredictionScenario[];
  };
  signal: SignalData;
  metrics?: KeyMetrics; 
  portfolioAllocation?: { asset: string; percentage: number }[]; 
  recommendations?: StockRecommendation[]; 
  news?: NewsArticle[];
  
  // Comparison fields
  comparisonCandidates?: ComparisonCandidate[];
  comparisonVerdict?: string;
  
  groundingMetadata?: any; 
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  data?: StockGPTResponse; 
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
