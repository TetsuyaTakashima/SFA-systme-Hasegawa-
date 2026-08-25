import type { Metadata } from "next";
import { CsvImportPanel, ImportCoverage } from "@/components/settings/csv-import-panel";
import { MastersPanel } from "@/components/settings/masters-panel";
import { SettingsNav } from "@/components/settings/settings-nav";
import { TypesPanel } from "@/components/settings/types-panel";
import { UsersPanel } from "@/components/settings/users-panel";
import { PageHeader } from "@/components/layout/page-header";
import { requireAdmin } from "@/lib/auth";
import { DEFAULT_TARGET_TYPES, PREFECTURES } from "@/lib/constants";
import { getImportCoverage, getSettingsData } from "@/lib/data/settings";

export const metadata: Metadata = { title: "管理・設定" };

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const profile = await requireAdmin();
  const { tab = "import" } = await searchParams;
  const data = await getSettingsData();
  const targetTypes = data.targetTypes.length ? data.targetTypes : [...DEFAULT_TARGET_TYPES];
  const coverage = tab === "import" ? await getImportCoverage() : [];

  return (
    <>
      <PageHeader title="管理・設定" description="CSV取り込みとマスターデータを管理します。" />
      <section className="overflow-hidden rounded-md border bg-card shadow-xs">
        <SettingsNav active={tab} />
        {tab === "users" ? <UsersPanel profiles={data.profiles} currentUserId={profile.id} /> : null}
        {tab === "masters" ? <MastersPanel statuses={data.statuses} temperatures={data.temperatures} /> : null}
        {tab === "types" ? <TypesPanel targetTypes={data.targetTypes} /> : null}
        {tab === "import" ? <><CsvImportPanel targetTypes={targetTypes} prefectures={[...PREFECTURES]} /><ImportCoverage coverage={coverage} prefectures={[...PREFECTURES]} targetTypes={targetTypes} /></> : null}
      </section>
    </>
  );
}
