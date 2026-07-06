import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getHistory } from "@/lib/market-data";

const querySchema = z.object({
  symbol: z.string().min(1).max(16),
  market: z.enum(["us", "jp"]).default("us"),
  range: z.enum(["1m", "3m", "6m", "1y", "3y", "5y", "10y", "max"]).default("1y"),
});

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams.entries()));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid query", details: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const data = await getHistory(parsed.data.symbol, parsed.data.market, parsed.data.range);
    return NextResponse.json(data, {
      headers: { "Cache-Control": data.source === "mock" ? "no-store" : "s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 502 });
  }
}
