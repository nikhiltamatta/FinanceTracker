"use client";

import { MarkPaidButton } from "@/components/MarkPaidButton";
import { formatDate, formatMoney } from "@/lib/format";

export function DueItemRow({
  obligationId,
  name,
  amount,
  dueDate,
  currency,
  paidThisMonth,
  paidAmount = 0,
}: {
  obligationId: string;
  name: string;
  amount: number;
  dueDate: Date;
  currency: string;
  paidThisMonth: boolean;
  paidAmount?: number;
}) {
  const remaining = Math.max(0, amount - paidAmount);
  const partial = paidAmount > 0 && !paidThisMonth;

  if (paidThisMonth) {
    return (
      <li className="flex flex-wrap items-center justify-between gap-2 opacity-60">
        <span className="text-sm line-through">
          {name}{" "}
          <span className="text-zinc-500">· {formatDate(dueDate)}</span>
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm tabular-nums">
            {formatMoney(amount, currency)}
          </span>
          <MarkPaidButton
            obligationId={obligationId}
            amount={amount}
            dueDate={dueDate.toISOString()}
            paidThisMonth
            paidAmount={paidAmount}
            currency={currency}
          />
        </div>
      </li>
    );
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-2">
      <span className="text-sm">
        {name}{" "}
        <span className="text-zinc-500">· {formatDate(dueDate)}</span>
        {partial ? (
          <span className="text-amber-600">
            {" "}
            · paid {formatMoney(paidAmount, currency)} of{" "}
            {formatMoney(amount, currency)}
          </span>
        ) : null}
      </span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium tabular-nums">
          {partial
            ? formatMoney(remaining, currency)
            : formatMoney(amount, currency)}
        </span>
        <MarkPaidButton
          obligationId={obligationId}
          amount={amount}
          dueDate={dueDate.toISOString()}
          paidAmount={paidAmount}
          currency={currency}
        />
      </div>
    </li>
  );
}
