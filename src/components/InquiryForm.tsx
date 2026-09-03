"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { SERVICE_TYPES } from "@/lib/inquiry";

type State = "idle" | "submitting" | "success" | "error";

export default function InquiryForm({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");
  const f = dict.inquiry.fields;
  const opts = dict.inquiry.serviceOptions;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
      email: String(data.get("email") || "").trim(),
      lineId: String(data.get("lineId") || "").trim(),
      serviceType: String(data.get("serviceType") || ""),
      headcount: data.get("headcount") ? Number(data.get("headcount")) : null,
      startDate: String(data.get("startDate") || "").trim(),
      endDate: String(data.get("endDate") || "").trim(),
      pickup: String(data.get("pickup") || "").trim(),
      dropoff: String(data.get("dropoff") || "").trim(),
      message: String(data.get("message") || "").trim(),
      locale,
    };

    if (!payload.name || !payload.phone || !payload.serviceType) {
      setError(dict.inquiry.errorRequired);
      return;
    }

    setState("submitting");
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(String(res.status));
      setState("success");
      form.reset();
    } catch {
      setState("error");
      setError(dict.inquiry.errorGeneric);
    }
  }

  if (state === "success") {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6">
        <h2 className="text-lg font-semibold text-emerald-800">
          {dict.inquiry.successTitle}
        </h2>
        <p className="mt-2 text-sm text-emerald-700">{dict.inquiry.successBody}</p>
      </div>
    );
  }

  const inputCls =
    "mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none";
  const labelCls = "block text-sm font-medium text-stone-700";

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelCls}>
          {f.name} <span className="text-red-500">*</span>
          <input name="name" required maxLength={100} className={inputCls} />
        </label>
        <label className={labelCls}>
          {f.phone} <span className="text-red-500">*</span>
          <input name="phone" required maxLength={50} inputMode="tel" className={inputCls} />
        </label>
        <label className={labelCls}>
          {f.email}
          <input name="email" type="email" maxLength={150} className={inputCls} />
        </label>
        <label className={labelCls}>
          {f.lineId}
          <input name="lineId" maxLength={100} className={inputCls} />
        </label>
        <label className={labelCls}>
          {f.serviceType} <span className="text-red-500">*</span>
          <select name="serviceType" required defaultValue="" className={inputCls}>
            <option value="" disabled>
              —
            </option>
            {SERVICE_TYPES.map((key) => (
              <option key={key} value={key}>
                {opts[key as keyof typeof opts]}
              </option>
            ))}
          </select>
        </label>
        <label className={labelCls}>
          {f.headcount}
          <input name="headcount" type="number" min={1} max={99} className={inputCls} />
        </label>
        <label className={labelCls}>
          {f.startDate}
          <input name="startDate" maxLength={50} placeholder="2026/06/20" className={inputCls} />
        </label>
        <label className={labelCls}>
          {f.endDate}
          <input name="endDate" maxLength={50} className={inputCls} />
        </label>
        <label className={labelCls}>
          {f.pickup}
          <input name="pickup" maxLength={200} className={inputCls} />
        </label>
        <label className={labelCls}>
          {f.dropoff}
          <input name="dropoff" maxLength={200} className={inputCls} />
        </label>
      </div>
      <label className={labelCls}>
        {f.message}
        <textarea name="message" rows={4} maxLength={2000} className={inputCls} />
      </label>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={state === "submitting"}
        className="rounded-md bg-[var(--brand)] px-5 py-3 font-semibold text-white hover:opacity-90 disabled:opacity-60"
      >
        {state === "submitting" ? dict.inquiry.submitting : dict.inquiry.submit}
      </button>
    </form>
  );
}
