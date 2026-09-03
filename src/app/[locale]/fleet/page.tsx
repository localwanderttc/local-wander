import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getSiteConfig, t } from "@/lib/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale as Locale);
  return { title: dict.fleet.title };
}

export default async function FleetPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const l = locale as Locale;
  const [dict, cfg] = await Promise.all([getDictionary(l), getSiteConfig()]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="text-3xl font-bold text-stone-900">{dict.fleet.title}</h1>
      <p className="mt-3 text-stone-600">{dict.fleet.intro}</p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {cfg.fleet.map((v) => (
          <div key={v.key} className="rounded-lg border border-stone-200 p-6">
            <h2 className="text-xl font-semibold text-stone-900">{t(v.name, l)}</h2>
            <p className="mt-1 text-sm text-stone-500">
              {v.seats} {dict.common.seats}
            </p>
            <p className="mt-2 text-stone-600">{t(v.desc, l)}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <Link
          href={`/${l}/inquiry`}
          className="inline-block rounded-md bg-[var(--brand)] px-5 py-3 font-semibold text-white hover:opacity-90"
        >
          {dict.common.getQuote}
        </Link>
      </div>
    </div>
  );
}
