"use client";

import { useState } from "react";
import type { ReportData } from "@/lib/reports";
import { formatMoney } from "@/lib/format";

async function generatePdf(report: ReportData) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  let y = 20;
  const line = (text: string, size = 10) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(size);
    doc.text(text, 14, y);
    y += size === 14 ? 10 : 7;
  };

  line("FinanceTracker Monthly Report", 14);
  line(report.monthLabel, 12);
  line(`Generated: ${new Date(report.generatedAt).toLocaleString()}`, 9);
  y += 4;

  line("Summary", 12);
  line(`Total income: ${formatMoney(report.summary.totalIncome, report.currency)}`);
  line(`Total paid: ${formatMoney(report.summary.totalPaid, report.currency)}`);
  line(`Total due: ${formatMoney(report.summary.totalDue, report.currency)}`);
  line(`Bills paid: ${report.summary.paidCount} / unpaid: ${report.summary.unpaidCount}`);
  y += 4;

  line("Current pay-period plan", 12);
  line(`Must hold: ${formatMoney(report.plan.mustHold, report.currency)}`);
  line(`Safe to spend: ${formatMoney(report.plan.safeToSpend, report.currency)}`);
  line(`Catch-up: ${formatMoney(report.plan.catchUp, report.currency)}`);
  line(report.plan.explanation, 9);
  y += 4;

  line("Obligations", 12);
  for (const o of report.obligations) {
    line(
      `- ${o.name} (${o.category}): ${formatMoney(o.amount, report.currency)} · ${o.dueDay} · ${o.status}`,
      9,
    );
  }
  y += 4;

  line("Income this month", 12);
  for (const i of report.income) {
    line(`${i.date}: ${formatMoney(i.amount, report.currency)} ${i.note}`, 9);
  }
  y += 4;

  line("Payments this month", 12);
  for (const p of report.payments) {
    line(
      `${p.date}: ${p.name} ${formatMoney(p.amount, report.currency)} (${p.category})`,
      9,
    );
  }

  doc.save(`finance-report-${report.monthLabel.replace(/\s/g, "-")}.pdf`);
}

export function ReportsClient({
  initialReport,
}: {
  initialReport: ReportData;
}) {
  const [report, setReport] = useState(initialReport);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  async function loadMonth(newMonth: string) {
    setMonth(newMonth);
    setLoading(true);
    const res = await fetch(`/api/reports?month=${newMonth}T12:00:00`);
    const data = await res.json();
    setReport(data);
    setLoading(false);
  }

  function downloadCsv() {
    window.open(`/api/reports?month=${month}-01T12:00:00&format=csv`, "_blank");
  }

  async function downloadPdf() {
    await generatePdf(report);
  }

  const c = report.currency;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm">
          <span className="text-zinc-500">Month </span>
          <input
            type="month"
            value={month}
            onChange={(e) => loadMonth(e.target.value)}
            className="ml-1 rounded-lg border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>
        <button
          type="button"
          onClick={downloadCsv}
          disabled={loading}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Download CSV
        </button>
        <button
          type="button"
          onClick={downloadPdf}
          disabled={loading}
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          Download PDF
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading report…</p>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs text-zinc-500">Income</p>
              <p className="text-xl font-semibold">
                {formatMoney(report.summary.totalIncome, c)}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs text-zinc-500">Paid</p>
              <p className="text-xl font-semibold">
                {formatMoney(report.summary.totalPaid, c)}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs text-zinc-500">Due</p>
              <p className="text-xl font-semibold">
                {formatMoney(report.summary.totalDue, c)}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs text-zinc-500">Bills</p>
              <p className="text-xl font-semibold">
                {report.summary.paidCount} paid · {report.summary.unpaidCount}{" "}
                unpaid
              </p>
            </div>
          </section>

          <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-2 font-medium">Pay-period snapshot</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {report.plan.explanation}
            </p>
            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-zinc-500">Must hold</dt>
                <dd className="font-medium">
                  {formatMoney(report.plan.mustHold, c)}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">Safe to spend</dt>
                <dd className="font-medium">
                  {formatMoney(report.plan.safeToSpend, c)}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">Catch-up</dt>
                <dd className="font-medium">
                  {formatMoney(report.plan.catchUp, c)}
                </dd>
              </div>
            </dl>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-3 font-medium">Obligations</h2>
              <ul className="space-y-2 text-sm">
                {report.obligations.map((o) => (
                  <li key={o.name} className="flex justify-between gap-2">
                    <span>
                      {o.name}{" "}
                      <span className="text-zinc-500">({o.status})</span>
                    </span>
                    <span>{formatMoney(o.amount, c)}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-3 font-medium">Payments</h2>
              <ul className="space-y-2 text-sm">
                {report.payments.length === 0 ? (
                  <li className="text-zinc-500">No payments this month.</li>
                ) : (
                  report.payments.map((p, i) => (
                    <li key={`${p.date}-${i}`} className="flex justify-between">
                      <span>
                        {p.date} · {p.name}
                      </span>
                      <span>{formatMoney(p.amount, c)}</span>
                    </li>
                  ))
                )}
              </ul>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
