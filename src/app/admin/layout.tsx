import type { Metadata } from "next";
import { Noto_Sans_TC } from "next/font/google";
import "../globals.css";

const notoTC = Noto_Sans_TC({
  variable: "--font-noto-tc",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "後台",
  robots: { index: false, follow: false },
};

// admin 是獨立的 root layout（跟前台 [locale] 分開）。內部使用，只有中文。
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant-TW" className={`${notoTC.variable} h-full antialiased`}>
      <body className="min-h-full bg-stone-100 text-stone-900">{children}</body>
    </html>
  );
}
