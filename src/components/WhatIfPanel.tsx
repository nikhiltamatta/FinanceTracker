"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/format";
import type { WhatIfResult } from "@/lib/types";

export function WhatIfPanel({
  currency,
  currentSafeToSpend,
}: {
  currency: string;
  currentSafeToSpend: number;
}) {
  const [extraCut, setExtraCut] = useState("");
  const [result, setResult] = useState<WhatIfResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function runWhatIf(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/what-if", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ extraCut: Number(extraCut) || 0 }),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="font-medium">What-if</h2>
      <p className="mt-1 text-sm text-zinc-500">
        See how cutting a bill or expense affects safe-to-spend (current:{" "}
        {formatMoney(currentSafeToSpend, currency)}).
      </p>
      <form onSubmit={runWhatIf} className="mt-3 flex flex-wrap items-end gap-2">
        <label className="text-sm">
          <span className="text-zinc-500">Amount to cut</span>
          <input
            type="number"
            min="0"
            step="1"
            value={extraCut}
            onChange={(e) => setExtraCut(e.target.value)}
            className="mt-1 block w-40 rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
            placeholder="500"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-200 dark:text-zinc-900"
        >
          {loading ? "Calculating…" : "Calculate"}
        </button>
      </form>
      {result ? (
        <p className="mt-3 text-sm">
          New safe-to-spend:{" "}
          <strong>{formatMoney(result.newSafeToSpend, currency)}</strong>
          {" — "}
          {result.message}
        </p>
      ) : null}
    </section>
  );
}
