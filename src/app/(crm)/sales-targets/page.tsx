import type { Metadata } from "next";
import type { Route } from "next";
import { Download } from "lucide-react";
import { CreateTargetDialog } from "@/components/sales-targets/create-target-dialog";
import { FilterBar } from "@/components/sales-targets/filter-bar";
import { Pagination } from "@/components/sales-targets/pagination";
import { TargetSheet } from "@/components/sales-targets/target-sheet";
import { TargetTable } from "@/components/sales-targets/target-table";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { requireProfile } from "@/lib/auth";
import { getMasterData } from "@/lib/data/masters";
import { getSalesTarget, getSalesTargetPage } from "@/lib/data/sales-targets";
import { canCreateSalesTargets } from "@/lib/permissions";
import { parseSalesTargetFilters } from "@/lib/sales-target-filters";
import { SALES_TARGET_LABELS } from "@/lib/ui-labels";

export const metadata: Metadata = { title: SALES_TARGET_LABELS.list };

type Params = Record<string, string | string[] | undefined>;

export default async function SalesTargetsPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const profile = await requireProfile();
  const filters = parseSalesTargetFilters(params);
  const selectedId = Array.isArray(params.target) ? params.target[0] : params.target;
  const [masters, pageData, selectedTarget] = await Promise.all([
    getMasterData(),
    getSalesTargetPage(filters, profile.id),
    getSalesTarget(selectedId),
  ]);
  const baseParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (key === "target") return;
    (Array.isArray(value) ? value : value ? [value] : []).forEach((item) => baseParams.append(key, item));
  });
  const detailHref = (id: string): Route => {
    const next = new URLSearchParams(baseParams);
    next.set("target", id);
    return `/sales-targets?${next.toString()}` as Route;
  };

  return (
    <>
      <PageHeader
        title={SALES_TARGET_LABELS.list}
        description={`${pageData.total.toLocaleString()}件の営業先を検索・編集できます。`}
        actions={<><Button asChild variant="outline"><a href={`/api/export?${baseParams.toString()}`}><Download className="size-4" />CSV出力</a></Button>{canCreateSalesTargets(profile) ? <CreateTargetDialog masters={masters} /> : null}</>}
      />
      <section className="overflow-hidden rounded-md border bg-card shadow-xs">
        <FilterBar masters={masters} isAdmin={profile.role === "admin"} />
        <TargetTable targets={pageData.targets} masters={masters} detailHref={detailHref} />
        <Pagination page={filters.page} pageSize={filters.pageSize} total={pageData.total} />
      </section>
      <TargetSheet key={selectedTarget ? `${selectedTarget.id}-${selectedTarget.lock_version}` : "empty"} target={selectedTarget} masters={masters} isAdmin={profile.role === "admin"} />
    </>
  );
}
