"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatMoney } from "@/lib/format";

export function MarkPaidButton({
  obligationId,
  amount,
  dueDate,
  paidThisMonth,
  paidAmount = 0,
  currency = "EUR",
  size = "sm",
}: {
  obligationId: string;
  amount: number;
  dueDate?: string;
  paidThisMonth?: boolean;
  paidAmount?: number;
  currency?: string;
  size?: "sm" | "md";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [payAmount, setPayAmount] = useState(String(amount));

  const remaining = Math.max(0, amount - paidAmount);
  const partial = paidAmount > 0 && !paidThisMonth;

  async function submitPayment(paymentAmount: number) {
    setLoading(true);
    await fetch("/api/payments/mark-paid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        obligationId,
        amount: paymentAmount,
        dueDate,
        action: paidThisMonth ? "unmark" : undefined,
      }),
    });
    setLoading(false);
    setShowModal(false);
    router.refresh();
  }

  async function handleQuickClick() {
    if (paidThisMonth) {
      await submitPayment(amount);
      return;
    }
    setPayAmount(String(remaining > 0 ? remaining : amount));
    setShowModal(true);
  }

  const sizeClass =
    size === "md" ? "px-3 py-1.5 text-sm" : "px-2 py-1 text-xs";

  return (
    <>
      <button
        type="button"
        onClick={handleQuickClick}
        disabled={loading}
        className={`rounded-lg font-medium transition-colors disabled:opacity-50 ${sizeClass} ${
          paidThisMonth
            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
            : partial
              ? "bg-amber-100 text-amber-900 hover:bg-amber-200"
              : "bg-emerald-600 text-white hover:bg-emerald-700"
        }`}
      >
        {loading
          ? "…"
          : paidThisMonth
            ? "Paid ✓"
            : partial
              ? `Partial (${formatMoney(paidAmount, currency)})`
              : "Mark paid"}
      </button>

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-4 shadow-lg dark:bg-zinc-900">
            <h3 className="font-medium">Record payment</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Due {formatMoney(amount, currency)}
              {paidAmount > 0
                ? ` · Already paid ${formatMoney(paidAmount, currency)}`
                : ""}
            </p>
            <label className="mt-3 block text-sm">
              <span className="text-zinc-500">Amount paid</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => submitPayment(Number(payAmount) || amount)}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => submitPayment(remaining || amount)}
                className="rounded-lg border px-3 py-1.5 text-sm"
              >
                Pay full remaining
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg px-3 py-1.5 text-sm text-zinc-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
