// Vercel Serverless Function: Yahoo Finance APIプロキシ
// ブラウザのCORS制約を回避し、不安定な公開プロキシへの依存をなくします。
// 使い方: /api/proxy?url=<encodeURIComponentしたYahooのURL>
export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'url parameter required' });

  let target;
  try {
    target = new URL(url);
  } catch {
    return res.status(400).json({ error: 'invalid url' });
  }

  // SSRF対策: Yahoo Financeのみ許可
  if (!/^query[12]\.finance\.yahoo\.com$/.test(target.hostname)) {
    return res.status(403).json({ error: 'host not allowed' });
  }

  try {
    const r = await fetch(target.toString(), {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; kabu-system/1.0)' },
    });
    if (!r.ok) return res.status(r.status).json({ error: 'upstream ' + r.status });
    const json = await r.json();
    // CDNで60秒キャッシュ（同じ銘柄への連続アクセスを高速化＆Yahoo負荷軽減）
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json(json);
  } catch (e) {
    return res.status(502).json({ error: String(e) });
  }
}
