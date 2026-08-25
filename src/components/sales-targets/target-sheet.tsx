"use client";

import { useActionState, useEffect, useTransition } from "react";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ExternalLink, LoaderCircle, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteSalesTargetAction, updateSalesTargetAction } from "@/app/(crm)/sales-targets/actions";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { MasterData, SalesTarget } from "@/lib/types";

export function TargetSheet({ target, masters, isAdmin }: { target: SalesTarget | null; masters: MasterData; isAdmin: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const action = target ? updateSalesTargetAction.bind(null, target.id, target.lock_version) : updateSalesTargetAction.bind(null, "", 0);
  const [state, formAction, pending] = useActionState(action, {});
  const [deleting, startDelete] = useTransition();

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
      router.refresh();
    }
    if (state.conflict) router.refresh();
  }, [router, state]);

  function close() {
    const next = new URLSearchParams(searchParams.toString());
    next.delete("target");
    router.push(`${pathname}?${next.toString()}` as Route, { scroll: false });
  }

  function deleteTarget() {
    if (!target) return;
    startDelete(async () => {
      const result = await deleteSalesTargetAction(target.id);
      if (result.error) toast.error(result.error);
      else { toast.success(result.success); close(); router.refresh(); }
    });
  }

  return (
    <Sheet open={Boolean(target)} onOpenChange={(open) => { if (!open) close(); }}>
      <SheetContent side="right" className="w-full gap-0 overflow-hidden p-0 sm:max-w-2xl">
        {target ? (
          <form action={formAction} className="flex min-h-0 flex-1 flex-col">
            <SheetHeader className="border-b px-5 py-4 pr-12">
              <SheetTitle className="truncate text-base">{target.facility_name}</SheetTitle>
              <SheetDescription>営業先情報と対応状況を編集します。</SheetDescription>
            </SheetHeader>
            <Tabs defaultValue="sales" className="min-h-0 flex-1 gap-0">
              <div className="border-b px-5 pt-3">
                <TabsList variant="line" className="w-full justify-start">
                  <TabsTrigger value="sales">営業状況</TabsTrigger>
                  <TabsTrigger value="contact">連絡先</TabsTrigger>
                  <TabsTrigger value="details">基本情報</TabsTrigger>
                </TabsList>
              </div>
              <div className="h-[calc(100vh-210px)] overflow-y-auto px-5 py-5">
                <TabsContent value="sales" className="mt-0 space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <SelectField label="状態" name="status" value={target.status} items={masters.statuses.map((item) => ({ value: item.name, label: item.name }))} />
                    <SelectField label="温度感" name="temperature" value={target.temperature} items={masters.temperatures.map((item) => ({ value: item.level, label: `${item.level} · ${item.label}` }))} />
                    {isAdmin ? (
                      <SelectField label="営業担当" name="assigned_user_id" value={target.assigned_user_id ?? "__none"} items={[{ value: "__none", label: "未割当" }, ...masters.profiles.filter((item) => item.active).map((item) => ({ value: item.id, label: item.name }))]} />
                    ) : <input type="hidden" name="assigned_user_id" value={target.assigned_user_id ?? ""} />}
                    <Field label="最終連絡日" name="last_contact_date" type="date" value={target.last_contact_date} />
                    <Field label="検討時期" name="consideration_date" type="date" value={target.consideration_date} />
                    <Field label="次回対応日" name="next_action_date" type="date" value={target.next_action_date} />
                    <Field label="通知（日前）" name="notification_lead_days" type="number" value={target.notification_lead_days} min="0" max="365" />
                  </div>
                  <Field label="次回対応" name="next_action" value={target.next_action} />
                  <div className="space-y-2"><Label htmlFor="notes">メモ</Label><Textarea id="notes" name="notes" defaultValue={target.notes ?? ""} rows={7} /></div>
                  <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" name="notes_important" value="true" defaultChecked={target.notes_important} className="size-4 accent-primary" />重要メモとして表示</label>
                </TabsContent>

                <TabsContent value="contact" className="mt-0 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="電話番号" name="phone" value={target.phone} inputMode="tel" />
                    <Field label="FAX" name="fax" value={target.fax} inputMode="tel" />
                    <Field label="メール" name="email" type="email" value={target.email} />
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="website">Webサイト</Label>
                      <div className="flex gap-2"><Input id="website" name="website" type="url" defaultValue={target.website ?? ""} /><Button asChild variant="outline" size="icon" disabled={!target.website}><a href={target.website ?? "#"} target="_blank" rel="noreferrer" aria-label="Webサイトを開く"><ExternalLink className="size-4" /></a></Button></div>
                    </div>
                    <Field label="部署" name="department" value={target.department} />
                    <Field label="担当者名" name="contact_name" value={target.contact_name} />
                  </div>
                </TabsContent>

                <TabsContent value="details" className="mt-0 space-y-4">
                  <Field label="営業先名" name="facility_name" value={target.facility_name} required />
                  <div className="grid gap-4 sm:grid-cols-2">
                    {isAdmin ? (
                      <SelectField label="種別" name="record_type" value={target.record_type} items={masters.targetTypes.map((item) => ({ value: item.key, label: item.label }))} />
                    ) : <input type="hidden" name="record_type" value={target.record_type} />}
                    <Field label="区分・カテゴリ" name="category" value={target.category} />
                    <Field label="運営主体" name="operator" value={target.operator} />
                    <Field label="都道府県" name="prefecture" value={target.prefecture} list="prefecture-options" />
                    <Field label="市区町村" name="municipality" value={target.municipality} />
                    <div className="sm:col-span-2"><Field label="住所" name="address" value={target.address} /></div>
                    <Field label="主ホール名" name="main_hall_name" value={target.main_hall_name} />
                    <Field label="総席数" name="seat_count" type="number" value={target.seat_count} min="0" />
                    <Field label="大ホール席数" name="large_hall_seats" type="number" value={target.large_hall_seats} min="0" />
                    <Field label="中ホール席数" name="medium_hall_seats" type="number" value={target.medium_hall_seats} min="0" />
                    <Field label="小ホール席数" name="small_hall_seats" type="number" value={target.small_hall_seats} min="0" />
                    <Field label="ジャンル" name="genres" value={target.genres} />
                    <SelectField label="自主事業方針" name="program_policy" value={target.program_policy} items={["○", "△", "×"].map((value) => ({ value, label: value }))} />
                  </div>
                  {isAdmin ? <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" name="is_hidden" value="true" defaultChecked={target.is_hidden} className="size-4 accent-primary" />一覧で非表示にする</label> : null}
                  <datalist id="prefecture-options">{masters.prefectures.map((value) => <option key={value} value={value} />)}</datalist>
                </TabsContent>
              </div>
            </Tabs>
            <div className="border-t bg-background px-5 py-3">
              {state.error ? <Alert variant="destructive" className="mb-3"><AlertDescription>{state.error}</AlertDescription></Alert> : null}
              <div className="flex items-center justify-between gap-2">{isAdmin ? <AlertDialog><AlertDialogTrigger asChild><Button type="button" variant="ghost" className="text-destructive hover:text-destructive"><Trash2 className="size-4" />削除</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{target.facility_name}を削除しますか？</AlertDialogTitle><AlertDialogDescription>対応履歴を含めて元に戻せません。非表示で残す場合は、基本情報から表示設定を変更してください。</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>キャンセル</AlertDialogCancel><AlertDialogAction onClick={deleteTarget} disabled={deleting}>削除</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog> : <span />}<div className="flex gap-2"><Button type="button" variant="outline" onClick={close}>閉じる</Button><Button type="submit" disabled={pending}>{pending ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}{pending ? "保存中..." : "保存"}</Button></div></div>
            </div>
          </form>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, name, value, ...props }: { label: string; name: string; value: string | number | null; [key: string]: unknown }) {
  return <div className="space-y-2"><Label htmlFor={name}>{label}</Label><Input id={name} name={name} defaultValue={value ?? ""} {...props} /></div>;
}

function SelectField({ label, name, value, items }: { label: string; name: string; value: string; items: { value: string; label: string }[] }) {
  return <div className="space-y-2"><Label>{label}</Label><Select name={name} defaultValue={value}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{items.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent></Select></div>;
}
