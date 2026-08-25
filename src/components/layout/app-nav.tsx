"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Building2, History, LayoutDashboard, Settings, Upload } from "lucide-react";
import { SALES_TARGET_LABELS } from "@/lib/ui-labels";
import { cn } from "@/lib/utils";

const items: Array<{ href: "/dashboard" | "/sales-targets" | "/notifications" | "/history" | "/settings" | "/settings?tab=import"; activePath?: string; label: string; icon: typeof LayoutDashboard; adminOnly?: boolean; importOnly?: boolean }> = [
  { href: "/dashboard", label: "今日の営業", icon: LayoutDashboard },
  { href: "/sales-targets", label: SALES_TARGET_LABELS.list, icon: Building2 },
  { href: "/notifications", label: "通知・予定", icon: Bell },
  { href: "/history", label: "対応履歴", icon: History, adminOnly: true },
  { href: "/settings", label: "管理・設定", icon: Settings, adminOnly: true },
  { href: "/settings?tab=import", activePath: "/settings", label: "CSV取り込み", icon: Upload, importOnly: true },
];

export function AppNav({ isAdmin, canImport, onNavigate }: { isAdmin: boolean; canImport: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1" aria-label="メインナビゲーション">
      {items.filter((item) => (!item.adminOnly || isAdmin) && (!item.importOnly || (!isAdmin && canImport))).map((item) => {
        const activePath = item.activePath ?? item.href;
        const active = pathname === activePath || pathname.startsWith(`${activePath}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/72 hover:bg-sidebar-accent/65 hover:text-sidebar-foreground",
            )}
            aria-current={active ? "page" : undefined}
          >
            <span className="grid size-5 shrink-0 place-items-center"><item.icon className="size-4" /></span>
            <span className="min-w-0 truncate leading-none">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
