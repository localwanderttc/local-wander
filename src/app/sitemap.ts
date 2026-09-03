import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";

const PATHS = ["", "/services", "/fleet", "/inquiry", "/about"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    for (const p of PATHS) {
      entries.push({
        url: `${base}/${locale}${p}`,
        changeFrequency: "monthly",
        priority: p === "" ? 1 : 0.7,
      });
    }
  }
  return entries;
}
