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
  bank: `date,amount,description
2026-05-01,-45.20,GROCERY STORE
2026-05-03,1200.00,SALARY ACME`,
};

type PreviewRow = {
  row: number;
  data: Record<string, unknown> | null;
  errors: string[];
};

export function ImportClient() {
  const router = useRouter();
  const [type, setType] = useState<"income" | "obligations" | "bank">("income");
  const [csv, setCsv] = useState(samples.income);
  const [preview, setPreview] = useState<{
    rows: PreviewRow[];
    valid: unknown[];
    skippedDuplicates: number;
  } | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function loadSample(next: keyof typeof samples) {
    setType(next);
    setCsv(samples[next]);
    setPreview(null);
  }

  async function runPreview() {
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/import/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, csv }),
    });
    const data = await res.json();
    setLoading(false);
    setPreview(data);
    if (type === "bank") {
      setMessage(
        `${data.valid?.length ?? 0} bank rows parsed (import as income manually or use income CSV).`,
      );
    }
  }

  async function handleImport() {
    if (type === "bank") {
      setMessage("Use Income CSV format to import paychecks, or copy amounts from preview.");
      return;
    }
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, csv, skipPreview: false }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setMessage(data.error ?? "Import failed");
      if (data.preview) setPreview(data.preview);
      return;
    }
    setMessage(
      `Imported ${data.imported} row(s).${data.skippedDuplicates ? ` Skipped ${data.skippedDuplicates} duplicate(s).` : ""}`,
    );
    setPreview(null);
    router.refresh();
  }

  return (
    <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap gap-2">
        {(["income", "obligations", "bank"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => loadSample(t)}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              type === t
                ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950"
                : "border border-zinc-300 dark:border-zinc-700"
            }`}
          >
            {t === "bank" ? "Bank CSV" : `${t} CSV`}
          </button>
        ))}
      </div>
      <textarea
        value={csv}
        onChange={(e) => {
          setCsv(e.target.value);
          setPreview(null);
        }}
        rows={10}
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-950"
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={runPreview}
          disabled={loading}
          className="rounded-lg border px-4 py-2 text-sm dark:border-zinc-700"
        >
          Preview
        </button>
        <button
          type="button"
          onClick={handleImport}
          disabled={loading || type === "bank"}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          Import
        </button>
      </div>
      {preview ? (
        <div className="max-h-48 overflow-y-auto rounded-lg border border-zinc-200 p-2 text-xs dark:border-zinc-800">
          {preview.rows.map((r) => (
            <div
              key={r.row}
              className={r.errors.length ? "text-red-600" : "text-zinc-600"}
            >
              Row {r.row}:{" "}
              {r.errors.length
                ? r.errors.join(", ")
                : JSON.stringify(r.data)}
            </div>
          ))}
        </div>
      ) : null}
      {message ? (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">{message}</p>
      ) : null}
    </div>
  );
}
