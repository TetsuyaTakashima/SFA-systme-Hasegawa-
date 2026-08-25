import Link from "next/link";
import type { Route } from "next";
import { ArrowUpRight, Flag, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatJapaneseDate } from "@/lib/constants";
import type { MasterData, SalesTarget } from "@/lib/types";

export function TargetTable({ targets, masters, detailHref }: { targets: SalesTarget[]; masters: MasterData; detailHref: (id: string) => Route }) {
  const profileNames = new Map(masters.profiles.map((profile) => [profile.id, profile.name]));
  const typeLabels = new Map(masters.targetTypes.map((type) => [type.key, type.label]));
  const statusMeta = new Map(masters.statuses.map((status) => [status.name, status]));

  if (!targets.length) return <div className="grid min-h-72 place-items-center px-6 text-center"><div><p className="text-sm font-medium">条件に合う営業先はありません</p><p className="mt-1 text-xs text-muted-foreground">検索条件を変更してお試しください。</p></div></div>;

  return (
    <div className="overflow-x-auto">
      <table className="data-grid w-full min-w-[1180px] text-sm">
        <thead className="sticky top-16 z-10 bg-muted/95 text-left text-xs text-muted-foreground backdrop-blur">
          <tr><th className="h-10 px-3 font-medium">営業先</th><th className="px-3 font-medium">種別</th><th className="px-3 font-medium">地域</th><th className="px-3 font-medium">電話番号</th><th className="px-3 font-medium">状態</th><th className="px-3 font-medium">温度感</th><th className="px-3 font-medium">営業担当</th><th className="px-3 font-medium">次回対応日</th><th className="px-3 font-medium">次回対応</th><th className="w-12 px-3"><span className="sr-only">詳細</span></th></tr>
        </thead>
        <tbody className="divide-y">
          {targets.map((target) => {
            const status = statusMeta.get(target.status);
            return (
              <tr key={target.id} className="h-12 bg-card hover:bg-muted/45">
                <td className="max-w-72 px-3"><div className="flex items-center gap-2"><Link href={detailHref(target.id)} className="truncate font-medium hover:underline">{target.facility_name}</Link>{target.notes_important ? <Flag className="size-3.5 shrink-0 fill-warning text-warning" aria-label="重要メモあり" /> : null}</div><p className="truncate text-xs text-muted-foreground">{target.category || target.operator || "-"}</p></td>
                <td className="px-3"><Badge variant="secondary">{typeLabels.get(target.record_type) ?? target.record_type}</Badge></td>
                <td className="max-w-52 truncate px-3 text-muted-foreground">{[target.prefecture, target.municipality].filter(Boolean).join(" ") || "-"}</td>
                <td className="px-3">{target.phone ? <a className="inline-flex items-center gap-1.5 hover:underline" href={`tel:${target.phone}`}><Phone className="size-3.5 text-muted-foreground" />{target.phone}</a> : <span className="text-muted-foreground">-</span>}</td>
                <td className="px-3"><Badge variant="outline" style={status ? { borderColor: status.color, color: status.color } : undefined}>{target.status}</Badge></td>
                <td className="px-3 font-semibold">{target.temperature}</td>
                <td className="px-3 text-muted-foreground">{target.assigned_user_id ? profileNames.get(target.assigned_user_id) ?? "不明" : "未割当"}</td>
                <td className="px-3"><span className={target.next_action_date && target.next_action_date < new Date().toISOString().slice(0, 10) ? "font-medium text-destructive" : ""}>{formatJapaneseDate(target.next_action_date)}</span></td>
                <td className="max-w-72 truncate px-3 text-muted-foreground">{target.next_action || "-"}</td>
                <td className="px-3"><Button asChild variant="ghost" size="icon-sm"><Link href={detailHref(target.id)} aria-label={`${target.facility_name}を編集`}><ArrowUpRight className="size-4" /></Link></Button></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
