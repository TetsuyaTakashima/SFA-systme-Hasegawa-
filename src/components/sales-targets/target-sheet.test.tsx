import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TargetSheet } from "@/components/sales-targets/target-sheet";
import type { MasterData, SalesTarget } from "@/lib/types";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/sales-targets",
  useRouter: () => ({ replace, refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams("target=target-1"),
}));

vi.mock("@/app/(crm)/sales-targets/actions", () => ({
  deleteSalesTargetAction: vi.fn(),
  updateSalesTargetAction: vi.fn(async () => ({})),
}));

const target: SalesTarget = {
  id: "11111111-1111-1111-1111-111111111111",
  facility_name: "文化会館",
  category: "文化施設",
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
  status: "除外",
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
  created_at: "2026-08-27T00:00:00Z",
  updated_at: "2026-08-27T00:00:00Z",
};

const masters: MasterData = {
  statuses: [{ id: "status-1", name: "除外", sort_order: 1, color: "#59645c", is_closed: false }],
  temperatures: [{ level: "B", label: "標準", sort_order: 1, color: "#59645c" }],
  targetTypes: [{ key: "facility", label: "施設", sort_order: 1, active: true }],
  profiles: [],
  prefectures: ["東京都"],
};

describe("TargetSheet", () => {
  beforeEach(() => replace.mockClear());

  it("submits fields from every tab when saving a status", () => {
    const { container } = render(<TargetSheet target={target} masters={masters} isAdmin />);
    const form = container.ownerDocument.querySelector("form");
    expect(form).not.toBeNull();

    const formData = new FormData(form!);
    expect(formData.get("status")).toBe("除外");
    expect(formData.get("phone")).toBe("03-1234-5678");
    expect(formData.get("facility_name")).toBe("文化会館");
  });

  it("keeps a legacy non-email value without browser validation blocking the form", () => {
    const legacyTarget = { ...target, email: "↑高校と一緒" };
    const { container } = render(<TargetSheet target={legacyTarget} masters={masters} isAdmin />);
    const forms = container.ownerDocument.querySelectorAll("form");
    const form = forms.item(forms.length - 1);
    const email = form.querySelector<HTMLInputElement>('input[name="email"]');

    expect(form).not.toHaveAttribute("novalidate");
    expect(email?.type).toBe("text");
    expect(email).toBeValid();
    expect(new FormData(form!).get("email")).toBe("↑高校と一緒");
  });

  it("closes the detail without scrolling the list to the top", () => {
    render(<TargetSheet target={target} masters={masters} isAdmin />);

    fireEvent.click(screen.getByRole("button", { name: "閉じる" }));

    expect(replace).toHaveBeenCalledWith("/sales-targets", { scroll: false });
  });
});
