// Vercel Serverless Function: Yahoo Finance APIプロキシ
// ブラウザのCORS制約を回避し、不安定な公開プロキシへの依存をなくします。
// 使い方: /api/proxy?url=<encodeURIComponentしたYahooのURL>
const ALLOWED_HOSTS = new Set([
  'query1.finance.yahoo.com',
  'query2.finance.yahoo.com',
]);

function setCommonHeaders(req, res) {
  const origin = req.headers?.origin || '';
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '';
  if (allowedOrigin && origin === allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-Content-Type-Options', 'nosniff');
}

export default async function handler(req, res) {
  setCommonHeaders(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'method not allowed' });

  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'url parameter required' });
  if (String(url).length > 2048) return res.status(414).json({ error: 'url too long' });

  let target;
  try {
    target = new URL(url);
  } catch {
    return res.status(400).json({ error: 'invalid url' });
  }

  // SSRF対策: Yahoo Financeのみ許可
  if (
    target.protocol !== 'https:' ||
    target.username ||
    target.password ||
    (target.port && target.port !== '443') ||
    !ALLOWED_HOSTS.has(target.hostname)
  ) {
    return res.status(403).json({ error: 'host not allowed' });
  }

  try {
    const r = await fetch(target.toString(), {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; kabu-system/1.0)' },
      redirect: 'manual',
    });
    if (r.status >= 300 && r.status < 400) {
      return res.status(502).json({ error: 'upstream redirect blocked' });
    }
    if (!r.ok) return res.status(r.status).json({ error: 'upstream ' + r.status });
    const json = await r.json();
    // CDNで60秒キャッシュ（同じ銘柄への連続アクセスを高速化＆Yahoo負荷軽減）
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json(json);
  } catch (e) {
    return res.status(502).json({ error: String(e) });
  }
}
