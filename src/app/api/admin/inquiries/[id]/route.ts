import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { isInquiryStatus } from "@/lib/inquiry";

async function getId(params: Promise<{ id: string }>): Promise<number | null> {
  const { id } = await params;
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const id = await getId(params);
  if (!id) return NextResponse.json({ error: "bad id" }, { status: 400 });
  const inquiry = await prisma.inquiry.findUnique({ where: { id } });
  if (!inquiry) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ inquiry });
}

// PATCH：只允許改 status 與 adminNotes
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const id = await getId(params);
  if (!id) return NextResponse.json({ error: "bad id" }, { status: 400 });

  let body: { status?: string; adminNotes?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const data: { status?: string; adminNotes?: string | null } = {};
  if (body.status !== undefined) {
    if (!isInquiryStatus(body.status)) {
      return NextResponse.json({ error: "invalid status" }, { status: 400 });
    }
    data.status = body.status;
  }
  if (body.adminNotes !== undefined) {
    data.adminNotes = body.adminNotes.slice(0, 4000) || null;
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "nothing to update" }, { status: 400 });
  }

  try {
    const inquiry = await prisma.inquiry.update({ where: { id }, data });
    return NextResponse.json({ inquiry });
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}
