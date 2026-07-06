import { afterEach, describe, expect, it, vi } from "vitest";
import { getHistory } from "./market-data";

const originalFetch = globalThis.fetch;
const originalProvider = process.env.MARKET_DATA_PROVIDER;

afterEach(() => {
  vi.restoreAllMocks();
  globalThis.fetch = originalFetch;
  if (originalProvider == null) {
    delete process.env.MARKET_DATA_PROVIDER;
  } else {
    process.env.MARKET_DATA_PROVIDER = originalProvider;
  }
});

describe("market-data", () => {
  it("uses Yahoo chart data as the real-data fallback", async () => {
    process.env.MARKET_DATA_PROVIDER = "";
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      chart: {
        result: [{
          meta: { currency: "USD", symbol: "AAPL" },
          timestamp: [
            1_700_000_000,
            1_700_086_400,
            1_700_172_800,
            1_700_259_200,
            1_700_345_600,
            1_700_432_000,
            1_700_518_400,
            1_700_604_800,
            1_700_691_200,
            1_700_777_600,
          ],
          indicators: {
            quote: [{
              open: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
              high: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
              low: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
              close: [10.5, 11.5, 12.5, 13.5, 14.5, 15.5, 16.5, 17.5, 18.5, 19.5],
              volume: [100, 110, 120, 130, 140, 150, 160, 170, 180, 190],
            }],
            adjclose: [{ adjclose: [10.4, 11.4, 12.4, 13.4, 14.4, 15.4, 16.4, 17.4, 18.4, 19.4] }],
          },
        }],
        error: null,
      },
    }), { status: 200 }));

    const history = await getHistory("AAPL", "us", "1m");
    const requestedUrl = String(fetchMock.mock.calls[0]?.[0]);

    expect(requestedUrl).toContain("query1.finance.yahoo.com");
    expect(requestedUrl).toContain("range=1mo");
    expect(history.source).toBe("yahoo");
    expect(history.currency).toBe("USD");
    expect(history.bars).toHaveLength(10);
    expect(history.bars[0].close).toBe(10.4);
  });
});
