"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function Pagination({ page, pageSize, total }: { page: number; pageSize: number; total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total ? (page - 1) * pageSize + 1 : 0;
  const to = Math.min(page * pageSize, total);

  function update(values: Record<string, string>) {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(values).forEach(([key, value]) => next.set(key, value));
    router.push(`${pathname}?${next.toString()}` as Route, { scroll: false });
  }

  return (
    <div className="flex flex-col gap-3 border-t bg-card px-3 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-muted-foreground"><span className="font-medium text-foreground tabular-nums">{from.toLocaleString()}–{to.toLocaleString()}</span> / {total.toLocaleString()}件</p>
      <div className="flex items-center gap-2">
        <Select value={String(pageSize)} onValueChange={(value) => update({ pageSize: value, page: "1" })}>
          <SelectTrigger className="w-24" aria-label="1ページの表示件数"><SelectValue /></SelectTrigger>
          <SelectContent>{[25, 50, 100].map((size) => <SelectItem key={size} value={String(size)}>{size}件</SelectItem>)}</SelectContent>
        </Select>
        <span className="min-w-20 text-center tabular-nums text-muted-foreground">{page} / {pages}</span>
        <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => update({ page: String(page - 1) })} aria-label="前のページ"><ChevronLeft className="size-4" /></Button>
        <Button variant="outline" size="icon" disabled={page >= pages} onClick={() => update({ page: String(page + 1) })} aria-label="次のページ"><ChevronRight className="size-4" /></Button>
      </div>
    </div>
  );
}
