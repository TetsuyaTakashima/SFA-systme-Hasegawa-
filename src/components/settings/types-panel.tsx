import { Plus, Save } from "lucide-react";
import { saveTargetTypeAction } from "@/app/(crm)/settings/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SalesTargetType } from "@/lib/types";

export function TypesPanel({ targetTypes }: { targetTypes: SalesTargetType[] }) {
  if (!targetTypes.length) return <div className="p-5"><Alert><AlertTitle>データベース更新待ち</AlertTitle><AlertDescription>営業先種別を自由に追加するためのマイグレーションを適用すると、ここで設定できます。</AlertDescription></Alert></div>;
  return <section className="p-4"><h2 className="text-sm font-semibold">営業先種別</h2><p className="mt-1 text-xs text-muted-foreground">施設・学校に加えて、今後の営業方針に応じた種別を追加できます。</p><div className="mt-4 max-w-3xl space-y-2">{targetTypes.map((item) => <TypeRow key={item.key} item={item} />)}<TypeRow /></div></section>;
}

function TypeRow({ item }: { item?: SalesTargetType }) {
  return <form action={saveTargetTypeAction} className="grid grid-cols-[150px_1fr_72px_64px_36px] items-center gap-2"><input type="hidden" name="original_key" value={item?.key ?? ""} /><Input name="key" defaultValue={item?.key ?? ""} placeholder="key" pattern="[a-z0-9_-]+" readOnly={Boolean(item)} required /><Input name="label" defaultValue={item?.label ?? ""} placeholder="表示名" required /><Input name="sort_order" type="number" min="0" defaultValue={item?.sort_order ?? 99} aria-label="並び順" /><label className="flex items-center gap-1 text-xs text-muted-foreground"><input type="checkbox" name="active" value="true" defaultChecked={item?.active ?? true} className="size-4 accent-primary" />有効</label><Button type="submit" variant="ghost" size="icon" aria-label={item ? `${item.label}を保存` : "種別を追加"}>{item ? <Save className="size-4" /> : <Plus className="size-4" />}</Button></form>;
}
