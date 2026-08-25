import type { Metadata } from "next";
import { headers } from "next/headers";
import { Noto_Sans_JP } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const notoSansJp = Noto_Sans_JP({ display: "swap", preload: false, variable: "--font-noto-sans-jp" });

export const metadata: Metadata = {
  title: { default: "営業管理 | 長谷川音楽事務所", template: "%s | 営業管理" },
  description: "営業先と架電予定を一元管理するSFAシステム",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang="ja" className={notoSansJp.variable} suppressHydrationWarning>
      <body>
        <Providers nonce={nonce}>{children}</Providers>
      </body>
    </html>
  );
}
