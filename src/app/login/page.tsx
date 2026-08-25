import type { Metadata } from "next";
import { Building2 } from "lucide-react";
import { LoginForm } from "@/app/login/login-form";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = { title: "ログイン" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;

  return (
    <main className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_480px]">
      <section className="relative hidden overflow-hidden bg-primary p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3 text-sm font-semibold">
          <span className="grid size-10 place-items-center rounded-md bg-white/12"><Building2 className="size-5" /></span>
          長谷川音楽事務所
        </div>
        <div className="max-w-xl">
          <p className="mb-5 text-sm font-medium text-primary-foreground/70">SALES WORKSPACE</p>
          <h1 className="text-4xl leading-tight font-semibold">今日の営業を、<br />迷わず前へ。</h1>
          <p className="mt-6 max-w-md leading-7 text-primary-foreground/75">営業先、対応状況、次回予定を一つの画面で確認できます。</p>
        </div>
        <p className="text-xs text-primary-foreground/55">Hasegawa Music Office</p>
      </section>
      <section className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="absolute top-5 right-5"><ThemeToggle /></div>
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="mb-6 flex items-center gap-3 text-sm font-semibold">
              <span className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground"><Building2 className="size-4" /></span>
              長谷川音楽事務所
            </div>
          </div>
          <h2 className="text-2xl font-semibold">営業管理へログイン</h2>
          <p className="mt-2 mb-8 text-sm text-muted-foreground">登録済みのアカウントを使用してください。</p>
          <LoginForm nextPath={next} />
        </div>
      </section>
    </main>
  );
}
