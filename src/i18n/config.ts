// 語系設定。這個檔案不能有 server-only 依賴——proxy.ts 跟 client component（語言切換）都會 import。

export const locales = ["zh", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "zh";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

// <html lang> 用的 BCP-47 標籤
export const htmlLang: Record<Locale, string> = {
  zh: "zh-Hant-TW",
  en: "en",
};

// OpenGraph locale
export const ogLocale: Record<Locale, string> = {
  zh: "zh_TW",
  en: "en_US",
};
