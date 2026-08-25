"use client";

import { useEffect, useState, useTransition } from "react";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronDown, FilterX, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { MasterData } from "@/lib/types";

export function FilterBar({ masters, isAdmin }: { masters: MasterData; isAdmin: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [isPending, startTransition] = useTransition();
  const selectedStatuses = searchParams.getAll("status");

  function replaceParam(key: string, value: string | string[]) {
    const next = new URLSearchParams(searchParams.toString());
    next.delete(key);
    for (const item of Array.isArray(value) ? value : value ? [value] : []) next.append(key, item);
    next.delete("page");
    startTransition(() => router.replace(`${pathname}?${next.toString()}` as Route, { scroll: false }));
  }

  useEffect(() => {
    const current = searchParams.get("q") ?? "";
    if (search === current) return;
    const timer = window.setTimeout(() => replaceParam("q", search.trim()), 350);
    return () => window.clearTimeout(timer);
    // replaceParam intentionally reads the current URL at execution time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function toggleStatus(name: string, checked: boolean) {
    const next = checked
      ? [...new Set([...selectedStatuses, name])]
      : selectedStatuses.filter((status) => status !== name);
    replaceParam("status", next);
  }

  const hasFilters = ["q", "status", "prefecture", "assignee", "temperature", "type", "visibility"].some((key) => searchParams.has(key));

  return (
    <div className="border-b bg-card px-3 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1 md:max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="営業先名・電話番号・住所を検索" className="pl-9" aria-label="営業先を検索" />
          {isPending ? <span className="absolute top-1/2 right-3 size-2 -translate-y-1/2 animate-pulse rounded-full bg-primary" /> : null}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="min-w-28 justify-between">状態{selectedStatuses.length ? ` (${selectedStatuses.length})` : ""}<ChevronDown className="size-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>複数選択できます</DropdownMenuLabel><DropdownMenuSeparator />
            {masters.statuses.map((status) => (
              <DropdownMenuCheckboxItem key={status.id} checked={selectedStatuses.includes(status.name)} onCheckedChange={(checked) => toggleStatus(status.name, checked === true)} onSelect={(event) => event.preventDefault()}>
                <span className="mr-2 size-2 rounded-full" style={{ backgroundColor: status.color }} />{status.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <FilterSelect label="種別" value={searchParams.get("type") ?? "all"} onChange={(value) => replaceParam("type", value === "all" ? "" : value)} items={masters.targetTypes.map((type) => ({ value: type.key, label: type.label }))} />
        <FilterSelect label="都道府県" value={searchParams.get("prefecture") ?? "all"} onChange={(value) => replaceParam("prefecture", value === "all" ? "" : value)} items={masters.prefectures.map((value) => ({ value, label: value }))} />
        <FilterSelect label="営業担当" value={searchParams.get("assignee") ?? "all"} onChange={(value) => replaceParam("assignee", value === "all" ? "" : value)} items={[{ value: "current", label: "自分の担当" }, { value: "unassigned", label: "未割当" }, ...masters.profiles.filter((profile) => profile.active).map((profile) => ({ value: profile.id, label: profile.name }))]} />
        <FilterSelect label="温度感" value={searchParams.get("temperature") ?? "all"} onChange={(value) => replaceParam("temperature", value === "all" ? "" : value)} items={masters.temperatures.map((item) => ({ value: item.level, label: `${item.level} · ${item.label}` }))} />
        <FilterSelect label="並び順" value={searchParams.get("sort") ?? "nextAction"} onChange={(value) => replaceParam("sort", value === "nextAction" ? "" : value)} items={[{ value: "nextAction", label: "次回対応日" }, { value: "updated", label: "更新が新しい順" }, { value: "name", label: "営業先名" }, { value: "prefecture", label: "都道府県" }, { value: "temperature", label: "温度感" }]} noAll />
        {isAdmin ? <FilterSelect label="表示" value={searchParams.get("visibility") ?? "visible"} onChange={(value) => replaceParam("visibility", value === "visible" ? "" : value)} items={[{ value: "visible", label: "表示中" }, { value: "hidden", label: "非表示" }, { value: "all", label: "すべて" }]} noAll /> : null}

        {hasFilters ? (
          <Button variant="ghost" size="icon" aria-label="検索条件をクリア" onClick={() => { setSearch(""); startTransition(() => router.replace(pathname as Route)); }}><FilterX className="size-4" /></Button>
        ) : null}
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, items, noAll = false }: { label: string; value: string; onChange: (value: string) => void; items: { value: string; label: string }[]; noAll?: boolean }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-auto min-w-28" aria-label={label}><SelectValue placeholder={label} /></SelectTrigger>
      <SelectContent>{noAll ? null : <SelectItem value="all">{label}: すべて</SelectItem>}{items.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}{value === item.value ? <Check className="ml-auto size-3" /> : null}</SelectItem>)}</SelectContent>
    </Select>
  );
}
