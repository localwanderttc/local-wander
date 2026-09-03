import type { Metadata } from "next";
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
  return { title: dict.about.title };
}

function Row({ label, value }: { label: string; value?: string }) {
  if (!value || value === "TODO") return null;
  return (
    <div className="flex gap-3 py-1">
      <span className="w-24 shrink-0 text-stone-500">{label}</span>
      <span className="text-stone-800">{value}</span>
    </div>
  );
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const l = locale as Locale;
  const [dict, cfg] = await Promise.all([getDictionary(l), getSiteConfig()]);
  const c = cfg.contact;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold text-stone-900">{dict.about.title}</h1>

      <p className="mt-6 whitespace-pre-line text-stone-700">{t(cfg.about.body, l)}</p>

      <h2 className="mt-12 text-xl font-semibold text-stone-900">
        {dict.about.contactTitle}
      </h2>
      <div className="mt-4 text-sm">
        <Row label={dict.about.phone} value={c.phone} />
        <Row label={dict.about.line} value={c.lineId || c.lineUrl} />
        <Row label={dict.about.email} value={c.email} />
        <Row label={dict.about.instagram} value={c.instagram} />
        <Row label={dict.about.address} value={t(c.address, l)} />
        <Row label={dict.about.serviceArea} value={t(c.serviceArea, l)} />
      </div>

      {cfg.faq.some((f) => t(f.q, l) && !t(f.q, l).startsWith("TODO")) && (
        <>
          <h2 className="mt-12 text-xl font-semibold text-stone-900">
            {dict.about.faqTitle}
          </h2>
          <div className="mt-4 space-y-4">
            {cfg.faq.map((f, i) => (
              <div key={i}>
                <div className="font-medium text-stone-900">{t(f.q, l)}</div>
                <div className="mt-1 text-sm text-stone-600">{t(f.a, l)}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
