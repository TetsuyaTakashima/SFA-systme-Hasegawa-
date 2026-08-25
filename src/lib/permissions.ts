import type { Profile } from "@/lib/types";

type SalesTargetCreateProfile = Pick<Profile, "active" | "role" | "can_create_sales_targets">;

export function canCreateSalesTargets(profile: SalesTargetCreateProfile) {
  return profile.active && (profile.role === "admin" || profile.can_create_sales_targets);
}

export function canImportSalesTargets(profile: SalesTargetCreateProfile) {
  return canCreateSalesTargets(profile);
}
