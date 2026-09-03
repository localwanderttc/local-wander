import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getSiteConfig, t } from "@/lib/config";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const l = locale as Locale;
  const [dict, cfg] = await Promise.all([getDictionary(l), getSiteConfig()]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-stone-50">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <h1 className="max-w-3xl text-3xl font-bold leading-tight text-stone-900 sm:text-4xl">
            {t(cfg.hero.headline, l)}
          </h1>
          <p className="mt-4 max-w-2xl text-stone-600">{t(cfg.hero.sub, l)}</p>
          <div className="mt-8">
            <Link
              href={`/${l}/inquiry`}
              className="inline-block rounded-md bg-[var(--brand)] px-5 py-3 font-semibold text-white hover:opacity-90"
            >
              {t(cfg.hero.ctaLabel, l) || dict.common.getQuote}
            </Link>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="text-2xl font-bold text-stone-900">{dict.home.servicesTitle}</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {cfg.services.map((s) => (
            <div key={s.key} className="rounded-lg border border-stone-200 p-5">
              <h3 className="font-semibold text-stone-900">{t(s.title, l)}</h3>
              <p className="mt-2 text-sm text-stone-600">{t(s.desc, l)}</p>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <Link href={`/${l}/services`} className="text-sm font-semibold text-[var(--brand)] hover:underline">
            {dict.common.learnMore} →
          </Link>
        </div>
      </section>

      {/* Fleet */}
      <section className="bg-stone-50">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="text-2xl font-bold text-stone-900">{dict.home.fleetTitle}</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {cfg.fleet.map((v) => (
              <div key={v.key} className="rounded-lg border border-stone-200 bg-white p-5">
                <h3 className="font-semibold text-stone-900">{t(v.name, l)}</h3>
                <p className="mt-1 text-sm text-stone-500">
                  {v.seats} {dict.common.seats}
                </p>
                <p className="mt-2 text-sm text-stone-600">{t(v.desc, l)}</p>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Link href={`/${l}/fleet`} className="text-sm font-semibold text-[var(--brand)] hover:underline">
              {dict.common.learnMore} →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-stone-900">{dict.home.ctaTitle}</h2>
        <p className="mt-2 text-stone-600">{dict.home.ctaSub}</p>
        <div className="mt-6">
          <Link
            href={`/${l}/inquiry`}
            className="inline-block rounded-md bg-[var(--brand)] px-5 py-3 font-semibold text-white hover:opacity-90"
          >
            {dict.common.getQuote}
          </Link>
        </div>
      </section>
    </div>
  );
}
