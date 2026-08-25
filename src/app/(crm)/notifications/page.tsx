import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarClock, Save } from "lucide-react";
import { saveNotificationPreferences } from "@/app/(crm)/notifications/actions";
import { BrowserNotificationButton } from "@/components/notifications/browser-notification-button";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatJapaneseDate } from "@/lib/constants";
import { requireProfile } from "@/lib/auth";
import { getNotificationData } from "@/lib/data/notifications";

export const metadata: Metadata = { title: "通知・予定" };

export default async function NotificationsPage() {
  const profile = await requireProfile();
  const { preferences, targets } = await getNotificationData(profile);
  return <><PageHeader title="通知・予定" description="近日の営業予定と通知方法を設定します。" actions={<BrowserNotificationButton />} />
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
      <section className="overflow-hidden rounded-md border bg-card shadow-xs"><div className="flex items-center justify-between border-b px-4 py-3"><div><h2 className="text-sm font-semibold">近日の営業予定</h2><p className="mt-0.5 text-xs text-muted-foreground">{preferences.notification_lead_days}日以内</p></div><Badge>{targets.length}件</Badge></div>{targets.length ? <div className="divide-y">{targets.map((target) => <Link key={target.id} href={`/sales-targets?target=${target.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/45"><CalendarClock className="size-4 shrink-0 text-muted-foreground" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{target.facility_name}</p><p className="truncate text-xs text-muted-foreground">{target.next_action || "次回対応は未入力"}</p></div><span className="text-xs tabular-nums text-muted-foreground">{formatJapaneseDate(target.next_action_date)}</span><ArrowRight className="size-4 text-muted-foreground" /></Link>)}</div> : <div className="grid min-h-52 place-items-center text-sm text-muted-foreground">通知対象の予定はありません。</div>}</section>
      <section className="rounded-md border bg-card p-4 shadow-xs"><h2 className="text-sm font-semibold">通知設定</h2><form action={saveNotificationPreferences} className="mt-4 space-y-4"><label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" name="enabled" value="true" defaultChecked={preferences.notification_enabled} className="size-4 accent-primary" />アプリ内の通知を有効にする</label><div className="grid grid-cols-2 gap-3"><div className="space-y-2"><Label htmlFor="lead-days">一覧表示（日以内）</Label><Input id="lead-days" name="leadDays" type="number" min="0" max="365" defaultValue={preferences.notification_lead_days} /></div><div className="space-y-2"><Label htmlFor="popup-days">ブラウザ通知（日以内）</Label><Input id="popup-days" name="popupLeadDays" type="number" min="0" max="365" defaultValue={preferences.notification_popup_lead_days} /></div></div><SettingSelect name="displayMode" label="表示方法" value={preferences.notification_display_mode} items={[{ value: "badge", label: "バッジ" }, { value: "badgeDays", label: "バッジ＋残日数" }, { value: "days", label: "残日数" }, { value: "date", label: "日付" }]} />{profile.role === "admin" ? <SettingSelect name="scope" label="通知範囲" value={preferences.notification_scope} items={[{ value: "assigned", label: "自分の担当" }, { value: "all", label: "すべて" }]} /> : <input type="hidden" name="scope" value="assigned" />}<SettingSelect name="dismissCondition" label="通知を解除する条件" value={preferences.notification_dismiss_condition} items={[{ value: "nextActionDate", label: "次回対応日の変更" }, { value: "status", label: "状態の変更" }, { value: "either", label: "どちらかの変更" }]} /><Button type="submit" className="w-full"><Save className="size-4" />設定を保存</Button></form></section>
    </div></>;
}

function SettingSelect({ name, label, value, items }: { name: string; label: string; value: string; items: { value: string; label: string }[] }) { return <div className="space-y-2"><Label>{label}</Label><Select name={name} defaultValue={value}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{items.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent></Select></div>; }
