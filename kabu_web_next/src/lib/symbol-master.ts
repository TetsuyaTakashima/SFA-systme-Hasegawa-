import fs from "node:fs/promises";
import path from "node:path";
import type { Market, SymbolMasterItem } from "@/types/market";

type SymbolMasterFile = {
  us: SymbolMasterItem[];
  jp: SymbolMasterItem[];
  meta?: unknown;
};

let cache: SymbolMasterFile | null = null;

export async function loadSymbolMaster() {
  if (cache) return cache;
  const file = path.join(process.cwd(), "public", "data", "symbol-master.json");
  const raw = await fs.readFile(file, "utf8");
  const parsed = JSON.parse(raw) as SymbolMasterFile;
  cache = {
    us: Array.isArray(parsed.us) ? parsed.us : [],
    jp: Array.isArray(parsed.jp) ? parsed.jp : [],
    meta: parsed.meta,
  };
  return cache;
}

export async function symbolsForMarket(market: Market, limit = 80) {
  const master = await loadSymbolMaster();
  return (market === "jp" ? master.jp : master.us).slice(0, limit);
}

export async function findSymbols(market: Market, query = "", limit = 40) {
  const master = await loadSymbolMaster();
  const rows = market === "jp" ? master.jp : master.us;
  const needle = normalizeSearch(query);
  if (!needle) return rows.slice(0, limit);
  return rows
    .map((item) => ({ item, score: scoreSymbol(item, needle) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((row) => row.item);
}

function scoreSymbol(item: SymbolMasterItem, needle: string) {
  const sym = normalizeSearch(item.sym);
  const name = normalizeSearch(item.name || "");
  const nameEn = normalizeSearch(item.nameEn || "");
  if (sym === needle) return 100;
  if (sym.startsWith(needle)) return 80;
  if (name.startsWith(needle) || nameEn.startsWith(needle)) return 60;
  if (name.includes(needle) || nameEn.includes(needle) || sym.includes(needle)) return 35;
  return 0;
}

function normalizeSearch(value: string) {
  return value.toLowerCase().replace(/\s+/g, "");
}
