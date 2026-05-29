"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Settings = {
  payFrequency: string;
  payDayOfWeek: number;
  expectedPayAmount: number;
  bufferAmount: number;
  savingsPercent: number;
  viewMode: string;
  planningHorizonWeeks: number;
  currency: string;
  accountBalance: number;
  rolloverSafeToSpend: boolean;
  incomeAverageWeeks: number;
  emailReminders: boolean;
};

const weekdays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function SettingsForm({ settings }: { settings: Settings }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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
        savingsPercent: Number(form.get("savingsPercent")),
        viewMode: form.get("viewMode"),
        planningHorizonWeeks: Number(form.get("planningHorizonWeeks")),
        currency: form.get("currency"),
        accountBalance: Number(form.get("accountBalance")),
        rolloverSafeToSpend: form.get("rolloverSafeToSpend") === "on",
        incomeAverageWeeks: Number(form.get("incomeAverageWeeks")),
        emailReminders: form.get("emailReminders") === "on",
      }),
    });

    setLoading(false);
    setMessage("Settings saved.");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-zinc-500">Pay frequency</span>
          <select
            name="payFrequency"
            defaultValue={settings.payFrequency}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          >
            <option value="weekly">Weekly</option>
            <option value="biweekly">Biweekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-zinc-500">Pay day</span>
          <select
            name="payDayOfWeek"
            defaultValue={settings.payDayOfWeek}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          >
            {weekdays.map((day, index) => (
              <option key={day} value={index}>
                {day}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-zinc-500">Expected pay (per period)</span>
          <input
            name="expectedPayAmount"
            type="number"
            min="0"
            defaultValue={settings.expectedPayAmount}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>
        <label className="block text-sm">
          <span className="text-zinc-500">Account balance</span>
          <input
            name="accountBalance"
            type="number"
            min="0"
            defaultValue={settings.accountBalance}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>
        <label className="block text-sm">
          <span className="text-zinc-500">Minimum buffer</span>
          <input
            name="bufferAmount"
            type="number"
            min="0"
            defaultValue={settings.bufferAmount}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>
        <label className="block text-sm">
          <span className="text-zinc-500">Savings %</span>
          <input
            name="savingsPercent"
            type="number"
            min="0"
            max="100"
            defaultValue={settings.savingsPercent}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>
        <label className="block text-sm">
          <span className="text-zinc-500">Display view</span>
          <select
            name="viewMode"
            defaultValue={settings.viewMode}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-zinc-500">Planning horizon (weeks)</span>
          <input
            name="planningHorizonWeeks"
            type="number"
            min="1"
            max="12"
            defaultValue={settings.planningHorizonWeeks}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>
        <label className="block text-sm">
          <span className="text-zinc-500">Income average window (weeks)</span>
          <input
            name="incomeAverageWeeks"
            type="number"
            min="1"
            max="12"
            defaultValue={settings.incomeAverageWeeks}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>
        <label className="block text-sm">
          <span className="text-zinc-500">Currency code</span>
          <input
            name="currency"
            defaultValue={settings.currency}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input
            name="rolloverSafeToSpend"
            type="checkbox"
            defaultChecked={settings.rolloverSafeToSpend}
          />
          <span>
            Rollover unused safe-to-spend into next period (only when no
            shortfall)
          </span>
        </label>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input
            name="emailReminders"
            type="checkbox"
            defaultChecked={settings.emailReminders}
          />
          <span>Email reminders (when email delivery is configured)</span>
        </label>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {loading ? "Saving…" : "Save settings"}
      </button>
      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
    </form>
  );
}
