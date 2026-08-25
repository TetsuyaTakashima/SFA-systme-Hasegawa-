import { NextRequest } from "next/server";
import { z } from "zod";
import { requireProfile } from "@/lib/auth";
import { PREFECTURES } from "@/lib/constants";
import { resolveImportPrefecture } from "@/lib/import-fields";
import { canImportSalesTargets } from "@/lib/permissions";
import { createClient } from "@/lib/supabase/server";

const requestSchema = z.object({
  rows: z.array(z.record(z.string(), z.unknown())).min(1).max(250),
  recordType: z.string().trim().min(1).max(50),
  prefecture: z.union([z.enum(PREFECTURES), z.literal("")]).optional(),
  mergeDuplicates: z.boolean().default(true),
});

const aliases: Record<string, string[]> = {
  facility_name: ["営業先名", "施設名", "学校名", "会館名", "ホール名", "劇場名", "名称", "name", "facility", "venue"],
  category: ["カテゴリ", "種別", "分類", "施設種別", "category", "type"],
  operator: ["管理運営機関", "運営主体", "運営者", "指定管理者", "operator"],
  prefecture: ["都道府県", "都道府県名", "県名", "prefecture", "pref"], municipality: ["市区町村", "自治体", "市町村", "municipality", "city"],
  address: ["住所", "所在地", "address"], phone: ["電話番号", "電話", "tel", "phone"], fax: ["fax", "fax番号", "ファックス"],
  email: ["メールアドレス", "アドレス", "メール", "email", "mail"], website: ["webサイト", "ホームページ", "website", "url"],
  department: ["担当部署", "部署", "department"], contact_name: ["先方担当者", "担当者名", "担当者", "contact", "person"],
  main_hall_name: ["主ホール名", "主ホール", "main hall"], seat_count: ["客席数", "座席数", "席数", "capacity", "seats"],
  large_hall_seats: ["大ホール席数", "大席数"], medium_hall_seats: ["中ホール席数", "中席数"], small_hall_seats: ["小ホール席数", "小席数"],
  genres: ["得意ジャンル", "ジャンル", "公演ジャンル", "genres"], program_policy: ["自主事業", "主催事業", "program"],
  status: ["営業状況", "ステータス", "状態", "status"], temperature: ["温度感", "優先度", "評価", "ランク", "priority", "rank"],
  last_contact_date: ["最終接触日", "最終連絡日"], consideration_date: ["検討時期", "検討日"], next_action_date: ["次回対応日", "次回連絡日", "次回架電日"],
  notification_lead_days: ["通知日数", "通知日前"], next_action: ["次回アクション", "次の対応"], notes: ["メモ", "備考", "営業メモ", "notes"],
};

function normalize(value: string) { return value.toLowerCase().replace(/[\s_・/\-()（）]/gu, ""); }
function value(row: Record<string, unknown>, field: string) {
  const source = Object.entries(row).find(([header]) => aliases[field]?.some((alias) => normalize(header).includes(normalize(alias))));
  return String(source?.[1] ?? "").trim();
}
function textOrNull(input: string) { return input || null; }
function numberOrNull(input: string) { const parsed = Number.parseInt(input.replace(/[^0-9]/gu, ""), 10); return Number.isFinite(parsed) ? parsed : null; }
function dateOrNull(input: string) { const normalized = input.replace(/[/.]/gu, "-"); return /^\d{4}-\d{1,2}-\d{1,2}$/u.test(normalized) ? normalized.split("-").map((part, index) => index ? part.padStart(2, "0") : part).join("-") : null; }

export async function POST(request: NextRequest) {
  const profile = await requireProfile();
  if (!canImportSalesTargets(profile)) return Response.json({ error: "CSVを取り込む権限がありません。" }, { status: 403 });
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "CSVデータの形式を確認してください。" }, { status: 400 });
  const supabase = await createClient();
  const now = new Date().toISOString();
  const incoming = parsed.data.rows.map((row) => ({ row, name: value(row, "facility_name") })).filter((item) => item.name);
  if (!incoming.length) return Response.json({ error: "営業先名に対応する列が見つかりません。" }, { status: 400 });

  const existingByKey = new Map<string, { id: string; lock_version: number }>();
  if (parsed.data.mergeDuplicates) {
    const names = [...new Set(incoming.map((item) => item.name))];
    const { data, error } = await supabase.from("venues").select("id,facility_name,prefecture,municipality,lock_version").in("facility_name", names);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    for (const item of data ?? []) existingByKey.set(`${item.facility_name}\u0000${item.prefecture ?? ""}\u0000${item.municipality ?? ""}`, item);
  }

  const venueRows = incoming.map(({ row, name }) => {
    const prefecture = resolveImportPrefecture(value(row, "prefecture"), parsed.data.prefecture);
    const municipality = value(row, "municipality");
    const existing = existingByKey.get(`${name}\u0000${prefecture}\u0000${municipality}`);
    const temperature = value(row, "temperature").toUpperCase();
    const policy = value(row, "program_policy");
    return {
      id: existing?.id ?? crypto.randomUUID(), expected_lock_version: existing?.lock_version ?? null,
      facility_name: name, record_type: parsed.data.recordType, category: textOrNull(value(row, "category")), operator: textOrNull(value(row, "operator")),
      prefecture: textOrNull(prefecture), municipality: textOrNull(municipality), address: textOrNull(value(row, "address")), phone: textOrNull(value(row, "phone")),
      fax: textOrNull(value(row, "fax")), email: textOrNull(value(row, "email")), website: textOrNull(value(row, "website")), department: textOrNull(value(row, "department")),
      contact_name: textOrNull(value(row, "contact_name")), main_hall_name: textOrNull(value(row, "main_hall_name")), seat_count: numberOrNull(value(row, "seat_count")),
      large_hall_seats: numberOrNull(value(row, "large_hall_seats")), medium_hall_seats: numberOrNull(value(row, "medium_hall_seats")), small_hall_seats: numberOrNull(value(row, "small_hall_seats")),
      genres: textOrNull(value(row, "genres")), program_policy: ["○", "△", "×"].includes(policy) ? policy : "△", status: value(row, "status") || "未着手",
      temperature: ["A", "B", "C", "D", "E"].includes(temperature) ? temperature : "B", is_hidden: false, assigned_user_id: profile.role === "admin" ? profile.id : null,
      last_contact_date: dateOrNull(value(row, "last_contact_date")), consideration_date: dateOrNull(value(row, "consideration_date")), next_action_date: dateOrNull(value(row, "next_action_date")),
      notification_lead_days: numberOrNull(value(row, "notification_lead_days")), next_action: textOrNull(value(row, "next_action")), notes: textOrNull(value(row, "notes")), notes_important: false,
      updated_by: profile.id, updated_at: now,
    };
  });
  const { data, error } = await supabase.rpc("import_venues", { venue_rows: venueRows });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  const outcomes = data ?? [];
  return Response.json({ inserted: outcomes.filter((item: { outcome: string }) => item.outcome === "inserted").length, updated: outcomes.filter((item: { outcome: string }) => item.outcome === "updated").length, conflicts: outcomes.filter((item: { outcome: string }) => item.outcome === "conflict").length });
}
