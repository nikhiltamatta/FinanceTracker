import { addMonths, differenceInCalendarMonths, startOfMonth } from "date-fns";
import type { LoanPayoffProjection, ObligationInput } from "@/lib/types";

export function projectLoanPayoffs(
  obligations: ObligationInput[],
  today: Date = new Date(),
): LoanPayoffProjection[] {
  const loans = obligations.filter(
    (o) => o.active && o.category === "loan" && o.loanEndDate,
  );

  return loans
    .map((o) => {
      const end = o.loanEndDate!;
      const monthsLeft = Math.max(
        0,
        differenceInCalendarMonths(startOfMonth(end), startOfMonth(today)),
      );
      const monthlyPayment = o.amount;
      const totalRemaining = monthlyPayment * monthsLeft;

      return {
        obligationId: o.id,
        name: o.name,
        monthlyPayment,
        remainingMonths: monthsLeft,
        payoffDate: end,
        totalRemaining,
      };
    })
    .sort((a, b) => a.payoffDate.getTime() - b.payoffDate.getTime());
}

export function estimatePayoffIfExtra(
  balance: number,
  monthlyPayment: number,
  extraPerMonth: number,
): number {
  if (balance <= 0) return 0;
  const payment = monthlyPayment + extraPerMonth;
  if (payment <= 0) return Infinity;
  return Math.ceil(balance / payment);
}
