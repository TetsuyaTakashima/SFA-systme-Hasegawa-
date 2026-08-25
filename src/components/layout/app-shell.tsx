import Link from "next/link";
import { Bell, Building2, LogOut } from "lucide-react";
import { logoutAction } from "@/app/login/actions";
import { AppNav } from "@/components/layout/app-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/lib/types";

export function AppShell({ profile, children }: { profile: Profile; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
          <span className="grid size-9 place-items-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground"><Building2 className="size-4" /></span>
          <div className="min-w-0"><p className="truncate text-sm font-semibold">営業管理</p><p className="truncate text-[11px] text-sidebar-foreground/55">長谷川音楽事務所</p></div>
        </div>
        <div className="flex-1 p-3"><AppNav isAdmin={profile.role === "admin"} /></div>
        <div className="border-t border-sidebar-border p-3">
          <div className="mb-2 px-3 py-2">
            <div className="flex items-center gap-2"><p className="truncate text-sm font-medium">{profile.name}</p>{profile.role === "admin" ? <Badge variant="secondary" className="text-[10px]">管理者</Badge> : null}</div>
            <p className="mt-0.5 truncate text-xs text-sidebar-foreground/55">{profile.login_id}</p>
          </div>
          <form action={logoutAction}>
            <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground">
              <LogOut className="size-4" />ログアウト
            </Button>
          </form>
        </div>
      </aside>
      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:px-6">
          <div className="flex items-center gap-2"><MobileNav isAdmin={profile.role === "admin"} /><span className="text-sm font-medium lg:hidden">営業管理</span></div>
          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="icon"><Link href="/notifications" aria-label="通知"><Bell className="size-4" /></Link></Button>
            <ThemeToggle />
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1680px] px-4 py-5 md:px-6 md:py-6">{children}</main>
      </div>
    </div>
  );
}
