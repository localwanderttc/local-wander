import path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// 本機開發 DATABASE_URL 是 file:./dev.db；正式環境是 Turso 的 libsql://... + TURSO_AUTH_TOKEN。
// 同一份 adapter 程式碼兩邊共用。
//
// 注意：relative 的 file: 路徑，Prisma CLI（db push/generate）以 prisma/schema.prisma 所在目錄為基準解析，
// 但 libSQL client 以 process.cwd() 為基準——兩邊不一樣。這裡統一轉成絕對路徑（以 prisma/ 為準），
// 跟 CLI 行為一致，不要因為這裡改了就順手改 .env 的 DATABASE_URL。
function resolveDatabaseUrl(url: string): string {
  if (!url.startsWith("file:")) return url;
  const relativePath = url.slice("file:".length);
  const absolutePath = path.isAbsolute(relativePath)
    ? relativePath
    : path.join(process.cwd(), "prisma", relativePath);
  return `file:${absolutePath}`;
}

const dbUrl = resolveDatabaseUrl(process.env.DATABASE_URL!);
const isFileUrl = dbUrl.startsWith("file:");

// 只有連 libsql://（Turso）時才帶 authToken。本機 file: + authToken 的組合在 @libsql/client
// 有已知異常（work-manager 踩過，可能清空本機 dev.db），即使 .env 裡有 token 也不要傳。
const libsql = createClient({
  url: dbUrl,
  authToken: isFileUrl ? undefined : process.env.TURSO_AUTH_TOKEN,
});
const adapter = new PrismaLibSQL(libsql);

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
