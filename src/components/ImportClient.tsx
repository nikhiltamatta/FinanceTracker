"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const samples = {
  income: `date,amount,note
2026-05-01,1200,Week 1
2026-05-08,1200,Week 2`,
  obligations: `name,category,amount,dueDayOfMonth,priority
Rent,rent,900,1,must_pay
Car EMI,loan,350,7,must_pay`,
};

export function ImportClient() {
  const router = useRouter();
  const [type, setType] = useState<"income" | "obligations">("income");
  const [csv, setCsv] = useState(samples.income);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function loadSample(next: "income" | "obligations") {
    setType(next);
    setCsv(samples[next]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, csv }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setMessage(data.error ?? "Import failed");
      return;
    }
    setMessage(`Imported ${data.imported} row(s).`);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => loadSample("income")}
          className={`rounded-lg px-3 py-1.5 text-sm ${
            type === "income"
              ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950"
              : "border border-zinc-300 dark:border-zinc-700"
          }`}
        >
          Income CSV
        </button>
        <button
          type="button"
          onClick={() => loadSample("obligations")}
          className={`rounded-lg px-3 py-1.5 text-sm ${
            type === "obligations"
              ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950"
              : "border border-zinc-300 dark:border-zinc-700"
          }`}
        >
          Obligations CSV
        </button>
      </div>
      <textarea
        value={csv}
        onChange={(e) => setCsv(e.target.value)}
        rows={12}
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-950"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {loading ? "Importing…" : "Import"}
      </button>
      {message ? (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">{message}</p>
      ) : null}
    </form>
  );
}
