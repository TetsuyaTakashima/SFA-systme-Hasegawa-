import { Plus, Save } from "lucide-react";
import { saveStatusAction, saveTemperatureAction } from "@/app/(crm)/settings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { StatusOption, TemperatureOption } from "@/lib/types";

export function MastersPanel({ statuses, temperatures }: { statuses: StatusOption[]; temperatures: TemperatureOption[] }) {
  return (
    <div className="grid lg:grid-cols-2 lg:divide-x">
      <section className="p-4"><h2 className="text-sm font-semibold">状態</h2><p className="mt-1 text-xs text-muted-foreground">営業の進捗状態と完了扱いを設定します。</p><div className="mt-4 space-y-2">{statuses.map((item) => <StatusRow key={item.id} item={item} />)}<StatusRow /></div></section>
      <section className="border-t p-4 lg:border-t-0"><h2 className="text-sm font-semibold">温度感</h2><p className="mt-1 text-xs text-muted-foreground">AからEの表示名と色を設定します。</p><div className="mt-4 space-y-2">{temperatures.map((item) => <TemperatureRow key={item.level} item={item} />)}</div></section>
    </div>
  );
}

function StatusRow({ item }: { item?: StatusOption }) {
  return <form action={saveStatusAction} className="grid grid-cols-[1fr_72px_56px_36px] items-center gap-2"><input type="hidden" name="id" value={item?.id ?? ""} /><Input name="name" defaultValue={item?.name ?? ""} placeholder="新しい状態" required /><Input name="sort_order" type="number" min="0" defaultValue={item?.sort_order ?? 99} aria-label="並び順" /><label className="flex items-center justify-center gap-1 text-xs text-muted-foreground"><input type="checkbox" name="is_closed" value="true" defaultChecked={item?.is_closed} className="size-4 accent-primary" />完了</label><div className="flex items-center"><input name="color" type="color" defaultValue={item?.color ?? "#3d7a52"} className="size-8 rounded border bg-transparent p-0.5" aria-label="表示色" /><Button type="submit" variant="ghost" size="icon" aria-label={item ? `${item.name}を保存` : "状態を追加"}>{item ? <Save className="size-4" /> : <Plus className="size-4" />}</Button></div></form>;
}

function TemperatureRow({ item }: { item: TemperatureOption }) {
  return <form action={saveTemperatureAction} className="grid grid-cols-[32px_1fr_72px_72px] items-center gap-2"><input type="hidden" name="level" value={item.level} /><strong>{item.level}</strong><Input name="label" defaultValue={item.label} required /><Input name="sort_order" type="number" min="0" defaultValue={item.sort_order} aria-label="並び順" /><div className="flex items-center"><input name="color" type="color" defaultValue={item.color} className="size-8 rounded border bg-transparent p-0.5" aria-label="表示色" /><Button type="submit" variant="ghost" size="icon" aria-label={`${item.level}を保存`}><Save className="size-4" /></Button></div></form>;
}
