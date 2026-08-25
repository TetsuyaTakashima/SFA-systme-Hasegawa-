"use client";

import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="表示テーマを変更">
          <Sun className="size-4 dark:hidden" />
          <Moon className="hidden size-4 dark:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}><Sun className="size-4" />ライト</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}><Moon className="size-4" />ダーク</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}><Laptop className="size-4" />システム</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
