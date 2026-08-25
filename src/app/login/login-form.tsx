"use client";

import { useActionState } from "react";
import { LoaderCircle, LogIn } from "lucide-react";
import { loginAction } from "@/app/login/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ nextPath }: { nextPath?: string }) {
  const [state, action, pending] = useActionState(loginAction, {});

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={nextPath ?? ""} />
      <div className="space-y-2">
        <Label htmlFor="loginId">ログインID</Label>
        <Input id="loginId" name="loginId" autoComplete="username" autoFocus required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">パスワード</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      {state.error ? (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? <LoaderCircle className="size-4 animate-spin" /> : <LogIn className="size-4" />}
        {pending ? "確認中..." : "ログイン"}
      </Button>
    </form>
  );
}
