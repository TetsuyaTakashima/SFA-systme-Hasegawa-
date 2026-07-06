export type Market = "us" | "jp";

export type MarketSource =
  | "official:polygon"
  | "official:alpha_vantage"
  | "mock"
  | "cache"
  | "fallback";

export type SymbolType = "stock" | "etf" | "reit" | "other";

export type SymbolMasterItem = {
  sym: string;
  name?: string;
  nameEn?: string;
  sector?: string;
  exchange?: string;
  type?: SymbolType | string;
  typeLabel?: string;
  source?: string;
  listedAt?: string;
};

export type PriceBar = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type HistoryResponse = {
  symbol: string;
  market: Market;
  currency: "USD" | "JPY";
  source: MarketSource;
  updatedAt: string;
  bars: PriceBar[];
};

export type Quote = {
  symbol: string;
  market: Market;
  name: string;
  price: number;
  changePct: number;
  currency: "USD" | "JPY";
  source: MarketSource;
  updatedAt: string;
};

export type WatchItem = {
  symbol: string;
  market: Market;
  name: string;
  sector: string;
  shares?: number;
  averageCost?: number;
};

export type AnalysisReason = {
  label: string;
  detail: string;
  level: "positive" | "neutral" | "warning";
};

export type Forecast = {
  horizonDays: number;
  expectedPct: number;
  lowPct: number;
  highPct: number;
  confidence: "high" | "medium" | "low";
  reasons: AnalysisReason[];
};

export type ScreenerCandidate = {
  rank: number;
  symbol: string;
  market: Market;
  name: string;
  sector: string;
  price: number;
  momentumPct: number;
  forecastPct: number;
  volatilityPct: number;
  score: number;
  reasons: AnalysisReason[];
};

export type DemoOrder = {
  id: string;
  symbol: string;
  market: Market;
  side: "buy" | "sell";
  quantity: number;
  price: number;
  amount: number;
  fee: number;
  note?: string;
  createdAt: string;
};

export type DemoPosition = {
  symbol: string;
  market: Market;
  name: string;
  quantity: number;
  averageCost: number;
};

export type DemoAccount = {
  cash: number;
  initialCash: number;
  positions: DemoPosition[];
  orders: DemoOrder[];
};
