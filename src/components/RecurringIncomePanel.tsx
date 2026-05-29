"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatMoney } from "@/lib/format";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type Item = {
  id: string;
  amount: number;
  payDayOfWeek: number;
  note: string | null;
  active: boolean;
};

export function RecurringIncomePanel({
  items: initial,
  currency,
  defaultPayDay,
}: {
  items: Item[];
  currency: string;
  defaultPayDay: number;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [amount, setAmount] = useState("");
  const [payDay, setPayDay] = useState(defaultPayDay);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/recurring-income", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(amount), payDayOfWeek: payDay }),
    });
    const data = await res.json();
    if (res.ok) {
      setItems([data.item, ...items]);
      setAmount("");
      router.refresh();
    }
  }

  async function remove(id: string) {
    await fetch(`/api/recurring-income/${id}`, { method: "DELETE" });
    setItems(items.filter((i) => i.id !== id));
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="font-medium">Recurring paycheck</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Auto-creates income entries on your pay weekday (last 8 weeks).
      </p>
      {items.length > 0 ? (
        <ul className="mt-3 space-y-2 text-sm">
          {items.map((i) => (
            <li key={i.id} className="flex justify-between">
              <span>
                {formatMoney(i.amount, currency)} every {days[i.payDayOfWeek]}
              </span>
              <button
                type="button"
                onClick={() => remove(i.id)}
                className="text-red-600"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <form onSubmit={add} className="mt-3 flex flex-wrap gap-2">
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="w-28 rounded-lg border px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <select
          value={payDay}
          onChange={(e) => setPayDay(Number(e.target.value))}
          className="rounded-lg border px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        >
          {days.map((d, idx) => (
            <option key={d} value={idx}>
              {d}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white"
        >
          Add recurring
        </button>
      </form>
    </div>
  );
}
