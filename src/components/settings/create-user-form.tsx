"use client";

import { useActionState, useEffect } from "react";
import { LoaderCircle, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { createUserAction } from "@/app/(crm)/settings/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateUserForm() {
  const [state, action, pending] = useActionState(createUserAction, {});
  useEffect(() => { if (state.success) toast.success(state.success); }, [state.success]);
  return (
    <form action={action} className="border-b p-4">
      <h2 className="text-sm font-semibold">ユーザーを追加</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
        <div className="space-y-1.5"><Label htmlFor="user-name">表示名</Label><Input id="user-name" name="name" required /></div>
        <div className="space-y-1.5"><Label htmlFor="login-id">ログインID</Label><Input id="login-id" name="loginId" pattern="[A-Za-z0-9._-]+" required /></div>
        <div className="space-y-1.5"><Label htmlFor="new-password">初期パスワード</Label><Input id="new-password" name="password" type="password" minLength={8} required /></div>
        <Button type="submit" disabled={pending}>{pending ? <LoaderCircle className="size-4 animate-spin" /> : <UserPlus className="size-4" />}{pending ? "作成中" : "追加"}</Button>
      </div>
      {state.error ? <Alert variant="destructive" className="mt-3"><AlertDescription>{state.error}</AlertDescription></Alert> : null}
    </form>
  );
}
