import "server-only";
import { promises as fs } from "fs";
import path from "path";
import type { Locale } from "@/i18n/config";

// content/site-config.json 的型別。文案雙語，用 { zh, en } 結構。
export type LocalizedText = { zh: string; en: string };

export type SiteConfig = {
  brand: { name: LocalizedText; tagline: LocalizedText };
  contact: {
    phone: string;
    contactPerson: string;
    lineUrl: string;
    lineId: string;
    whatsapp: string;
    email: string;
    instagram: string;
    address: LocalizedText;
    serviceArea: LocalizedText;
  };
  hero: { headline: LocalizedText; sub: LocalizedText; ctaLabel: LocalizedText };
  services: { key: string; title: LocalizedText; desc: LocalizedText }[];
  fleet: {
    key: string;
    name: LocalizedText;
    seats: number;
    desc: LocalizedText;
    images: string[];
  }[];
  about: { body: LocalizedText };
  faq: { q: LocalizedText; a: LocalizedText }[];
};

let cached: SiteConfig | null = null;

export async function getSiteConfig(): Promise<SiteConfig> {
  if (cached) return cached;
  const file = path.join(process.cwd(), "content", "site-config.json");
  const raw = await fs.readFile(file, "utf8");
  cached = JSON.parse(raw) as SiteConfig;
  return cached;
}

// 取某個雙語欄位的對應語系文字，缺該語系就退回中文。
export function t(text: LocalizedText | undefined, locale: Locale): string {
  if (!text) return "";
  return text[locale] || text.zh || "";
}
