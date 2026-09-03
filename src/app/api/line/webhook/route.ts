import { NextResponse } from "next/server";
import { verifyLineSignature } from "@/lib/line";

// LINE Messaging API webhook。
// 目前用途很小：
//  1. 驗證簽章（確認請求真的來自 LINE）
//  2. 把訊息事件的來源 id（userId / groupId）印到 log —— 部署後請內部人員對官方帳號傳一則訊息，
//     從 Vercel log 撈出這個 id 填進環境變數 LINE_NOTIFY_TARGET，新詢價才會推播給他/群組。
//
// 之後若要做「師傅綁定」「查詢詢價」等互動，再擴充這支。

export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("x-line-signature");

  if (!verifyLineSignature(raw, signature)) {
    return NextResponse.json({ error: "bad signature" }, { status: 401 });
  }

  try {
    const body = JSON.parse(raw) as {
      events?: Array<{
        type: string;
        source?: { type: string; userId?: string; groupId?: string; roomId?: string };
        message?: { type: string; text?: string };
      }>;
    };
    for (const ev of body.events ?? []) {
      const src = ev.source ?? { type: "unknown" };
      console.log(
        `[line/webhook] event=${ev.type} sourceType=${src.type} userId=${src.userId ?? "-"} groupId=${src.groupId ?? "-"} roomId=${src.roomId ?? "-"} text=${ev.message?.text ?? "-"}`
      );
    }
  } catch (e) {
    console.error("[line/webhook] parse error:", e);
  }

  // LINE 只要 200 即可
  return NextResponse.json({ ok: true });
}

// LINE 「Verify」按鈕會打 GET/HEAD，回 200 就好
export async function GET() {
  return NextResponse.json({ ok: true });
}
