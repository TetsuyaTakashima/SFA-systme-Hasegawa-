import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getQuotes } from "@/lib/market-data";
import { symbolsForMarket } from "@/lib/symbol-master";

const querySchema = z.object({
  symbols: z.string().min(1),
  market: z.enum(["us", "jp"]).default("us"),
});

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams.entries()));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid query", details: parsed.error.flatten() }, { status: 400 });
  }
  const symbols = parsed.data.symbols.split(",").map((value) => value.trim()).filter(Boolean);
  const master = await symbolsForMarket(parsed.data.market, 500);
  const quotes = await getQuotes(symbols, parsed.data.market, master);
  return NextResponse.json({ quotes }, { headers: { "Cache-Control": "no-store" } });
}
