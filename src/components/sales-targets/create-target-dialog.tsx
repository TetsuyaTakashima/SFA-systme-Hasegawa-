"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Plus } from "lucide-react";
import { toast } from "sonner";
import { createSalesTargetAction } from "@/app/(crm)/sales-targets/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { MasterData } from "@/lib/types";

export function CreateTargetDialog({ masters }: { masters: MasterData }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(createSalesTargetAction, {});
  const router = useRouter();

  useEffect(() => {
    if (!state.success) return;
    toast.success(state.success);
    queueMicrotask(() => setOpen(false));
    router.push(state.id ? `/sales-targets?target=${state.id}` : "/sales-targets");
  }, [router, state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus className="size-4" />営業先を追加</Button></DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form action={action}>
          <DialogHeader><DialogTitle>営業先を追加</DialogTitle><DialogDescription>まず基本項目を登録します。詳細は登録後に編集できます。</DialogDescription></DialogHeader>
          <div className="space-y-4 py-5">
            <div className="space-y-2"><Label htmlFor="new-facility-name">営業先名</Label><Input id="new-facility-name" name="facility_name" required autoFocus /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>種別</Label><Select name="record_type" defaultValue={masters.targetTypes[0]?.key ?? "facility"}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{masters.targetTypes.map((item) => <SelectItem key={item.key} value={item.key}>{item.label}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="new-prefecture">都道府県</Label><Input id="new-prefecture" name="prefecture" list="new-prefectures" /><datalist id="new-prefectures">{masters.prefectures.map((value) => <option key={value} value={value} />)}</datalist></div>
            </div>
            <div className="space-y-2"><Label>初期状態</Label><Select name="status" defaultValue={masters.statuses[0]?.name ?? "未着手"}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{masters.statuses.map((item) => <SelectItem key={item.id} value={item.name}>{item.name}</SelectItem>)}</SelectContent></Select></div>
            {state.error ? <Alert variant="destructive"><AlertDescription>{state.error}</AlertDescription></Alert> : null}
          </div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>キャンセル</Button><Button type="submit" disabled={pending}>{pending ? <LoaderCircle className="size-4 animate-spin" /> : <Plus className="size-4" />}{pending ? "追加中..." : "追加"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
