"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/format";
import type { WhatIfResult, WhatIfScenario } from "@/lib/types";

type ObligationOption = {
  id: string;
  name: string;
  amount: number;
  minimumDue: number | null;
  category: string;
};

export function WhatIfPanel({
  currency,
  currentSafeToSpend,
  obligations,
}: {
  currency: string;
  currentSafeToSpend: number;
  obligations: ObligationOption[];
}) {
  const [extraCut, setExtraCut] = useState("");
  const [obligationId, setObligationId] = useState("");
  const [scenario, setScenario] = useState<WhatIfScenario>("cut");
  const [result, setResult] = useState<WhatIfResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function runWhatIf(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/what-if", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        extraCut: Number(extraCut) || 0,
        obligationId: obligationId || undefined,
        scenario: obligationId ? scenario : "cut",
        customAmount: scenario === "custom" ? Number(extraCut) : undefined,
      }),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="font-medium">What-if</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Model cutting spending or changing a bill (current safe-to-spend:{" "}
        {formatMoney(currentSafeToSpend, currency)}).
      </p>
      <form onSubmit={runWhatIf} className="mt-3 space-y-3">
        <div className="flex flex-wrap gap-2">
          <label className="text-sm">
            <span className="text-zinc-500">Bill (optional)</span>
            <select
              value={obligationId}
              onChange={(e) => {
                setObligationId(e.target.value);
                if (e.target.value) setScenario("skip");
              }}
              className="mt-1 block w-48 rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
            >
              <option value="">General cut</option>
              {obligations.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </label>
          {obligationId ? (
            <label className="text-sm">
              <span className="text-zinc-500">Scenario</span>
              <select
                value={scenario}
                onChange={(e) =>
                  setScenario(e.target.value as WhatIfScenario)
                }
                className="mt-1 block w-40 rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
              >
                <option value="skip">Skip this bill</option>
                <option value="minimum">Pay minimum only</option>
                <option value="custom">Custom amount</option>
              </select>
            </label>
          ) : null}
          {(scenario === "cut" || scenario === "custom" || !obligationId) && (
            <label className="text-sm">
              <span className="text-zinc-500">
                {scenario === "custom" ? "Pay amount" : "Amount to cut"}
              </span>
              <input
                type="number"
                min="0"
                step="1"
                value={extraCut}
                onChange={(e) => setExtraCut(e.target.value)}
                className="mt-1 block w-32 rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>
          )}
        </div>
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
