export type UserRole = "admin" | "staff";
export type Temperature = "A" | "B" | "C" | "D" | "E";

export interface Profile {
  id: string;
  name: string;
  login_id: string;
  email: string | null;
  role: UserRole;
  active: boolean;
  can_create_sales_targets: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfileDirectoryEntry {
  id: string;
  name: string;
  active: boolean;
}

export interface StatusOption {
  id: string;
  name: string;
  sort_order: number;
  color: string;
  is_closed: boolean;
}

export interface TemperatureOption {
  level: Temperature;
  label: string;
  sort_order: number;
  color: string;
}

export interface SalesTargetType {
  key: string;
  label: string;
  sort_order: number;
  active: boolean;
}

export interface SalesTarget {
  id: string;
  facility_name: string;
  category: string | null;
  record_type: string;
  operator: string | null;
  prefecture: string | null;
  municipality: string | null;
  address: string | null;
  phone: string | null;
  fax: string | null;
  email: string | null;
  website: string | null;
  department: string | null;
  contact_name: string | null;
  main_hall_name: string | null;
  seat_count: number | null;
  large_hall_seats: number | null;
  medium_hall_seats: number | null;
  small_hall_seats: number | null;
  genres: string | null;
  program_policy: string;
  status: string;
  temperature: Temperature;
  is_hidden: boolean;
  assigned_user_id: string | null;
  last_contact_date: string | null;
  call_updated_at: string | null;
  call_updated_by_user_id: string | null;
  consideration_date: string | null;
  next_action_date: string | null;
  notification_lead_days: number | null;
  next_action: string | null;
  notes: string | null;
  notes_important: boolean;
  created_by: string | null;
  updated_by: string | null;
  lock_version: number;
  created_at: string;
  updated_at: string;
}

export interface MasterData {
  statuses: StatusOption[];
  temperatures: TemperatureOption[];
  targetTypes: SalesTargetType[];
  profiles: ProfileDirectoryEntry[];
  prefectures: string[];
}

export interface AuditEvent {
  id: string;
  entity_type: string;
  entity_id: string;
  action: "insert" | "update" | "delete";
  changed_fields: string[];
  before_data: Record<string, unknown> | null;
  after_data: Record<string, unknown> | null;
  actor_id: string | null;
  created_at: string;
}
