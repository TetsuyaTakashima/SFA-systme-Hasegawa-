import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowRight, CalendarClock, CircleUserRound, Flag } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatJapaneseDate } from "@/lib/constants";
import { getDashboardData } from "@/lib/data/dashboard";
import { requireProfile } from "@/lib/auth";

export const metadata: Metadata = { title: "今日の営業" };

export default async function DashboardPage() {
  const profile = await requireProfile();
  const data = await getDashboardData(profile.id);

  const stats = [
    { label: "担当営業先", value: data.assignedCount, icon: CircleUserRound, tone: "text-info" },
    { label: "期限超過", value: data.overdueCount, icon: AlertTriangle, tone: "text-destructive" },
    { label: "重要メモ", value: data.importantCount, icon: Flag, tone: "text-warning" },
  ];

  return (
    <>
      <PageHeader
        title={`おはようございます、${profile.name}さん`}
        description="今日対応する営業先を確認しましょう。"
        actions={<Button asChild><Link href="/sales-targets"><ArrowRight className="size-4" />営業先一覧</Link></Button>}
      />

      <section className="grid gap-3 sm:grid-cols-3" aria-label="営業状況の集計">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-md border bg-card px-4 py-4 shadow-xs">
            <div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{stat.label}</p><stat.icon className={`size-4 ${stat.tone}`} /></div>
            <p className="mt-3 text-2xl font-semibold tabular-nums">{stat.value.toLocaleString()}<span className="ml-1 text-xs font-normal text-muted-foreground">件</span></p>
          </div>
        ))}
      </section>

      <section className="mt-5 overflow-hidden rounded-md border bg-card shadow-xs">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div><h2 className="text-sm font-semibold">今日までの対応予定</h2><p className="mt-0.5 text-xs text-muted-foreground">期限の早い順に最大20件</p></div>
          <Badge variant={data.dueTargets.length ? "default" : "secondary"}>{data.dueTargets.length}件</Badge>
        </div>
        {data.dueTargets.length ? (
          <div className="overflow-x-auto">
            <table className="data-grid w-full text-sm">
              <thead className="bg-muted/60 text-left text-xs text-muted-foreground">
                <tr><th className="h-10 px-4 font-medium">予定日</th><th className="px-4 font-medium">営業先</th><th className="px-4 font-medium">地域</th><th className="px-4 font-medium">状態</th><th className="px-4 font-medium">温度感</th><th className="px-4 font-medium">次回対応</th><th className="w-12 px-4"><span className="sr-only">詳細</span></th></tr>
              </thead>
              <tbody className="divide-y">
                {data.dueTargets.map((target) => (
                  <tr key={target.id} className="h-12 hover:bg-muted/45">
                    <td className="px-4 font-medium"><span className="inline-flex items-center gap-2"><CalendarClock className="size-4 text-muted-foreground" />{formatJapaneseDate(target.next_action_date)}</span></td>
                    <td className="max-w-72 truncate px-4 font-medium">{target.facility_name}</td>
                    <td className="px-4 text-muted-foreground">{[target.prefecture, target.municipality].filter(Boolean).join(" ") || "-"}</td>
                    <td className="px-4"><Badge variant="outline">{target.status}</Badge></td>
                    <td className="px-4"><span className="font-semibold">{target.temperature}</span></td>
                    <td className="max-w-80 truncate px-4 text-muted-foreground">{target.next_action || "未設定"}</td>
                    <td className="px-4"><Button asChild variant="ghost" size="icon-sm"><Link href={`/sales-targets?target=${target.id}`} aria-label={`${target.facility_name}の詳細`}><ArrowRight className="size-4" /></Link></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid min-h-56 place-items-center px-6 text-center"><div><CalendarClock className="mx-auto size-8 text-muted-foreground/55" /><p className="mt-3 text-sm font-medium">今日までの予定はありません</p><p className="mt-1 text-xs text-muted-foreground">新しい次回対応日を設定すると、ここに表示されます。</p></div></div>
        )}
      </section>
    </>
  );
}
