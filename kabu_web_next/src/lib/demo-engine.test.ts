import { describe, expect, it } from "vitest";
import { createDemoAccount, DEFAULT_ACCOUNT, placeDemoOrder, validateQuantity } from "./demo-engine";
import type { Quote } from "../types/market";

const quote: Quote = {
  symbol: "7203.T",
  market: "jp",
  name: "トヨタ自動車",
  price: 3000,
  changePct: 1.2,
  currency: "JPY",
  source: "mock",
  updatedAt: new Date().toISOString(),
};

describe("demo-engine", () => {
  it("creates a demo account with a custom initial cash amount", () => {
    const account = createDemoAccount(500_000);
    expect(account.cash).toBe(500_000);
    expect(account.initialCash).toBe(500_000);
    expect(account.positions).toHaveLength(0);
    expect(account.orders).toHaveLength(0);
  });

  it("requires 100 shares for normal Japanese stock orders", () => {
    expect(validateQuantity("jp", 1, false)).toContain("100株単位");
    expect(validateQuantity("jp", 100, false)).toBe("");
  });

  it("allows small amount mode and updates cash", () => {
    const result = placeDemoOrder({
      account: DEFAULT_ACCOUNT,
      quote,
      side: "buy",
      quantity: 1,
      smallAmountMode: true,
    });
    expect(result.account.positions).toHaveLength(1);
    expect(result.account.cash).toBeLessThan(DEFAULT_ACCOUNT.cash);
  });
});
