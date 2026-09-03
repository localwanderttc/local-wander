import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateInquiry, type InquiryInput } from "@/lib/inquiry";
import { pushLineText } from "@/lib/line";

export async function POST(request: Request) {
  let body: Partial<InquiryInput>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const err = validateInquiry(body);
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  const headcount =
    typeof body.headcount === "number" && Number.isFinite(body.headcount)
      ? Math.trunc(body.headcount)
      : null;

  const inquiry = await prisma.inquiry.create({
    data: {
      name: body.name!.trim(),
      phone: body.phone!.trim(),
      email: body.email?.trim() || null,
      lineId: body.lineId?.trim() || null,
      serviceType: body.serviceType!,
      headcount,
      startDate: body.startDate?.trim() || null,
      endDate: body.endDate?.trim() || null,
      pickup: body.pickup?.trim() || null,
      dropoff: body.dropoff?.trim() || null,
      message: body.message?.trim() || null,
      locale: body.locale === "en" ? "en" : "zh",
    },
  });

  // LINE 推播是 best-effort：失敗不影響回應（詢價已經存好了）
  const lines = [
    "🚐 新詢價",
    `姓名：${inquiry.name}`,
    `電話：${inquiry.phone}`,
    inquiry.email ? `Email：${inquiry.email}` : null,
    inquiry.lineId ? `LINE：${inquiry.lineId}` : null,
    `服務：${inquiry.serviceType}`,
    inquiry.headcount ? `人數：${inquiry.headcount}` : null,
    inquiry.startDate ? `日期：${inquiry.startDate}${inquiry.endDate ? ` ~ ${inquiry.endDate}` : ""}` : null,
    inquiry.pickup ? `上車：${inquiry.pickup}` : null,
    inquiry.dropoff ? `目的地：${inquiry.dropoff}` : null,
    inquiry.message ? `備註：${inquiry.message}` : null,
  ].filter(Boolean);
  await pushLineText(lines.join("\n"));

  return NextResponse.json({ ok: true, id: inquiry.id }, { status: 201 });
}
