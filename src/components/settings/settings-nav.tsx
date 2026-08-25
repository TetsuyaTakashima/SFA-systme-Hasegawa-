import Link from "next/link";
import { cn } from "@/lib/utils";

const tabs = [
  { key: "import", label: "CSV取り込み" },
  { key: "users", label: "ユーザー" },
  { key: "masters", label: "状態・温度感" },
  { key: "types", label: "営業先種別" },
] as const;

export function SettingsNav({ active }: { active: string }) {
  return <nav className="flex gap-1 overflow-x-auto border-b" aria-label="管理設定">{tabs.map((tab) => <Link key={tab.key} href={`/settings?tab=${tab.key}`} className={cn("border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap", active === tab.key ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>{tab.label}</Link>)}</nav>;
}
