"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { INQUIRY_STATUSES } from "@/lib/inquiry";
import { STATUS_LABEL } from "@/lib/inquiry-labels";

export default function InquiryEditor({
  id,
  initialStatus,
  initialNotes,
}: {
  id: number;
  initialStatus: string;
  initialNotes: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [notes, setNotes] = useState(initialNotes);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const dirty = status !== initialStatus || notes !== initialNotes;

  async function save() {
    setState("saving");
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes: notes }),
      });
      if (!res.ok) throw new Error();
      setState("saved");
      router.refresh();
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("error");
    }
  }

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-5">
      <h2 className="font-semibold text-stone-900">內部處理</h2>

      <label className="mt-4 block text-sm font-medium text-stone-700">
        狀態
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none"
        >
          {INQUIRY_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-4 block text-sm font-medium text-stone-700">
        內部備註（客戶看不到）
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={5}
          className="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none"
        />
      </label>

      {state === "error" && (
        <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          儲存失敗，請稍後再試
        </p>
      )}

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={save}
          disabled={!dirty || state === "saving"}
          className="rounded-md bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {state === "saving" ? "儲存中…" : "儲存"}
        </button>
        {state === "saved" && <span className="text-sm text-emerald-600">已儲存</span>}
      </div>
    </div>
  );
}
