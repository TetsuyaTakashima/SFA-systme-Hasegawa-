export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(200).json({
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
    officialProvider: process.env.MARKET_DATA_PROVIDER || '',
    officialProviderReady: !!(
      (process.env.MARKET_DATA_PROVIDER === 'polygon' && process.env.POLYGON_API_KEY) ||
      (process.env.MARKET_DATA_PROVIDER === 'alpha_vantage' && process.env.ALPHA_VANTAGE_API_KEY)
    ),
  });
}
