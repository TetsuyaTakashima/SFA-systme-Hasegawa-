import type { HistoryResponse, Market, PriceBar, Quote, SymbolMasterItem } from "@/types/market";

const DAY_MS = 24 * 60 * 60 * 1000;
const REAL_HISTORY_CACHE_MS = 5 * 60 * 1000;
const MOCK_HISTORY_CACHE_MS = 30 * 1000;
const SYMBOL_RE = /^[A-Z0-9][A-Z0-9.\-]{0,15}$/;
const historyCache = new Map<string, { expiresAt: number; data: HistoryResponse }>();

export function normalizeSymbol(symbol: string, market: Market) {
  const upper = symbol.trim().toUpperCase().replace(/\s+/g, "");
  if (market === "jp" && /^\d{4}$/.test(upper)) return `${upper}.T`;
  return upper;
}

export function validateSymbol(symbol: string) {
  return SYMBOL_RE.test(symbol);
}

export async function getHistory(symbol: string, market: Market, range = "1y"): Promise<HistoryResponse> {
  const normalized = normalizeSymbol(symbol, market);
  if (!validateSymbol(normalized)) throw new Error("symbol format is not supported");
  const provider = process.env.MARKET_DATA_PROVIDER || "";
  const cacheKey = `${provider || "yahoo"}:${market}:${normalized}:${range}`;
  return cachedHistory(cacheKey, async () => {
    if (provider === "polygon" && market === "us" && process.env.POLYGON_API_KEY) {
      return fetchPolygonHistory(normalized, market, range).catch(() => fetchYahooHistory(normalized, market, range).catch(() => mockHistory(normalized, market, range)));
    }
    if (provider === "alpha_vantage" && process.env.ALPHA_VANTAGE_API_KEY) {
      return fetchAlphaVantageHistory(normalized, market, range).catch(() => fetchYahooHistory(normalized, market, range).catch(() => mockHistory(normalized, market, range)));
    }
    return fetchYahooHistory(normalized, market, range).catch(() => mockHistory(normalized, market, range));
  });
}

export async function getQuotes(symbols: string[], market: Market, master: SymbolMasterItem[] = []): Promise<Quote[]> {
  const unique = [...new Set(symbols.map((symbol) => normalizeSymbol(symbol, market)).filter(validateSymbol))].slice(0, 40);
  const histories = await Promise.all(unique.map((symbol) => getHistory(symbol, market, "1y")));
  return histories.map((history) => {
    const item = master.find((row) => row.sym === history.symbol);
    const closes = history.bars.map((bar) => bar.close);
    const last = closes.at(-1) || 0;
    const previous = closes.at(-2) || last;
    return {
      symbol: history.symbol,
      market,
      name: item?.name || item?.nameEn || history.symbol,
      price: last,
      changePct: previous ? ((last / previous) - 1) * 100 : 0,
      currency: history.currency,
      source: history.source,
      updatedAt: history.updatedAt,
    };
  });
}

export function mockHistory(symbol: string, market: Market, range = "1y"): HistoryResponse {
  const days = rangeToDays(range);
  const seed = hash(symbol + market);
  const base = market === "jp" ? 800 + (seed % 9000) : 20 + (seed % 500);
  const volatility = market === "jp" ? 0.018 + (seed % 7) / 1000 : 0.014 + (seed % 9) / 1000;
  const drift = ((seed % 17) - 5) / 100000;
  const bars: PriceBar[] = [];
  let close = base;
  const start = Date.now() - days * DAY_MS;
  for (let index = 0; index < days; index += 1) {
    const date = new Date(start + index * DAY_MS);
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    const wave = Math.sin((index + seed % 30) / 14) * volatility;
    const shock = (pseudoRandom(seed + index) - 0.5) * volatility * 1.8;
    close = Math.max(1, close * (1 + drift + wave + shock));
    const open = close * (1 + (pseudoRandom(seed + index * 3) - 0.5) * volatility);
    const high = Math.max(open, close) * (1 + pseudoRandom(seed + index * 5) * volatility);
    const low = Math.min(open, close) * (1 - pseudoRandom(seed + index * 7) * volatility);
    bars.push({
      time: date.toISOString().slice(0, 10),
      open: round(open),
      high: round(high),
      low: round(low),
      close: round(close),
      volume: Math.round(100_000 + pseudoRandom(seed + index * 11) * 8_000_000),
    });
  }
  return {
    symbol,
    market,
    currency: market === "jp" ? "JPY" : "USD",
    source: "mock",
    updatedAt: new Date().toISOString(),
    bars,
  };
}

async function fetchPolygonHistory(symbol: string, market: Market, range: string): Promise<HistoryResponse> {
  const key = process.env.POLYGON_API_KEY;
  if (!key) throw new Error("POLYGON_API_KEY is not configured");
  const end = new Date();
  const start = new Date(Date.now() - rangeToDays(range) * DAY_MS);
  const url = new URL(`https://api.polygon.io/v2/aggs/ticker/${encodeURIComponent(symbol)}/range/1/day/${ymd(start)}/${ymd(end)}`);
  url.searchParams.set("adjusted", "true");
  url.searchParams.set("sort", "asc");
  url.searchParams.set("limit", "50000");
  url.searchParams.set("apiKey", key);
  const response = await fetch(url, { headers: { "User-Agent": "kabu-web-next/2.0" }, next: { revalidate: 60 } });
  if (!response.ok) throw new Error(`Polygon upstream ${response.status}`);
  const data = await response.json();
  const rows = Array.isArray(data.results) ? data.results : [];
  if (rows.length < 10) throw new Error("Polygon returned insufficient data");
  return {
    symbol,
    market,
    currency: "USD",
    source: "official:polygon",
    updatedAt: new Date().toISOString(),
    bars: rows.map((row: { t: number; o: number; h: number; l: number; c: number; v?: number }) => ({
      time: new Date(row.t).toISOString().slice(0, 10),
      open: row.o,
      high: row.h,
      low: row.l,
      close: row.c,
      volume: row.v || 0,
    })),
  };
}

