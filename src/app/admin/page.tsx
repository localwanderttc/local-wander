import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { INQUIRY_STATUSES, isInquiryStatus } from "@/lib/inquiry";
import { STATUS_LABEL, STATUS_STYLE, SERVICE_LABEL } from "@/lib/inquiry-labels";
import LogoutButton from "@/components/admin/LogoutButton";

export const dynamic = "force-dynamic";

export default async function AdminListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  if (!(await getAdminSession())) redirect("/admin/login");

  const { status } = await searchParams;
  const activeStatus = status && isInquiryStatus(status) ? status : null;

  const inquiries = await prisma.inquiry.findMany({
    where: activeStatus ? { status: activeStatus } : {},
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const counts = await prisma.inquiry.groupBy({
    by: ["status"],
    _count: true,
  });
  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count]));
  const total = counts.reduce((sum, c) => sum + c._count, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-stone-900">客戶詢價</h1>
        <LogoutButton />
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <Link
          href="/admin"
          className={`rounded-full px-3 py-1 ${
            !activeStatus ? "bg-stone-900 text-white" : "bg-white text-stone-600 border border-stone-300"
          }`}
        >
          全部 ({total})
        </Link>
        {INQUIRY_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin?status=${s}`}
            className={`rounded-full px-3 py-1 ${
              activeStatus === s
                ? "bg-stone-900 text-white"
                : "bg-white text-stone-600 border border-stone-300"
            }`}
          >
            {STATUS_LABEL[s]} ({countMap[s] ?? 0})
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-stone-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-left text-stone-500">
            <tr>
              <th className="px-4 py-2 font-medium">建立時間</th>
              <th className="px-4 py-2 font-medium">姓名</th>
              <th className="px-4 py-2 font-medium">電話</th>
              <th className="px-4 py-2 font-medium">服務</th>
              <th className="px-4 py-2 font-medium">日期</th>
              <th className="px-4 py-2 font-medium">狀態</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-stone-400">
                  目前沒有詢價紀錄
                </td>
              </tr>
            )}
            {inquiries.map((q) => (
              <tr key={q.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50">
                <td className="px-4 py-2 text-stone-500">
                  <Link href={`/admin/${q.id}`} className="block">
                    {q.createdAt.toLocaleString("zh-TW", { hour12: false })}
                  </Link>
                </td>
                <td className="px-4 py-2">
                  <Link href={`/admin/${q.id}`} className="block font-medium text-stone-900">
                    {q.name}
                  </Link>
                </td>
                <td className="px-4 py-2">
                  <Link href={`/admin/${q.id}`} className="block">
                    {q.phone}
                  </Link>
                </td>
                <td className="px-4 py-2">
                  <Link href={`/admin/${q.id}`} className="block">
                    {SERVICE_LABEL[q.serviceType] ?? q.serviceType}
                  </Link>
                </td>
                <td className="px-4 py-2 text-stone-500">
                  <Link href={`/admin/${q.id}`} className="block">
                    {q.startDate || "—"}
                    {q.endDate ? ` ~ ${q.endDate}` : ""}
                  </Link>
                </td>
                <td className="px-4 py-2">
                  <Link href={`/admin/${q.id}`} className="block">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        STATUS_STYLE[q.status as keyof typeof STATUS_STYLE] ?? ""
                      }`}
                    >
                      {STATUS_LABEL[q.status as keyof typeof STATUS_LABEL] ?? q.status}
                    </span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
