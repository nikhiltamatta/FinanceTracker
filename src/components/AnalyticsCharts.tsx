"use client";

import type { AnalyticsSummary } from "@/lib/analytics";
import { formatMoney } from "@/lib/format";

function BarChart({
  data,
  currency,
}: {
  data: { label: string; income: number; paid: number; due: number }[];
  currency: string;
}) {
  const max = Math.max(
    ...data.flatMap((d) => [d.income, d.paid, d.due]),
    1,
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> Income
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-blue-500" /> Paid
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-amber-500" /> Due
        </span>
      </div>
      <div className="flex items-end justify-between gap-2 overflow-x-auto pb-2">
        {data.map((month) => (
          <div
            key={month.label}
            className="flex min-w-[56px] flex-1 flex-col items-center gap-1"
          >
            <div className="flex h-32 w-full items-end justify-center gap-0.5">
              <div
                className="w-2 rounded-t bg-emerald-500"
                style={{ height: `${(month.income / max) * 100}%` }}
                title={`Income: ${formatMoney(month.income, currency)}`}
              />
              <div
                className="w-2 rounded-t bg-blue-500"
                style={{ height: `${(month.paid / max) * 100}%` }}
                title={`Paid: ${formatMoney(month.paid, currency)}`}
              />
              <div
                className="w-2 rounded-t bg-amber-500"
                style={{ height: `${(month.due / max) * 100}%` }}
                title={`Due: ${formatMoney(month.due, currency)}`}
              />
            </div>
            <span className="text-[10px] text-zinc-500">{month.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryBars({
  data,
  currency,
}: {
  data: { category: string; amount: number }[];
  currency: string;
}) {
  const max = Math.max(...data.map((d) => d.amount), 1);

  return (
    <ul className="space-y-3">
      {data.length === 0 ? (
        <li className="text-sm text-zinc-500">No obligations this month.</li>
      ) : (
        data.map((item) => (
          <li key={item.category}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="capitalize">{item.category}</span>
              <span className="tabular-nums">
                {formatMoney(item.amount, currency)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${(item.amount / max) * 100}%` }}
              />
            </div>
          </li>
        ))
      )}
    </ul>
  );
}

export function AnalyticsCharts({
  analytics,
  currency,
}: {
  analytics: AnalyticsSummary;
  currency: string;
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 font-medium">6-month trend</h2>
        <BarChart data={analytics.monthlyTrend} currency={currency} />
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 font-medium">Obligations by category</h2>
        <CategoryBars
          data={analytics.categoryBreakdown}
          currency={currency}
        />
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-3 font-medium">Recent payments</h2>
        {analytics.recentPayments.length === 0 ? (
          <p className="text-sm text-zinc-500">No payments recorded yet.</p>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {analytics.recentPayments.map((p) => (
              <li
                key={p.id}
                className="flex justify-between py-2 text-sm"
              >
                <span>
                  {p.name}{" "}
                  <span className="text-zinc-500">({p.category})</span>
                </span>
                <span className="tabular-nums">
                  {formatMoney(p.amount, currency)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
