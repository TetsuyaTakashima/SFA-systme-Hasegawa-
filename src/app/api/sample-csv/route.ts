import { SALES_TARGET_LABELS } from "@/lib/ui-labels";

export function GET() {
  const csv = `営業先名,${SALES_TARGET_LABELS.category},${SALES_TARGET_LABELS.operator},都道府県,市区町村,住所,電話番号,メールアドレス,${SALES_TARGET_LABELS.department},${SALES_TARGET_LABELS.contactName},状態,温度感,次回対応日,次回アクション,メモ\r\nサンプル文化ホール,文化ホール,サンプル市,東京都,新宿区,東京都新宿区1-1-1,03-0000-0000,info@example.jp,文化振興課,山田,未着手,B,2026-09-01,担当部署へ電話,サンプル行です`;
  return new Response(`\uFEFF${csv}`, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=sample-sales-targets.csv" } });
}