async function fetchAlphaVantageHistory(symbol: string, market: Market, range: string): Promise<HistoryResponse> {
  const key = process.env.ALPHA_VANTAGE_API_KEY;
  if (!key) throw new Error("ALPHA_VANTAGE_API_KEY is not configured");
  const avSymbol = symbol.endsWith(".T") ? symbol.replace(".T", ".TSE") : symbol;
  const url = new URL("https://www.alphavantage.co/query");
  url.searchParams.set("function", "TIME_SERIES_DAILY_ADJUSTED");
  url.searchParams.set("symbol", avSymbol);
  url.searchParams.set("outputsize", "full");
  url.searchParams.set("apikey", key);
  const response = await fetch(url, { headers: { "User-Agent": "kabu-web-next/2.0" }, next: { revalidate: 300 } });
  if (!response.ok) throw new Error(`Alpha Vantage upstream ${response.status}`);
  const data = await response.json();
  const series = data["Time Series (Daily)"] || {};
  const bars = Object.entries(series)
    .map(([time, value]) => {
      const row = value as Record<string, string>;
      return {
        time,
        open: Number(row["1. open"]),
        high: Number(row["2. high"]),
        low: Number(row["3. low"]),
        close: Number(row["5. adjusted close"] || row["4. close"]),
        volume: Number(row["6. volume"] || 0),
      };
    })
    .filter((bar) => Number.isFinite(bar.close))
    .sort((a, b) => a.time.localeCompare(b.time))
    .slice(-rangeToDays(range));
  if (bars.length < 10) throw new Error("Alpha Vantage returned insufficient data");
  return {
    symbol,
    market,
    currency: market === "jp" ? "JPY" : "USD",
    source: "official:alpha_vantage",
    updatedAt: new Date().toISOString(),
    bars,
  };
}

async function fetchYahooHistory(symbol: string, market: Market, range: string): Promise<HistoryResponse> {
  const url = new URL(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`);
  url.searchParams.set("range", rangeToYahooRange(range));
  url.searchParams.set("interval", "1d");
  url.searchParams.set("events", "history");
  url.searchParams.set("includeAdjustedClose", "true");
  const response = await fetch(url, { headers: { "User-Agent": "kabu-web-next/2.0" }, next: { revalidate: 300 } });
  if (!response.ok) throw new Error(`Yahoo Finance upstream ${response.status}`);
  const data = await response.json();
  const result = data?.chart?.result?.[0];
  const error = data?.chart?.error;
  if (!result || error) throw new Error(error?.description || "Yahoo Finance returned no chart data");
  const timestamps: number[] = Array.isArray(result.timestamp) ? result.timestamp : [];
  const quote = result.indicators?.quote?.[0] || {};
  const adjusted: Array<number | null> = result.indicators?.adjclose?.[0]?.adjclose || [];
  const bars = timestamps
    .map((timestamp, index) => {
      const close = Number(adjusted[index] ?? quote.close?.[index]);
      const open = Number(quote.open?.[index] ?? close);
      const high = Number(quote.high?.[index] ?? close);
      const low = Number(quote.low?.[index] ?? close);
      const volume = Number(quote.volume?.[index] ?? 0);
      return {
        time: new Date(timestamp * 1000).toISOString().slice(0, 10),
        open,
        high,
        low,
        close,
        volume: Number.isFinite(volume) ? volume : 0,
      };
    })
    .filter((bar) => Number.isFinite(bar.close) && Number.isFinite(bar.open) && Number.isFinite(bar.high) && Number.isFinite(bar.low))
    .sort((a, b) => a.time.localeCompare(b.time));
  if (bars.length < 10) throw new Error("Yahoo Finance returned insufficient data");
  return {
    symbol,
    market,
    currency: result.meta?.currency === "JPY" ? "JPY" : market === "jp" ? "JPY" : "USD",
    source: "yahoo",
    updatedAt: new Date().toISOString(),
    bars,
  };
}

async function cachedHistory(key: string, load: () => Promise<HistoryResponse>) {
  const cached = historyCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.data;
  const data = await load();
  historyCache.set(key, {
    data,
    expiresAt: Date.now() + (data.source === "mock" ? MOCK_HISTORY_CACHE_MS : REAL_HISTORY_CACHE_MS),
  });
  return data;
}

function rangeToDays(range: string) {
  const map: Record<string, number> = {
    "1m": 45,
    "3m": 110,
    "6m": 190,
    "1y": 370,
    "3y": 365 * 3,
    "5y": 365 * 5,
    "10y": 365 * 10,
    max: 365 * 12,
  };
  return map[range] || map["1y"];
}

function rangeToYahooRange(range: string) {
  const map: Record<string, string> = {
    "1m": "1mo",
    "3m": "3mo",
    "6m": "6mo",
    "1y": "1y",
    "3y": "3y",
    "5y": "5y",
    "10y": "10y",
    max: "max",
  };
  return map[range] || map["1y"];
}

function ymd(date: Date) {
  return date.toISOString().slice(0, 10);
}

function hash(input: string) {
  let value = 0;
  for (let index = 0; index < input.length; index += 1) {
    value = (value * 31 + input.charCodeAt(index)) >>> 0;
  }
  return value;
}

function pseudoRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
