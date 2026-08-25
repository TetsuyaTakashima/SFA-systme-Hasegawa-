import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FilePlus2, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/constants";
import { requireAdmin, getProfileDirectory } from "@/lib/auth";
import { getAuditHistory } from "@/lib/data/history";

export const metadata: Metadata = { title: "対応履歴" };

const fieldLabels: Record<string, string> = {
  facility_name: "営業先名", record_type: "種別", assigned_user_id: "営業担当", status: "状態", temperature: "温度感",
  next_action_date: "次回対応日", next_action: "次回対応", notes: "メモ", phone: "電話番号", is_hidden: "表示設定",
};

export default async function HistoryPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const [history, profiles] = await Promise.all([getAuditHistory(page), getProfileDirectory()]);
  const profileNames = new Map(profiles.map((profile) => [profile.id, profile.name]));
  const pages = Math.max(1, Math.ceil(history.total / history.pageSize));

  return (
    <>
      <PageHeader title="対応履歴" description="営業先とユーザー設定の変更履歴です。" />
      <section className="overflow-hidden rounded-md border bg-card shadow-xs">
        <div className="overflow-x-auto">
          <table className="data-grid w-full min-w-[900px] text-sm">
            <thead className="bg-muted/60 text-left text-xs text-muted-foreground"><tr><th className="h-10 px-4 font-medium">日時</th><th className="px-4 font-medium">操作</th><th className="px-4 font-medium">対象</th><th className="px-4 font-medium">変更項目</th><th className="px-4 font-medium">操作ユーザー</th><th className="w-12 px-4" /></tr></thead>
            <tbody className="divide-y">
              {history.events.map((event) => {
                const source = event.after_data ?? event.before_data ?? {};
                const name = String(source.facility_name ?? source.name ?? (event.entity_type === "profiles" ? "ユーザー" : "名称未設定"));
                const Icon = event.action === "insert" ? FilePlus2 : event.action === "delete" ? Trash2 : Pencil;
                const actionLabel = event.action === "insert" ? "追加" : event.action === "delete" ? "削除" : "更新";
                return (
                  <tr key={event.id} className="h-12 hover:bg-muted/45">
                    <td className="px-4 tabular-nums text-muted-foreground">{formatDateTime(event.created_at)}</td>
                    <td className="px-4"><Badge variant="outline"><Icon className="size-3" />{actionLabel}</Badge></td>
                    <td className="max-w-72 truncate px-4 font-medium">{name}</td>
                    <td className="max-w-96 truncate px-4 text-muted-foreground">{event.changed_fields.length ? event.changed_fields.map((field) => fieldLabels[field] ?? field).join("、") : "-"}</td>
                    <td className="px-4 text-muted-foreground">{event.actor_id ? profileNames.get(event.actor_id) ?? "不明" : "システム"}</td>
                    <td className="px-4">{event.entity_type === "venues" && event.action !== "delete" ? <Button asChild variant="ghost" size="icon-sm"><Link href={`/sales-targets?target=${event.entity_id}`} aria-label={`${name}を開く`}><ArrowRight className="size-4" /></Link></Button> : null}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t px-4 py-3 text-sm"><span className="text-muted-foreground">{history.total.toLocaleString()}件</span><div className="flex items-center gap-2"><Button asChild variant="outline" size="sm" aria-disabled={page <= 1}><Link href={`/history?page=${Math.max(1, page - 1)}`}>前へ</Link></Button><span className="min-w-16 text-center tabular-nums text-muted-foreground">{page} / {pages}</span><Button asChild variant="outline" size="sm" aria-disabled={page >= pages}><Link href={`/history?page=${Math.min(pages, page + 1)}`}>次へ</Link></Button></div></div>
      </section>
    </>
  );
}
