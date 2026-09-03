import "server-only";
import type { Locale } from "./config";

// UI 字串字典。內容文案（品牌、服務、聯絡）不在這裡，在 content/site-config.json。
const dictionaries = {
  zh: () => import("@/dictionaries/zh.json").then((m) => m.default),
  en: () => import("@/dictionaries/en.json").then((m) => m.default),
};

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)["zh"]>>;

export const getDictionary = async (locale: Locale): Promise<Dictionary> =>
  dictionaries[locale]();
