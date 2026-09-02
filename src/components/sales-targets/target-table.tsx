import Link from "next/link";
import type { Route } from "next";
import type { CSSProperties } from "react";
import { ArrowUpRight, Flag, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatJapaneseDate } from "@/lib/constants";
import type { MasterData, SalesTarget } from "@/lib/types";
import { SALES_TARGET_LABELS } from "@/lib/ui-labels";

const targetGridStyle = {
  gridTemplateColumns: "minmax(248px, 1fr) 80px 148px 148px 104px 72px 120px 120px minmax(240px, 1fr) 48px",
} satisfies CSSProperties;

export function TargetTable({ targets, masters, detailHref }: { targets: SalesTarget[]; masters: MasterData; detailHref: (id: string) => Route }) {
  const profileNames = new Map(masters.profiles.map((profile) => [profile.id, profile.name]));
  const typeLabels = new Map(masters.targetTypes.map((type) => [type.key, type.label]));
  const statusMeta = new Map(masters.statuses.map((status) => [status.name, status]));

  if (!targets.length) return <div className="grid min-h-72 place-items-center px-6 text-center"><div><p className="text-sm font-medium">条件に合う営業先はありません</p><p className="mt-1 text-xs text-muted-foreground">検索条件を変更してお試しください。</p></div></div>;

  return (
    <div className="overflow-x-auto">
      <div role="table" aria-label={SALES_TARGET_LABELS.list} aria-rowcount={targets.length + 1} className="w-full min-w-[1328px] text-sm">
        <div role="rowgroup" className="bg-muted/95 text-left text-xs text-muted-foreground">
          <div role="row" className="grid h-10 items-center" style={targetGridStyle}>
            <div role="columnheader" className="px-3 font-medium">営業先</div>
            <div role="columnheader" className="px-3 font-medium">{SALES_TARGET_LABELS.recordType}</div>
            <div role="columnheader" className="px-3 font-medium">地域</div>
            <div role="columnheader" className="px-3 font-medium">電話番号</div>
            <div role="columnheader" className="px-3 font-medium">状態</div>
            <div role="columnheader" className="px-3 font-medium">温度感</div>
            <div role="columnheader" className="px-3 font-medium">営業担当</div>
            <div role="columnheader" className="px-3 font-medium">次回対応日</div>
            <div role="columnheader" className="px-3 font-medium">次回対応</div>
            <div role="columnheader" className="px-3"><span className="sr-only">詳細</span></div>
          </div>
        </div>
        <div role="rowgroup" className="divide-y">
          {targets.map((target) => {
            const status = statusMeta.get(target.status);
            const region = [target.prefecture, target.municipality].filter(Boolean).join(" ") || "-";
            const assignee = target.assigned_user_id ? profileNames.get(target.assigned_user_id) ?? "不明" : "未割当";
            const notes = target.notes?.replace(/\s+/gu, " ").trim() || "-";
            return (
              <div key={target.id} role="row" className="grid min-h-18 items-start bg-card hover:bg-muted/45" style={targetGridStyle}>
                <div role="cell" className="min-w-0 overflow-hidden px-3 py-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <Link href={detailHref(target.id)} scroll={false} title={target.facility_name} className="min-w-0 truncate font-medium hover:underline">{target.facility_name}</Link>
                    {target.notes_important ? <Flag className="size-3.5 shrink-0 fill-warning text-warning" aria-label="重要メモあり" /> : null}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{target.category || target.operator || "-"}</p>
                  <p title={notes} className="truncate text-[11px] text-muted-foreground/75">備考: {notes}</p>
                </div>
                <div role="cell" className="min-w-0 overflow-hidden px-3 py-2"><Badge variant="secondary">{typeLabels.get(target.record_type) ?? target.record_type}</Badge></div>
                <div role="cell" className="min-w-0 overflow-hidden px-3 py-2 text-muted-foreground"><span title={region} className="block truncate">{region}</span></div>
                <div role="cell" className="min-w-0 overflow-hidden px-3 py-2">
                  {target.phone ? <a className="flex min-w-0 max-w-full items-center gap-1.5 hover:underline" href={`tel:${target.phone}`}><Phone className="size-3.5 shrink-0 text-muted-foreground" /><span className="truncate tabular-nums">{target.phone}</span></a> : <span className="text-muted-foreground">-</span>}
                </div>
                <div role="cell" className="min-w-0 overflow-hidden px-3 py-2"><Badge variant="outline" style={status ? { borderColor: status.color, color: status.color } : undefined}>{target.status}</Badge></div>
                <div role="cell" className="min-w-0 overflow-hidden px-3 py-2 font-semibold">{target.temperature}</div>
                <div role="cell" className="min-w-0 overflow-hidden px-3 py-2 text-muted-foreground"><span title={assignee} className="block truncate">{assignee}</span></div>
                <div role="cell" className="min-w-0 overflow-hidden px-3 py-2"><span className={target.next_action_date && target.next_action_date < new Date().toISOString().slice(0, 10) ? "font-medium text-destructive" : ""}>{formatJapaneseDate(target.next_action_date)}</span></div>
                <div role="cell" className="min-w-0 overflow-hidden px-3 py-2 text-muted-foreground"><span title={target.next_action || "-"} className="block truncate">{target.next_action || "-"}</span></div>
                <div role="cell" className="px-2 py-1.5"><Button asChild variant="ghost" size="icon-sm"><Link href={detailHref(target.id)} scroll={false} aria-label={`${target.facility_name}を編集`}><ArrowUpRight className="size-4" /></Link></Button></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
