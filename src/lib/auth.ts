import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// 後台是單一密碼制（比照 camper-site），不做多帳號。密碼放 ADMIN_PASSWORD 環境變數，
// 登入成功後簽一個 JWT 放 httpOnly cookie。
const SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || "localwander-change-in-prod"
);

export const COOKIE_NAME = "lw_admin";

export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return input === expected;
}

export async function createAdminToken(): Promise<string> {
  return new SignJWT({ admin: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET);
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function getAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyAdminToken(token);
}
