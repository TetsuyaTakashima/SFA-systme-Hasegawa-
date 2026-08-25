import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CsvImportPanel, ImportCoverage } from "@/components/settings/csv-import-panel";
import { MastersPanel } from "@/components/settings/masters-panel";
import { SettingsNav } from "@/components/settings/settings-nav";
import { TypesPanel } from "@/components/settings/types-panel";
import { UsersPanel } from "@/components/settings/users-panel";
import { PageHeader } from "@/components/layout/page-header";
import { requireProfile } from "@/lib/auth";
import { DEFAULT_TARGET_TYPES, PREFECTURES } from "@/lib/constants";
import { getImportCoverage, getImportTargetTypes, getSettingsData } from "@/lib/data/settings";
import { canImportSalesTargets } from "@/lib/permissions";

export const metadata: Metadata = { title: "管理・設定" };

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const profile = await requireProfile();
  const { tab = "import" } = await searchParams;
  const isAdmin = profile.role === "admin";
  if (!isAdmin && (!canImportSalesTargets(profile) || tab !== "import")) redirect("/dashboard");

  const data = isAdmin ? await getSettingsData() : null;
  const availableTargetTypes = data?.targetTypes ?? await getImportTargetTypes();
  const targetTypes = availableTargetTypes.length ? availableTargetTypes : [...DEFAULT_TARGET_TYPES];
  const coverage = tab === "import" ? await getImportCoverage() : [];

  return (
    <>
      <PageHeader
        title={isAdmin ? "管理・設定" : "CSV取り込み"}
        description={isAdmin ? "CSV取り込みとマスターデータを管理します。" : "営業先データをCSVから追加・更新します。"}
      />
      <section className="overflow-hidden rounded-md border bg-card shadow-xs">
        {isAdmin ? <SettingsNav active={tab} /> : null}
        {isAdmin && data && tab === "users" ? <UsersPanel profiles={data.profiles} currentUserId={profile.id} /> : null}
        {isAdmin && data && tab === "masters" ? <MastersPanel statuses={data.statuses} temperatures={data.temperatures} /> : null}
        {isAdmin && data && tab === "types" ? <TypesPanel targetTypes={data.targetTypes} /> : null}
        {tab === "import" ? <><CsvImportPanel targetTypes={targetTypes} prefectures={[...PREFECTURES]} /><ImportCoverage coverage={coverage} prefectures={[...PREFECTURES]} targetTypes={targetTypes} /></> : null}
      </section>
    </>
  );
}
