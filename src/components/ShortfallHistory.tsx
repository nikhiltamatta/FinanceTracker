import { formatDate, formatMoney } from "@/lib/format";
import { getShortfallHistory } from "@/lib/snapshots";

export async function ShortfallHistory({
  userId,
  currency,
}: {
  userId: string;
  currency: string;
}) {
  const history = await getShortfallHistory(userId);

  if (history.length === 0) {
    return (
      <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="font-medium">Shortfall history</h2>
        <p className="mt-2 text-sm text-zinc-500">
          No shortfall periods recorded yet. Snapshots are saved when you view
          the dashboard.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="font-medium">Shortfall history</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Past pay periods where catch-up was needed.
      </p>
      <ul className="mt-3 divide-y divide-zinc-200 dark:divide-zinc-800">
        {history.map((row) => (
          <li
            key={row.id}
            className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm"
          >
            <span>
              {formatDate(new Date(row.periodStart))} –{" "}
              {formatDate(new Date(row.periodEnd))}
            </span>
            <span className="font-medium text-red-600 tabular-nums">
              {formatMoney(row.catchUp, currency)} catch-up
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
