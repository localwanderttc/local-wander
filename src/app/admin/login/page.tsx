"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError("密碼錯誤");
        setLoading(false);
        return;
      }
      router.replace("/admin");
    } catch {
      setError("登入失敗，請稍後再試");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-lg border border-stone-200 bg-white p-6 shadow-sm"
      >
        <h1 className="text-lg font-bold text-stone-900">後台登入</h1>
        <label className="mt-4 block text-sm font-medium text-stone-700">
          密碼
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none"
          />
        </label>
        {error && (
          <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-md bg-[var(--brand)] px-4 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "登入中…" : "登入"}
        </button>
      </form>
    </div>
  );
}
