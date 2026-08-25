"use client";

import { useState } from "react";
import { BellRing } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function BrowserNotificationButton() {
  const [pending, setPending] = useState(false);
  async function requestPermission() {
    if (!("Notification" in window)) { toast.error("このブラウザは通知に対応していません。"); return; }
    setPending(true);
    const permission = await Notification.requestPermission();
    setPending(false);
    if (permission === "granted") {
      new Notification("営業管理", { body: "ブラウザ通知を有効にしました。" });
      toast.success("ブラウザ通知を許可しました。");
    } else toast.error("ブラウザの通知許可を確認してください。");
  }
  return <Button type="button" variant="outline" onClick={requestPermission} disabled={pending}><BellRing className="size-4" />ブラウザ通知を許可</Button>;
}
