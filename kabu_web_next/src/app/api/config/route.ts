import { NextResponse } from "next/server";

export function GET() {
  const provider = process.env.MARKET_DATA_PROVIDER || "";
  return NextResponse.json({
    supabaseReady: Boolean(
      (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) &&
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY),
    ),
    officialProvider: provider,
    officialProviderReady: Boolean(
      (provider === "polygon" && process.env.POLYGON_API_KEY) ||
      (provider === "alpha_vantage" && process.env.ALPHA_VANTAGE_API_KEY),
    ),
  }, {
    headers: { "Cache-Control": "no-store" },
  });
}
