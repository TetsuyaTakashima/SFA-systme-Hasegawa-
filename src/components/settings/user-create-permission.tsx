"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";

export function UserCreatePermission({
  formId,
  initialValue,
  isAdmin,
  userName,
}: {
  formId: string;
  initialValue: boolean;
  isAdmin: boolean;
  userName: string;
}) {
  const [enabled, setEnabled] = useState(initialValue);

  return (
    <div className="flex items-center gap-2">
      <input type="hidden" form={formId} name="can_create_sales_targets" value={String(enabled)} />
      <Switch
        checked={isAdmin || enabled}
        disabled={isAdmin}
        onCheckedChange={setEnabled}
        aria-label={`${userName}の営業先追加権限`}
      />
      <span className="text-xs text-muted-foreground">{isAdmin ? "常に許可" : enabled ? "許可" : "不可"}</span>
    </div>
  );
}
