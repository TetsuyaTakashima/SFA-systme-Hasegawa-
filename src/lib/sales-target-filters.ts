export interface SalesTargetFilters {
  page: number;
  pageSize: number;
  search: string;
  statuses: string[];
  prefecture: string;
  assignee: string;
  temperature: string;
  recordType: string;
  visibility: "visible" | "hidden" | "all";
  sort: "nextAction" | "updated" | "name" | "prefecture" | "temperature";
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function list(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value : value ? [value] : []).map((item) => item.trim()).filter(Boolean).slice(0, 20);
}

export function parseSalesTargetFilters(params: Record<string, string | string[] | undefined>): SalesTargetFilters {
  const page = Math.max(1, Number.parseInt(first(params.page), 10) || 1);
  const pageSizeValue = Number.parseInt(first(params.pageSize), 10) || 50;
  const sortValue = first(params.sort);
  const visibilityValue = first(params.visibility);

  return {
    page,
    pageSize: [25, 50, 100].includes(pageSizeValue) ? pageSizeValue : 50,
    search: first(params.q).replace(/[(),%*]/gu, " ").replace(/\s+/gu, " ").trim().slice(0, 100),
    statuses: list(params.status),
    prefecture: first(params.prefecture),
    assignee: first(params.assignee),
    temperature: first(params.temperature),
    recordType: first(params.type),
    visibility: visibilityValue === "hidden" || visibilityValue === "all" ? visibilityValue : "visible",
    sort: ["updated", "name", "prefecture", "temperature"].includes(sortValue)
      ? sortValue as SalesTargetFilters["sort"]
      : "nextAction",
  };
}
