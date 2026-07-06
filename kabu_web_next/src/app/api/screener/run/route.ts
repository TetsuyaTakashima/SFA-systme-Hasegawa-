import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getHistory } from "@/lib/market-data";
import { rankCandidates } from "@/lib/analytics";
import { findSymbols, symbolsForMarket } from "@/lib/symbol-master";

const bodySchema = z.object({
  market: z.enum(["us", "jp"]).default("us"),
  query: z.string().max(80).optional().default(""),
  sector: z.string().max(80).optional().default(""),
  limit: z.number().int().min(5).max(80).optional().default(30),
});

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid request", details: parsed.error.flatten() }, { status: 400 });
  }
  const { market, query, sector, limit } = parsed.data;
  const base = query ? await findSymbols(market, query, 120) : await symbolsForMarket(market, 120);
  const universe = sector ? base.filter((item) => item.sector === sector) : base;
  const sample = universe.slice(0, Math.max(limit * 2, 40));
  const historyPairs = await Promise.all(sample.map(async (item) => [item.sym, (await getHistory(item.sym, market, "1y")).bars] as const));
  const histories = Object.fromEntries(historyPairs);
  return NextResponse.json({
    candidates: rankCandidates(market, sample, histories, limit),
    universeCount: universe.length,
    searchedCount: sample.length,
  }, { headers: { "Cache-Control": "no-store" } });
}
