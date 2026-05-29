"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatMoney } from "@/lib/format";

type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  active: boolean;
};

export function GoalsPanel({
  goals: initial,
  currency,
}: {
  goals: Goal[];
  currency: string;
}) {
  const router = useRouter();
  const [goals, setGoals] = useState(initial);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");

  async function addGoal(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        targetAmount: Number(target),
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setGoals([...goals, data.goal]);
      setName("");
      setTarget("");
      router.refresh();
    }
  }

  async function remove(id: string) {
    await fetch(`/api/goals/${id}`, { method: "DELETE" });
    setGoals(goals.filter((g) => g.id !== id));
    router.refresh();
  }

  return (
    <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="font-medium">Savings goals</h2>
      <p className="text-sm text-zinc-500">
        Remaining goal amounts reduce safe-to-spend in your plan.
      </p>
      {goals.length > 0 ? (
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {goals.map((g) => {
            const remaining = Math.max(0, g.targetAmount - g.currentAmount);
            return (
              <li
                key={g.id}
                className="flex items-center justify-between py-2 text-sm"
              >
                <div>
                  <p className="font-medium">{g.name}</p>
                  <p className="text-zinc-500">
                    {formatMoney(g.currentAmount, currency)} /{" "}
                    {formatMoney(g.targetAmount, currency)} ·{" "}
                    {formatMoney(remaining, currency)} left
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(g.id)}
                  className="text-xs text-red-600"
                >
                  Delete
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-zinc-500">No goals yet.</p>
      )}
      <form onSubmit={addGoal} className="flex flex-wrap gap-2">
        <input
          placeholder="Goal name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <input
          type="number"
          placeholder="Target"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          required
          className="w-28 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white"
        >
          Add goal
        </button>
      </form>
    </div>
  );
}
