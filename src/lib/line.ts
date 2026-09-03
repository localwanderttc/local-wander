import crypto from "crypto";

// LINE Messaging API：新詢價進來時 push 一則訊息給內部人員。
// 需要三個環境變數：
//   LINE_CHANNEL_ACCESS_TOKEN  - push 訊息用
//   LINE_CHANNEL_SECRET        - 驗證 webhook 簽章用
//   LINE_NOTIFY_TARGET         - 收通知的對象 userId(Uxxx) 或 groupId(Cxxx)；沒設就不推播

const PUSH_ENDPOINT = "https://api.line.me/v2/bot/message/push";

export function isLineConfigured(): boolean {
  return Boolean(
    process.env.LINE_CHANNEL_ACCESS_TOKEN && process.env.LINE_NOTIFY_TARGET
  );
}

// 推播純文字訊息。失敗只記 log 不丟例外——詢價本身已經存進資料庫，不能因為 LINE 掛掉就讓使用者看到錯誤。
export async function pushLineText(text: string): Promise<void> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const to = process.env.LINE_NOTIFY_TARGET;
  if (!token || !to) {
    console.warn("[line] 未設定 LINE_CHANNEL_ACCESS_TOKEN / LINE_NOTIFY_TARGET，略過推播");
    return;
  }
  try {
    const res = await fetch(PUSH_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        to,
        messages: [{ type: "text", text: text.slice(0, 4900) }],
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`[line] push 失敗 ${res.status}: ${body}`);
    }
  } catch (e) {
    console.error("[line] push 例外:", e);
  }
}

// 驗證 webhook 請求的 x-line-signature（HMAC-SHA256 + base64）。
export function verifyLineSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.LINE_CHANNEL_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("base64");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}
