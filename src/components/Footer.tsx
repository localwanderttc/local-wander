import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

export default function Footer({
  dict,
  brandName,
  contact,
}: {
  locale: Locale;
  dict: Dictionary;
  brandName: string;
  contact: { phone: string; email: string; lineUrl: string };
}) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-stone-200 bg-stone-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 text-sm text-stone-500">
        <div className="font-semibold text-stone-700">{brandName}</div>
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          {contact.phone && contact.phone !== "TODO" && (
            <span>{dict.about.phone}: {contact.phone}</span>
          )}
          {contact.email && <span>Email: {contact.email}</span>}
          {contact.lineUrl && contact.lineUrl !== "TODO" && (
            <a href={contact.lineUrl} className="hover:text-stone-900">
              LINE
            </a>
          )}
        </div>
        <div className="mt-2">
          © {year} {brandName}. {dict.footer.rights}.
        </div>
      </div>
    </footer>
  );
}
