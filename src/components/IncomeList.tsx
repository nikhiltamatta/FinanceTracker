"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatDate, formatMoney } from "@/lib/format";

type IncomeEntry = {
  id: string;
  date: string;
  amount: number;
  note: string | null;
};

export function IncomeList({
  entries,
  currency,
}: {
  entries: IncomeEntry[];
  currency: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<IncomeEntry | null>(null);

  async function remove(id: string) {
    if (!confirm("Delete this income entry?")) return;
    await fetch(`/api/income/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function saveEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    const form = new FormData(e.currentTarget);
    await fetch(`/api/income/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: form.get("date"),
        amount: form.get("amount"),
        note: form.get("note") || null,
      }),
    });
    setEditing(null);
    router.refresh();
  }

  if (entries.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        No paychecks logged yet. Add your weekly income to improve the plan.
      </p>
    );
  }

  return (
    <>
      <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="flex items-center justify-between px-4 py-3"
          >
            <div>
              <p className="font-medium">
                {formatMoney(entry.amount, currency)}
              </p>
              <p className="text-sm text-zinc-500">
                {formatDate(new Date(entry.date))}
                {entry.note ? ` · ${entry.note}` : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditing(entry)}
                className="text-xs text-zinc-600 hover:underline"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => remove(entry.id)}
                className="text-xs text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={saveEdit}
            className="w-full max-w-sm rounded-xl bg-white p-4 shadow-lg dark:bg-zinc-900"
          >
            <h3 className="font-medium">Edit income</h3>
            <div className="mt-3 space-y-2 text-sm">
              <input
                name="date"
                type="date"
                defaultValue={editing.date.slice(0, 10)}
                required
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
              />
              <input
                name="amount"
                type="number"
                defaultValue={editing.amount}
                required
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
              />
              <input
                name="note"
                defaultValue={editing.note ?? ""}
                placeholder="Note"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-lg border px-3 py-1.5 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
