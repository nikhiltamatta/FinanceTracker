"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function MarkPaidButton({
  obligationId,
  amount,
  dueDate,
  paidThisMonth,
  size = "sm",
}: {
  obligationId: string;
  amount: number;
  dueDate?: string;
  paidThisMonth?: boolean;
  size?: "sm" | "md";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    await fetch("/api/payments/mark-paid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        obligationId,
        amount,
        dueDate,
        action: paidThisMonth ? "unmark" : undefined,
      }),
    });
    setLoading(false);
    router.refresh();
  }

  const sizeClass =
    size === "md"
      ? "px-3 py-1.5 text-sm"
      : "px-2 py-1 text-xs";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`rounded-lg font-medium transition-colors disabled:opacity-50 ${sizeClass} ${
        paidThisMonth
          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
          : "bg-emerald-600 text-white hover:bg-emerald-700"
      }`}
    >
      {loading ? "…" : paidThisMonth ? "Paid ✓" : "Mark paid"}
    </button>
  );
}
