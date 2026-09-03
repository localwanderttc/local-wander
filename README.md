# LocalWander（旅遊包車官網）

旅遊包車服務的官方網站：多頁式、中英雙語、含詢價表單、隱藏後台（客戶詢價管理）、LINE 通知。

## 技術

- Next.js 16.2.4（App Router）+ TypeScript + Tailwind CSS v4
- Prisma 5 + `@prisma/adapter-libsql`（本機 SQLite / 正式 Turso）
- 後台單一密碼 + JWT cookie（`jose`）
- 部署：GitHub `localwanderttc` → Vercel `localwanderttc-7985`（Git 自動部署）

先讀 `AGENTS.md`：這版 Next 有 breaking changes（`middleware.ts` → `proxy.ts`、多 root layout、i18n 路由）。

## 本機開發

```bash
npm install
cp .env.example .env        # 已有一份 .env，視需要調整
npx prisma db push          # 建立本機 prisma/dev.db
npm run dev                  # http://localhost:3000
```

- 前台：`/` 會自動導到 `/zh`，可切 `/en`
- 後台：`/admin`（密碼 = `.env` 的 `ADMIN_PASSWORD`）

## 內容編輯

網站文字集中在 `content/site-config.json`（雙語）。UI 字串在 `src/dictionaries/{zh,en}.json`。
標了 `TODO` 的地方要換成真實文案。後台**只**管理客戶詢價，不編輯網站內容。

## 環境變數

| 變數 | 說明 |
|---|---|
| `DATABASE_URL` | 本機 `file:./dev.db`；正式填 Turso 的 `libsql://...` |
| `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` | 正式資料庫（Turso）連線 |
| `ADMIN_PASSWORD` | 後台登入密碼 |
| `ADMIN_JWT_SECRET` | 簽後台 cookie 的密鑰（長隨機字串） |
| `LINE_CHANNEL_SECRET` / `LINE_CHANNEL_ACCESS_TOKEN` | LINE Messaging API channel |
| `LINE_NOTIFY_TARGET` | 收詢價通知的 userId/groupId；空著就不推播 |
| `NEXT_PUBLIC_SITE_URL` | 對外網址（canonical / sitemap / OG） |

## 資料庫（Turso）

Prisma CLI 不能直接對 `libsql://` 做 migrate。正式資料庫的 schema 靠 `scripts/sync-turso-schema.js`
比對補齊。**這支只在本機跑**（放進 Vercel build 會因為 `npx prisma db push` 在該環境快速失敗而中斷）。

改了 `prisma/schema.prisma` 後，部署前務必依序：

```bash
npx prisma db push                            # 更新本機 dev.db
node scripts/sync-turso-schema.js --dry-run   # 預覽對 Turso 的 SQL
node scripts/sync-turso-schema.js             # 真的同步（需要 .env 有 Turso 變數）
git push                                       # 再部署
```

漏跑會導致：新 schema 產生的查詢打到缺欄位的正式庫 → 該 model 全部 500。

## 部署流程

1. GitHub：以 `localwanderttc` 建 public repo，`git push`
2. Turso：建 DB，取得 URL + token
3. Vercel（`localwanderttc-7985` 帳號）：Import repo，設定上表所有環境變數（Production + Preview）
4. LINE：建 Messaging API channel，webhook 指到 `<網址>/api/line/webhook`，填 token；
   請內部人員對官方帳號傳訊息，從 Vercel log 取得 userId 填入 `LINE_NOTIFY_TARGET`
5. 之後：改程式 → `git push` → Vercel 自動 build + 部署
