import { NextRequest } from "next/server";
import { requireProfile } from "@/lib/auth";
import { getSalesTargetPage } from "@/lib/data/sales-targets";
import { parseSalesTargetFilters } from "@/lib/sales-target-filters";

function escapeCsv(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\r\n]/u.test(text) ? `"${text.replace(/"/gu, '""')}"` : text;
}

export async function GET(request: NextRequest) {
  const profile = await requireProfile();
  const rawParams: Record<string, string | string[]> = {};
  for (const key of new Set(request.nextUrl.searchParams.keys())) {
    const values = request.nextUrl.searchParams.getAll(key);
    rawParams[key] = values.length > 1 ? values : values[0] ?? "";
  }
  const filters = parseSalesTargetFilters(rawParams);
  filters.pageSize = 100;
  const rows = [];
  let total = 0;
  for (let page = 1; page <= 100; page += 1) {
    const result = await getSalesTargetPage({ ...filters, page }, profile.id);
    total = result.total;
    rows.push(...result.targets);
    if (rows.length >= total || !result.targets.length) break;
  }

  const columns = [
    ["営業先名", "facility_name"], ["種別", "record_type"], ["カテゴリ", "category"], ["運営主体", "operator"],
    ["都道府県", "prefecture"], ["市区町村", "municipality"], ["住所", "address"], ["電話番号", "phone"],
    ["FAX", "fax"], ["メール", "email"], ["Webサイト", "website"], ["部署", "department"], ["担当者名", "contact_name"],
    ["状態", "status"], ["温度感", "temperature"], ["最終連絡日", "last_contact_date"], ["次回対応日", "next_action_date"],
    ["次回対応", "next_action"], ["メモ", "notes"], ["更新日時", "updated_at"],
  ] as const;
  const csv = [columns.map(([label]) => escapeCsv(label)).join(","), ...rows.map((row) => columns.map(([, key]) => escapeCsv(row[key])).join(","))].join("\r\n");
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");

  return new Response(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="sales-targets-${date}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
