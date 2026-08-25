"use client";

import { useState } from "react";
import { Building2, Menu } from "lucide-react";
import { AppNav } from "@/components/layout/app-nav";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function MobileNav({ isAdmin, canImport }: { isAdmin: boolean; canImport: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="メニューを開く"><Menu className="size-5" /></Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 bg-sidebar p-0 text-sidebar-foreground">
        <SheetHeader className="border-b border-sidebar-border px-5 py-5">
          <SheetTitle className="flex items-center gap-3 text-sidebar-foreground">
            <span className="grid size-9 place-items-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground"><Building2 className="size-4" /></span>
            営業管理
          </SheetTitle>
        </SheetHeader>
        <div className="p-3"><AppNav isAdmin={isAdmin} canImport={canImport} onNavigate={() => setOpen(false)} /></div>
      </SheetContent>
    </Sheet>
  );
}
