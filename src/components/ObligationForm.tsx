"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const categories = ["rent", "loan", "card", "utilities", "other"];

export function ObligationForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [dueRuleType, setDueRuleType] = useState("day_of_month");
  const [category, setCategory] = useState("rent");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);

    const payload = {
      name: form.get("name"),
      category: form.get("category"),
      amount: form.get("amount"),
      dueRuleType: form.get("dueRuleType"),
      dueDayOfMonth:
        dueRuleType === "day_of_month" ? form.get("dueDayOfMonth") : null,
      dueEveryNWeeks:
        dueRuleType === "every_n_weeks" ? form.get("dueEveryNWeeks") : null,
      dueOneOffDate:
        dueRuleType === "one_off" ? form.get("dueOneOffDate") : null,
      priority: form.get("priority"),
      lender: form.get("lender") || null,
      note: form.get("note") || null,
      minimumDue: form.get("minimumDue") || null,
      statementBalance: form.get("statementBalance") || null,
      loanEndDate: form.get("loanEndDate") || null,
      interestRate: form.get("interestRate") || null,
    };

    await fetch("/api/obligations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);
    router.refresh();
    (event.target as HTMLFormElement).reset();
    setCategory("rent");
    setDueRuleType("day_of_month");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <h3 className="font-medium">Add obligation</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-zinc-500">Name</span>
          <input
            name="name"
            required
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
            placeholder="Rent"
          />
        </label>
        <label className="block text-sm">
          <span className="text-zinc-500">Category</span>
          <select
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-zinc-500">
            {category === "card" ? "Statement / full amount" : "Amount"}
          </span>
          <input
            name="amount"
            type="number"
            min="0"
            step="0.01"
            required
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>
        <label className="block text-sm">
          <span className="text-zinc-500">Priority</span>
          <select
            name="priority"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          >
            <option value="must_pay">Must pay</option>
            <option value="flexible">Flexible</option>
          </select>
        </label>
        {category === "card" && (
          <>
            <label className="block text-sm">
              <span className="text-zinc-500">Minimum due (planning)</span>
              <input
                name="minimumDue"
                type="number"
                min="0"
                step="0.01"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>
            <label className="block text-sm">
              <span className="text-zinc-500">Statement balance</span>
              <input
                name="statementBalance"
                type="number"
                min="0"
                step="0.01"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>
          </>
        )}
        {category === "loan" && (
          <>
            <label className="block text-sm">
              <span className="text-zinc-500">Lender</span>
              <input
                name="lender"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>
            <label className="block text-sm">
              <span className="text-zinc-500">Loan end date</span>
              <input
                name="loanEndDate"
                type="date"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>
            <label className="block text-sm">
              <span className="text-zinc-500">Interest rate %</span>
              <input
                name="interestRate"
                type="number"
                min="0"
                step="0.01"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>
          </>
        )}
        <label className="block text-sm sm:col-span-2">
          <span className="text-zinc-500">Due rule</span>
          <select
            name="dueRuleType"
            value={dueRuleType}
            onChange={(e) => setDueRuleType(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          >
            <option value="day_of_month">Day of month</option>
            <option value="every_n_weeks">Every N weeks</option>
            <option value="one_off">One-off date</option>
          </select>
        </label>
        {dueRuleType === "day_of_month" && (
          <label className="block text-sm">
            <span className="text-zinc-500">Due day (1–31)</span>
            <input
              name="dueDayOfMonth"
              type="number"
              min="1"
              max="31"
              defaultValue={1}
              required
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>
        )}
        {dueRuleType === "every_n_weeks" && (
          <label className="block text-sm">
            <span className="text-zinc-500">Every N weeks</span>
            <input
              name="dueEveryNWeeks"
              type="number"
              min="1"
              defaultValue={2}
              required
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>
        )}
        {dueRuleType === "one_off" && (
          <label className="block text-sm">
            <span className="text-zinc-500">Due date</span>
            <input
              name="dueOneOffDate"
              type="date"
              required
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>
        )}
        <label className="block text-sm sm:col-span-2">
          <span className="text-zinc-500">Note</span>
          <input
            name="note"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {loading ? "Saving…" : "Add obligation"}
      </button>
    </form>
  );
}
