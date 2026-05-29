"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function OnboardingForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);

    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        payFrequency: form.get("payFrequency"),
        payDayOfWeek: Number(form.get("payDayOfWeek")),
        expectedPayAmount: Number(form.get("expectedPayAmount")),
        bufferAmount: Number(form.get("bufferAmount")),
        accountBalance: Number(form.get("accountBalance")),
        currency: form.get("currency"),
        onboardingComplete: true,
      }),
    });

    setLoading(false);
    router.push("/obligations");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-lg space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div>
        <h1 className="text-xl font-semibold">Welcome to FinanceTracker</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Set up your pay schedule so we can plan around weekly income and
          scattered bills.
        </p>
      </div>
      <label className="block text-sm">
        <span className="text-zinc-500">How often do you get paid?</span>
        <select
          name="payFrequency"
          defaultValue="weekly"
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
        >
          <option value="weekly">Weekly</option>
          <option value="biweekly">Biweekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </label>
      <label className="block text-sm">
        <span className="text-zinc-500">Pay day (weekday)</span>
        <select
          name="payDayOfWeek"
          defaultValue={5}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
        >
          <option value={5}>Friday</option>
          <option value={4}>Thursday</option>
          <option value={1}>Monday</option>
        </select>
      </label>
      <label className="block text-sm">
        <span className="text-zinc-500">Typical paycheck amount</span>
        <input
          name="expectedPayAmount"
          type="number"
          min="0"
          required
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </label>
      <label className="block text-sm">
        <span className="text-zinc-500">Current account balance</span>
        <input
          name="accountBalance"
          type="number"
          min="0"
          defaultValue={0}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </label>
      <label className="block text-sm">
        <span className="text-zinc-500">Safety buffer to keep</span>
        <input
          name="bufferAmount"
          type="number"
          min="0"
          defaultValue={1000}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </label>
      <label className="block text-sm">
        <span className="text-zinc-500">Currency</span>
        <input
          name="currency"
          defaultValue="EUR"
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {loading ? "Saving…" : "Continue to obligations"}
      </button>
    </form>
  );
}
