"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";

const labels: Record<Locale, string> = { zh: "中文", en: "EN" };

export default function LocaleSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname() || `/${current}`;
  const segments = pathname.split("/");
  // segments[0] === "" , segments[1] === 目前語系

  return (
    <div className="flex items-center gap-1 text-sm">
      {locales.map((l) => {
        const next = [...segments];
        next[1] = l;
        const href = next.join("/") || `/${l}`;
        const active = l === current;
        return (
          <Link
            key={l}
            href={href}
            aria-current={active ? "true" : undefined}
            className={
              active
                ? "rounded px-2 py-1 font-semibold text-stone-900"
                : "rounded px-2 py-1 text-stone-500 hover:text-stone-900"
            }
          >
            {labels[l]}
          </Link>
        );
      })}
    </div>
  );
}
