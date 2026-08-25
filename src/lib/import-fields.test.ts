import { describe, expect, it } from "vitest";
import { resolveImportPrefecture } from "@/lib/import-fields";

describe("resolveImportPrefecture", () => {
  it("uses the CSV value when no prefecture is selected", () => {
    expect(resolveImportPrefecture("東京都", "")).toBe("東京都");
  });

  it("applies the selected prefecture to every row", () => {
    expect(resolveImportPrefecture("東京都", "大阪府")).toBe("大阪府");
    expect(resolveImportPrefecture("", "大阪府")).toBe("大阪府");
  });

  it("trims imported values", () => {
    expect(resolveImportPrefecture("  福岡県  ")).toBe("福岡県");
  });
});
