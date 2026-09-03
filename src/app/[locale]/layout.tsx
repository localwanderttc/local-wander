import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Noto_Sans_TC } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { locales, isLocale, htmlLang, ogLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getSiteConfig, t } from "@/lib/config";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "../globals.css";

const notoTC = Noto_Sans_TC({
  variable: "--font-noto-tc",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const cfg = await getSiteConfig();
  const name = t(cfg.brand.name, locale);
  const tagline = t(cfg.brand.tagline, locale);
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    metadataBase: new URL(base),
    title: { default: `${name}｜${tagline}`, template: `%s | ${name}` },
    description: tagline,
    alternates: {
      languages: {
        zh: "/zh",
        en: "/en",
      },
    },
    openGraph: {
      type: "website",
      locale: ogLocale[locale],
      siteName: name,
      title: `${name}｜${tagline}`,
      description: tagline,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typedLocale = locale as Locale;

  const [dict, cfg] = await Promise.all([
    getDictionary(typedLocale),
    getSiteConfig(),
  ]);
  const brandName = t(cfg.brand.name, typedLocale);

  return (
    <html
      lang={htmlLang[typedLocale]}
      className={`${notoTC.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-stone-900">
        <Header locale={typedLocale} dict={dict} brandName={brandName} />
        <main className="flex-1">{children}</main>
        <Footer
          locale={typedLocale}
          dict={dict}
          brandName={brandName}
          contact={{
            phone: cfg.contact.phone,
            email: cfg.contact.email,
            lineUrl: cfg.contact.lineUrl,
          }}
        />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
