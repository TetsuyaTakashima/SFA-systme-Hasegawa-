import { describe, expect, it } from "vitest";
import { parseSalesTargetFilters } from "@/lib/sales-target-filters";

describe("parseSalesTargetFilters", () => {
  it("keeps multiple selected statuses", () => {
    const filters = parseSalesTargetFilters({ status: ["未着手", "提案中"], page: "2" });
    expect(filters.statuses).toEqual(["未着手", "提案中"]);
    expect(filters.page).toBe(2);
  });

  it("normalizes unsafe search punctuation and bounded paging", () => {
    const filters = parseSalesTargetFilters({ q: "  東京*(学校),  ", page: "-2", pageSize: "1000" });
    expect(filters.search).toBe("東京 学校");
    expect(filters.page).toBe(1);
    expect(filters.pageSize).toBe(50);
  });

  it("falls back to safe sort and visibility values", () => {
    const filters = parseSalesTargetFilters({ sort: "drop table", visibility: "private" });
    expect(filters.sort).toBe("nextAction");
    expect(filters.visibility).toBe("visible");
  });
});
