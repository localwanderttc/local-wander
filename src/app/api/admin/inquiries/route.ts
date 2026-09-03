import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { isInquiryStatus } from "@/lib/inquiry";

// GET /api/admin/inquiries?status=new  — 列出詢價（proxy.ts 已擋未登入，這裡再確認一次）
export async function GET(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const where = status && isInquiryStatus(status) ? { status } : {};

  const inquiries = await prisma.inquiry.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 500,
  });
  return NextResponse.json({ inquiries });
}
