# This is NOT the Next.js you know

This project uses **Next.js 16.2.4**, which has breaking changes — APIs, conventions, and
file structure may all differ from your training data. Read the relevant guide in
`node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

Known gotchas in this repo:

- `middleware.ts` is renamed to **`proxy.ts`** (`src/proxy.ts`), and the export is `proxy`, not `middleware`.
- i18n: every public route lives under `src/app/[locale]/`. That `[locale]/layout.tsx` is a
  **root layout** (it renders `<html>`/`<body>`). `src/app/admin/` has its own separate root
  layout. There is intentionally **no `src/app/layout.tsx`**. Navigating between the public site
  and `/admin` triggers a full page load — that is expected with multiple root layouts.
- The bare `/` path has no page; `src/proxy.ts` redirects it to `/<defaultLocale>`.
- Prisma runs through `@prisma/adapter-libsql` so the same code talks to a local SQLite file in
  dev and Turso in production. `prisma db push` / `migrate` **cannot** target `libsql://` URLs —
  Turso schema is synced by `scripts/sync-turso-schema.js` (runs automatically in `vercel-build`,
  production only).
