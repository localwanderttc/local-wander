import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/auth";
import { locales, defaultLocale } from "@/i18n/config";

// 這支 proxy 做兩件事：
// 1. /admin 與 /api/admin 的登入守衛（樂觀檢查，真正防線在各 route / page 內）
// 2. 前台網址補上語系前綴：/services -> /zh/services
//
// 注意 Next 16：middleware.ts 已改名 proxy.ts，export 名稱是 proxy。

function pickLocale(request: NextRequest): string {
  const header = request.headers.get("accept-language");
  if (header) {
    for (const part of header.split(",")) {
      const code = part.split(";")[0].trim().toLowerCase();
      if (code.startsWith("zh")) return "zh";
      if (code.startsWith("en")) return "en";
    }
  }
  return defaultLocale;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- 後台登入守衛 ---
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const isLoginPage = pathname === "/admin/login";
    const isAuthApi = pathname === "/api/admin/auth";
    if (!isLoginPage && !isAuthApi) {
      const token = request.cookies.get(COOKIE_NAME)?.value;
      if (!token || !(await verifyAdminToken(token))) {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    }
    return NextResponse.next();
  }

  // --- 其餘 /api（/api/inquiry、/api/line/webhook 等）不加語系前綴 ---
  if (pathname.startsWith("/api")) return NextResponse.next();

  // --- 前台語系前綴 ---
  const hasLocale = locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );
  if (hasLocale) return NextResponse.next();

  const locale = pickLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // 排除 _next 內部路徑與帶副檔名的靜態檔（favicon.ico、sitemap.xml、robots.txt、圖片等）
  matcher: ["/((?!_next/static|_next/image|.*\\.[^/]+$).*)"],
};
