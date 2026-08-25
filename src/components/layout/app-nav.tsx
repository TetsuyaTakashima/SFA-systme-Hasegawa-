"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Building2, History, LayoutDashboard, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const items: Array<{ href: "/dashboard" | "/sales-targets" | "/notifications" | "/history" | "/settings"; label: string; icon: typeof LayoutDashboard; adminOnly?: boolean }> = [
  { href: "/dashboard", label: "今日の営業", icon: LayoutDashboard },
  { href: "/sales-targets", label: "営業先一覧", icon: Building2 },
  { href: "/notifications", label: "通知・予定", icon: Bell },
  { href: "/history", label: "対応履歴", icon: History, adminOnly: true },
  { href: "/settings", label: "管理・設定", icon: Settings, adminOnly: true },
];

export function AppNav({ isAdmin, onNavigate }: { isAdmin: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1" aria-label="メインナビゲーション">
      {items.filter((item) => !item.adminOnly || isAdmin).map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
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
            <item.icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
