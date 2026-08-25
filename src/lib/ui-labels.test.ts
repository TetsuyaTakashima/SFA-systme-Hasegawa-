import { describe, expect, it } from "vitest";
import { SALES_TARGET_LABELS } from "@/lib/ui-labels";

describe("sales target labels", () => {
  it("keeps the list title and record classification terminology stable", () => {
    expect(SALES_TARGET_LABELS.list).toBe("営業先一覧");
    expect(SALES_TARGET_LABELS.recordType).toBe("区分");
    expect(SALES_TARGET_LABELS.category).toBe("種別");
    expect(SALES_TARGET_LABELS.recordType).not.toBe(SALES_TARGET_LABELS.category);
  });

  it("uses the established contact terminology", () => {
    expect(SALES_TARGET_LABELS.operator).toBe("管理運営機関");
    expect(SALES_TARGET_LABELS.department).toBe("担当部署");
    expect(SALES_TARGET_LABELS.contactName).toBe("先方担当者");
  });
});
