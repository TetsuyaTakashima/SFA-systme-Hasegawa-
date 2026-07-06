import { describe, expect, it } from "vitest";
import { forecastFromBars, rankCandidates } from "./analytics";
import type { PriceBar } from "../types/market";

function bars(symbolBias = 1): PriceBar[] {
  return Array.from({ length: 140 }, (_, index) => {
    const close = 100 + index * symbolBias + Math.sin(index / 8) * 3;
    return {
      time: new Date(2025, 0, index + 1).toISOString().slice(0, 10),
      open: close - 1,
      high: close + 2,
      low: close - 2,
      close,
      volume: 1000000,
    };
  });
}

describe("analytics", () => {
  it("returns forecast reasons for a price history", () => {
    const forecast = forecastFromBars(bars());
    expect(forecast.horizonDays).toBe(30);
    expect(forecast.reasons.length).toBeGreaterThanOrEqual(3);
    expect(Number.isFinite(forecast.expectedPct)).toBe(true);
  });

  it("ranks candidates with stable ranks", () => {
    const candidates = rankCandidates("us", [
      { sym: "AAA", name: "A", sector: "Tech" },
      { sym: "BBB", name: "B", sector: "Tech" },
    ], {
      AAA: bars(1.1),
      BBB: bars(0.2),
    });
    expect(candidates[0].rank).toBe(1);
    expect(candidates[0].score).toBeGreaterThan(candidates[1].score);
  });
});
