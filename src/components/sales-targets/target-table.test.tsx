import type { Route } from "next";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TargetTable } from "@/components/sales-targets/target-table";
import type { MasterData, SalesTarget } from "@/lib/types";

const target: SalesTarget = {
  id: "11111111-1111-1111-1111-111111111111",
  facility_name: "とても長い営業先名が入っても隣の列へはみ出さない確認用営業先",
  category: "文化ホール",
  record_type: "facility",
  operator: null,
  prefecture: "東京都",
  municipality: "新宿区",
  address: null,
  phone: "03-1234-5678",
  fax: null,
  email: null,
  website: null,
  department: null,
  contact_name: null,
  main_hall_name: null,
  seat_count: null,
  large_hall_seats: null,
  medium_hall_seats: null,
  small_hall_seats: null,
  genres: null,
  program_policy: "△",
  status: "未着手",
  temperature: "B",
  is_hidden: false,
  assigned_user_id: null,
  last_contact_date: null,
  call_updated_at: null,
  call_updated_by_user_id: null,
  consideration_date: null,
  next_action_date: null,
  notification_lead_days: null,
  next_action: null,
  notes: null,
  notes_important: false,
  created_by: null,
  updated_by: null,
  lock_version: 1,
  created_at: "2026-08-25T00:00:00Z",
  updated_at: "2026-08-25T00:00:00Z",
};

const masters: MasterData = {
  statuses: [{ id: "status-1", name: "未着手", sort_order: 1, color: "#59645c", is_closed: false }],
  temperatures: [],
  targetTypes: [{ key: "facility", label: "施設", sort_order: 1, active: true }],
  profiles: [],
  prefectures: ["東京都"],
};

describe("TargetTable", () => {
  it("keeps sales target, region, and phone cells under matching headers", () => {
    render(<TargetTable targets={[target]} masters={masters} detailHref={() => "/sales-targets" as Route} />);

    const table = screen.getByRole("table", { name: "営業先一覧" });
    expect(within(table).getAllByRole("rowgroup")[0]).not.toHaveClass("sticky");
    expect(within(table).getAllByRole("columnheader").map((header) => header.textContent)).toEqual([
      "営業先", "区分", "地域", "電話番号", "状態", "温度感", "営業担当", "次回対応日", "次回対応", "詳細",
    ]);

    const rows = within(table).getAllByRole("row");
    expect(rows[0]!.style.gridTemplateColumns).toBe(rows[1]!.style.gridTemplateColumns);

    const cells = within(rows[1]!).getAllByRole("cell");
    expect(cells[0]).toHaveTextContent(target.facility_name);
    expect(cells[2]).toHaveTextContent("東京都 新宿区");
    expect(cells[3]).toHaveTextContent("03-1234-5678");
    expect(cells[0]).toHaveClass("overflow-hidden");
    expect(cells[2]).toHaveClass("overflow-hidden");
    expect(cells[3]).toHaveClass("overflow-hidden");
  });
});
