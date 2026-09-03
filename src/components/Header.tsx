import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import LocaleSwitcher from "./LocaleSwitcher";

export default function Header({
  locale,
  dict,
  brandName,
}: {
  locale: Locale;
  dict: Dictionary;
  brandName: string;
}) {
  const nav = [
    { href: `/${locale}`, label: dict.nav.home },
    { href: `/${locale}/services`, label: dict.nav.services },
    { href: `/${locale}/fleet`, label: dict.nav.fleet },
    { href: `/${locale}/about`, label: dict.nav.about },
  ];

  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <Link href={`/${locale}`} className="text-lg font-bold text-stone-900">
          {brandName}
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-stone-600 sm:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-stone-900">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <LocaleSwitcher current={locale} />
          <Link
            href={`/${locale}/inquiry`}
            className="rounded-md bg-[var(--brand)] px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90"
          >
            {dict.common.getQuote}
          </Link>
        </div>
      </div>
      <nav className="flex items-center gap-4 overflow-x-auto border-t border-stone-100 px-4 py-2 text-sm text-stone-600 sm:hidden">
        {nav.map((item) => (
          <Link key={item.href} href={item.href} className="whitespace-nowrap hover:text-stone-900">
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
