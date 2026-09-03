import Link from "next/link";

// [locale] 區段內的 notFound()（例如語系不合法）會走到這裡。父層 [locale]/layout.tsx 已提供 html/body。
export default function LocaleNotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-stone-900">404</h1>
      <p className="mt-2 text-stone-500">找不到這個頁面 / Page not found</p>
      <Link href="/zh" className="mt-4 inline-block text-[var(--brand)] hover:underline">
        回首頁
      </Link>
    </div>
  );
}
