const TWO_YEARS_MS = 730 * 24 * 60 * 60 * 1000;
const SYMBOL_RE = /^[A-Z0-9][A-Z0-9.\-]{0,15}$/;

function ymd(date) {
  return date.toISOString().slice(0, 10);
}

function json(res, status, body) {
  res.setHeader('Cache-Control', status === 200 ? 's-maxage=60, stale-while-revalidate=300' : 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.status(status).json(body);
}

function normalizeSymbol(symbol) {
  return String(symbol || '').trim().toUpperCase();
}

function validateSymbol(symbol) {
  if (!symbol) return 'symbol is required';
  if (!SYMBOL_RE.test(symbol)) return 'symbol format is not supported';
  return '';
}

async function fetchPolygon(symbol) {
  const key = process.env.POLYGON_API_KEY;
  if (!key) throw new Error('POLYGON_API_KEY is not configured');
  if (symbol.endsWith('.T')) throw new Error('Polygon provider is configured for US symbols only');
  const end = new Date();
  const start = new Date(Date.now() - TWO_YEARS_MS);
  const url = new URL(`https://api.polygon.io/v2/aggs/ticker/${encodeURIComponent(symbol)}/range/1/day/${ymd(start)}/${ymd(end)}`);
  url.searchParams.set('adjusted', 'true');
  url.searchParams.set('sort', 'asc');
  url.searchParams.set('limit', '50000');
  url.searchParams.set('apiKey', key);
  const r = await fetch(url, { headers: { 'User-Agent': 'kabu-web/1.0' } });
  if (!r.ok) throw new Error(`Polygon upstream ${r.status}`);
  const data = await r.json();
  const rows = Array.isArray(data.results) ? data.results : [];
  if (rows.length < 10) throw new Error('Polygon returned insufficient data');
  return {
    dates: rows.map((row) => new Date(row.t).toISOString()),
    closes: rows.map((row) => row.c),
    live: rows.at(-1)?.c,
    liveTime: rows.at(-1)?.t ? new Date(rows.at(-1).t).toISOString() : null,
    marketState: null,
    source: 'official:polygon',
  };
}

async function fetchAlphaVantage(symbol) {
  const key = process.env.ALPHA_VANTAGE_API_KEY;
  if (!key) throw new Error('ALPHA_VANTAGE_API_KEY is not configured');
  const avSymbol = symbol.endsWith('.T') ? symbol.replace('.T', '.TSE') : symbol;
  const url = new URL('https://www.alphavantage.co/query');
  url.searchParams.set('function', 'TIME_SERIES_DAILY_ADJUSTED');
  url.searchParams.set('symbol', avSymbol);
  url.searchParams.set('outputsize', 'full');
  url.searchParams.set('apikey', key);
  const r = await fetch(url, { headers: { 'User-Agent': 'kabu-web/1.0' } });
  if (!r.ok) throw new Error(`Alpha Vantage upstream ${r.status}`);
  const data = await r.json();
  const series = data['Time Series (Daily)'] || {};
  const rows = Object.entries(series)
    .map(([date, value]) => ({ date, close: Number(value['5. adjusted close'] || value['4. close']) }))
    .filter((row) => Number.isFinite(row.close))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-520);
  if (rows.length < 10) throw new Error('Alpha Vantage returned insufficient data');
  return {
    dates: rows.map((row) => `${row.date}T00:00:00.000Z`),
    closes: rows.map((row) => row.close),
    live: rows.at(-1)?.close,
    liveTime: rows.at(-1)?.date ? `${rows.at(-1).date}T00:00:00.000Z` : null,
    marketState: null,
    source: 'official:alpha_vantage',
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { error: 'method not allowed' });
  const symbol = normalizeSymbol(req.query.symbol);
  const symbolError = validateSymbol(symbol);
  if (symbolError) return json(res, 400, { error: symbolError });
  try {
    const provider = process.env.MARKET_DATA_PROVIDER || '';
    if (provider === 'polygon') return json(res, 200, await fetchPolygon(symbol));
    if (provider === 'alpha_vantage') return json(res, 200, await fetchAlphaVantage(symbol));
    return json(res, 501, { error: 'official market data provider is not configured' });
  } catch (error) {
    return json(res, 502, { error: error.message || String(error) });
  }
}
