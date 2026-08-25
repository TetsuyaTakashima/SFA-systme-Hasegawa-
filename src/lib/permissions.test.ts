import { describe, expect, it } from "vitest";
import { canCreateSalesTargets } from "@/lib/permissions";

describe("canCreateSalesTargets", () => {
  it("always permits active administrators", () => {
    expect(canCreateSalesTargets({ active: true, role: "admin", can_create_sales_targets: false })).toBe(true);
  });

  it("permits only delegated active staff", () => {
    expect(canCreateSalesTargets({ active: true, role: "staff", can_create_sales_targets: true })).toBe(true);
    expect(canCreateSalesTargets({ active: true, role: "staff", can_create_sales_targets: false })).toBe(false);
  });

  it("rejects inactive users even when delegated", () => {
    expect(canCreateSalesTargets({ active: false, role: "staff", can_create_sales_targets: true })).toBe(false);
    expect(canCreateSalesTargets({ active: false, role: "admin", can_create_sales_targets: true })).toBe(false);
  });
});
