import { subWeeks } from "date-fns";
import { toStartOfDay } from "@/lib/dates";
import type { IncomeInput } from "@/lib/types";

export function computeAverageIncome(
  incomeEntries: IncomeInput[],
  weeks: number,
  today: Date = new Date(),
): number {
  if (weeks <= 0 || incomeEntries.length === 0) return 0;

  const cutoff = subWeeks(toStartOfDay(today), weeks);
  const recent = incomeEntries
    .filter((e) => toStartOfDay(e.date) >= cutoff)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  if (recent.length === 0) return 0;

  const slice = recent.slice(0, Math.max(weeks, recent.length));
  const total = slice.reduce((s, e) => s + e.amount, 0);
  return total / slice.length;
}

export function resolveEffectiveIncome(
  incomeThisPeriod: number,
  averageIncome: number,
  expectedPayAmount: number,
): { amount: number; source: "actual" | "average" | "expected" } {
  if (incomeThisPeriod > 0) {
    return { amount: incomeThisPeriod, source: "actual" };
  }
  if (averageIncome > 0) {
    return { amount: averageIncome, source: "average" };
  }
  return { amount: expectedPayAmount, source: "expected" };
}
