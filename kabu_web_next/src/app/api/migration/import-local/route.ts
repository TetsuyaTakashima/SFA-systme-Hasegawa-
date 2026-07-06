import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  market: z.enum(["us", "jp"]),
  watchlist: z.array(z.unknown()).default([]),
  demoAccount: z.unknown().optional(),
});

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid migration payload", details: parsed.error.flatten() }, { status: 400 });
  }
  // v2初版では未ログイン時のローカル移行確認用。Supabase接続後はServer ActionでDB保存へ拡張する。
  return NextResponse.json({
    accepted: true,
    market: parsed.data.market,
    watchlistCount: parsed.data.watchlist.length,
  });
}
