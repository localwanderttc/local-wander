import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { SERVICE_LABEL } from "@/lib/inquiry-labels";
import InquiryEditor from "@/components/admin/InquiryEditor";

export const dynamic = "force-dynamic";

function Field({ label, value }: { label: string; value?: string | number | null }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex gap-3 py-1 text-sm">
      <span className="w-24 shrink-0 text-stone-500">{label}</span>
      <span className="text-stone-800">{value}</span>
    </div>
  );
}

export default async function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await getAdminSession())) redirect("/admin/login");

  const { id } = await params;
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) notFound();

  const q = await prisma.inquiry.findUnique({ where: { id: n } });
  if (!q) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/admin" className="text-sm text-stone-500 hover:text-stone-900">
        ← 回列表
      </Link>

      <h1 className="mt-3 text-xl font-bold text-stone-900">
        {q.name}
        <span className="ml-2 text-sm font-normal text-stone-400">#{q.id}</span>
      </h1>
      <p className="text-sm text-stone-500">
        建立時間：{q.createdAt.toLocaleString("zh-TW", { hour12: false })}・語系：{q.locale}
      </p>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <h2 className="font-semibold text-stone-900">客戶資訊</h2>
          <div className="mt-3">
            <Field label="姓名" value={q.name} />
            <Field label="電話" value={q.phone} />
            <Field label="Email" value={q.email} />
            <Field label="LINE" value={q.lineId} />
          </div>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <h2 className="font-semibold text-stone-900">行程資訊</h2>
          <div className="mt-3">
            <Field label="服務" value={SERVICE_LABEL[q.serviceType] ?? q.serviceType} />
            <Field label="人數" value={q.headcount} />
            <Field label="出發" value={q.startDate} />
            <Field label="結束" value={q.endDate} />
            <Field label="上車" value={q.pickup} />
            <Field label="目的地" value={q.dropoff} />
          </div>
        </div>
      </div>

      {q.message && (
        <div className="mt-6 rounded-lg border border-stone-200 bg-white p-5">
          <h2 className="font-semibold text-stone-900">客戶備註</h2>
          <p className="mt-2 whitespace-pre-line text-sm text-stone-700">{q.message}</p>
        </div>
      )}

      <div className="mt-6">
        <InquiryEditor
          id={q.id}
          initialStatus={q.status}
          initialNotes={q.adminNotes ?? ""}
        />
      </div>
    </div>
  );
}
