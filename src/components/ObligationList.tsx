"use client";

import { MarkPaidButton } from "@/components/MarkPaidButton";
import { formatMoney } from "@/lib/format";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export type ObligationRow = {
  id: string;
  name: string;
  category: string;
  amount: number;
  dueRuleType: string;
  dueDayOfMonth: number | null;
  dueEveryNWeeks: number | null;
  dueOneOffDate: string | null;
  priority: string;
  active: boolean;
  paidThisMonth: boolean;
  sharedWithHousehold?: boolean;
  lender: string | null;
  note: string | null;
  minimumDue: number | null;
  statementBalance: number | null;
  loanEndDate: string | null;
  interestRate: number | null;
};

export function ObligationList({
  obligations,
  currency,
}: {
  obligations: ObligationRow[];
  currency: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<ObligationRow | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return obligations;
    return obligations.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.category.toLowerCase().includes(q) ||
        (o.lender?.toLowerCase().includes(q) ?? false),
    );
  }, [obligations, query]);

  async function remove(id: string) {
    if (!confirm("Delete this obligation?")) return;
    await fetch(`/api/obligations/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function saveEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    const form = new FormData(e.currentTarget);
    await fetch(`/api/obligations/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        category: form.get("category"),
        amount: form.get("amount"),
        dueRuleType: form.get("dueRuleType"),
        dueDayOfMonth: form.get("dueDayOfMonth") || null,
        priority: form.get("priority"),
        minimumDue: form.get("minimumDue") || null,
        active: form.get("active") === "on",
        sharedWithHousehold: form.get("sharedWithHousehold") === "on",
      }),
    });
    setEditing(null);
    router.refresh();
  }

  if (obligations.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        No obligations yet. Add rent, EMIs, or cards to get your pay-period plan.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <input
        type="search"
        placeholder="Search by name, category, lender…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
      />
      {filtered.length === 0 ? (
        <p className="text-sm text-zinc-500">No matches for &quot;{query}&quot;.</p>
      ) : (
        <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
          {filtered.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
            >
              <div>
                <p className="font-medium">
                  {item.name}{" "}
                  <span className="text-xs font-normal text-zinc-500">
                    ({item.category})
                    {!item.active ? " · inactive" : ""}
                  </span>
                </p>
                <p className="text-sm text-zinc-500">
                  {item.dueRuleType === "day_of_month" && item.dueDayOfMonth
                    ? `Due day ${item.dueDayOfMonth}`
                    : item.dueRuleType}{" "}
                  · {item.priority.replace("_", " ")}
                  {item.category === "card" && item.minimumDue
                    ? ` · min ${formatMoney(item.minimumDue, currency)}`
                    : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold tabular-nums">
                  {formatMoney(item.amount, currency)}
                </span>
                <MarkPaidButton
                  obligationId={item.id}
                  amount={item.minimumDue ?? item.amount}
                  paidThisMonth={item.paidThisMonth}
                />
                <button
                  type="button"
                  onClick={() => setEditing(item)}
                  className="rounded-lg px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  className="rounded-lg px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={saveEdit}
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-4 shadow-lg dark:bg-zinc-900"
          >
            <h3 className="font-medium">Edit {editing.name}</h3>
            <div className="mt-3 space-y-2 text-sm">
              <input
                name="name"
                defaultValue={editing.name}
                required
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
              />
              <select
                name="category"
                defaultValue={editing.category}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
              >
                {["rent", "loan", "card", "utilities", "other"].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                name="amount"
                type="number"
                defaultValue={editing.amount}
                required
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
              />
              <input type="hidden" name="dueRuleType" value={editing.dueRuleType} />
              {editing.dueDayOfMonth != null ? (
                <input
                  name="dueDayOfMonth"
                  type="number"
                  defaultValue={editing.dueDayOfMonth}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
                />
              ) : null}
              {editing.category === "card" ? (
                <input
                  name="minimumDue"
                  type="number"
                  placeholder="Minimum due"
                  defaultValue={editing.minimumDue ?? ""}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
                />
              ) : null}
              <select
                name="priority"
                defaultValue={editing.priority}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
              >
                <option value="must_pay">Must pay</option>
                <option value="flexible">Flexible</option>
              </select>
              <label className="flex items-center gap-2">
                <input name="active" type="checkbox" defaultChecked={editing.active} />
                Active
              </label>
              <label className="flex items-center gap-2">
                <input
                  name="sharedWithHousehold"
                  type="checkbox"
                  defaultChecked={editing.sharedWithHousehold}
                />
                Share with household
              </label>
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
    </div>
  );
}
