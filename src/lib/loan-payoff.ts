import { addMonths, differenceInCalendarMonths, startOfMonth } from "date-fns";
import type { LoanPayoffProjection, ObligationInput } from "@/lib/types";

function monthsToPayoffAmortized(
  balance: number,
  monthlyPayment: number,
  annualRatePercent: number,
): number {
  if (balance <= 0) return 0;
  if (monthlyPayment <= 0) return 999;

  const r = annualRatePercent / 100 / 12;
  if (r <= 0) {
    return Math.ceil(balance / monthlyPayment);
  }

  const interestOnly = balance * r;
  if (monthlyPayment <= interestOnly) return 999;

  let remaining = balance;
  let months = 0;
  while (remaining > 0.01 && months < 600) {
    const interest = remaining * r;
    const principal = monthlyPayment - interest;
    remaining -= principal;
    months++;
  }
  return months;
}

export function projectLoanPayoffs(
  obligations: ObligationInput[],
  today: Date = new Date(),
): LoanPayoffProjection[] {
  const loans = obligations.filter(
    (o) => o.active && o.category === "loan",
  );

  return loans
    .map((o) => {
      const monthlyPayment = o.amount;
      const balance =
        o.statementBalance && o.statementBalance > 0
          ? o.statementBalance
          : monthlyPayment *
            Math.max(
              1,
              o.loanEndDate
                ? differenceInCalendarMonths(
                    startOfMonth(o.loanEndDate),
                    startOfMonth(today),
                  )
                : 12,
            );

      const rate = o.interestRate ?? 0;
      const remainingMonths =
        o.loanEndDate && !rate
          ? Math.max(
              0,
              differenceInCalendarMonths(
                startOfMonth(o.loanEndDate),
                startOfMonth(today),
              ),
            )
          : monthsToPayoffAmortized(balance, monthlyPayment, rate);

      const payoffDate = o.loanEndDate
        ? o.loanEndDate
        : addMonths(startOfMonth(today), remainingMonths);

      const totalRemaining =
        rate > 0
          ? monthlyPayment * remainingMonths
          : monthlyPayment * remainingMonths;

      return {
        obligationId: o.id,
        name: o.name,
        monthlyPayment,
        remainingMonths,
        payoffDate,
        totalRemaining: Math.max(0, totalRemaining),
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
  if (payment <= 0) return 999;
  return Math.ceil(balance / payment);
}
