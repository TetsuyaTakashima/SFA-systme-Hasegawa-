import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { placeDemoOrder } from "@/lib/demo-engine";

const bodySchema = z.object({
  account: z.object({
    cash: z.number(),
    initialCash: z.number(),
    positions: z.array(z.object({
      symbol: z.string(),
      market: z.enum(["us", "jp"]),
      name: z.string(),
      quantity: z.number(),
      averageCost: z.number(),
    })),
    orders: z.array(z.any()),
  }),
  quote: z.object({
    symbol: z.string(),
    market: z.enum(["us", "jp"]),
    name: z.string(),
    price: z.number(),
    changePct: z.number(),
    currency: z.enum(["USD", "JPY"]),
    source: z.any(),
    updatedAt: z.string(),
  }),
  side: z.enum(["buy", "sell"]),
  quantity: z.number(),
  note: z.string().optional(),
  smallAmountMode: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid request", details: parsed.error.flatten() }, { status: 400 });
  }
  try {
    return NextResponse.json(placeDemoOrder(parsed.data));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 422 });
  }
}
