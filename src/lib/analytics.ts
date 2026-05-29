import {
  eachMonthOfInterval,
  endOfMonth,
  format,
  startOfMonth,
  subMonths,
} from "date-fns";
import { collectUpcomingDues } from "@/lib/allocation";
import { prisma } from "@/lib/db";
import { toObligationInput } from "@/lib/mappers";
import { ensureMonthlyPaidReset } from "@/lib/payments";

export type MonthBucket = {
  key: string;
  label: string;
  income: number;
  paid: number;
  due: number;
};

export type CategoryBreakdown = {
  category: string;
  amount: number;
  count: number;
};

export type AnalyticsSummary = {
  monthKey: string;
  monthLabel: string;
  totalIncome: number;
  totalPaid: number;
  totalDue: number;
  unpaidCount: number;
  paidCount: number;
  safeToSpendAvg: number;
  monthlyTrend: MonthBucket[];
  categoryBreakdown: CategoryBreakdown[];
  recentPayments: {
    id: string;
    name: string;
    amount: number;
    paidAt: string;
    category: string;
  }[];
};

export async function computeAnalytics(
  userId: string,
  referenceMonth: Date = new Date(),
): Promise<AnalyticsSummary> {
  await ensureMonthlyPaidReset(userId);

  const monthStart = startOfMonth(referenceMonth);
  const monthEnd = endOfMonth(referenceMonth);
  const monthKey = format(referenceMonth, "yyyy-MM");
  const monthLabel = format(referenceMonth, "MMMM yyyy");

  const [incomeEntries, obligations, payments] = await Promise.all([
    prisma.incomeEntry.findMany({
      where: { userId, date: { gte: monthStart, lte: monthEnd } },
    }),
    prisma.obligation.findMany({ where: { userId, active: true } }),
    prisma.payment.findMany({
      where: {
        paidAt: { gte: monthStart, lte: monthEnd },
        obligation: { userId },
      },
      include: { obligation: true },
      orderBy: { paidAt: "desc" },
    }),
  ]);

  const obligationInputs = obligations.map(toObligationInput);
  const duesThisMonth = collectUpcomingDues(
    obligationInputs,
    monthStart,
    monthEnd,
  );

  const totalIncome = incomeEntries.reduce((s, e) => s + e.amount, 0);
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const totalDue = duesThisMonth.reduce((s, d) => s + d.amount, 0);
  const paidCount = obligations.filter((o) => o.paidThisMonth).length;
  const unpaidCount = obligations.length - paidCount;

  const categoryMap = new Map<string, { amount: number; count: number }>();
  for (const due of duesThisMonth) {
    const existing = categoryMap.get(due.category) ?? { amount: 0, count: 0 };
    categoryMap.set(due.category, {
      amount: existing.amount + due.amount,
      count: existing.count + 1,
    });
  }

  const categoryBreakdown: CategoryBreakdown[] = Array.from(
    categoryMap.entries(),
  )
    .map(([category, data]) => ({ category, ...data }))
    .sort((a, b) => b.amount - a.amount);

  const trendStart = subMonths(monthStart, 5);
  const trendMonths = eachMonthOfInterval({
    start: trendStart,
    end: monthStart,
  });

  const allIncome = await prisma.incomeEntry.findMany({
    where: {
      userId,
      date: {
        gte: trendStart,
        lte: monthEnd,
      },
    },
  });

  const allPayments = await prisma.payment.findMany({
    where: {
      paidAt: {
        gte: trendStart,
        lte: monthEnd,
      },
      obligation: { userId },
    },
    include: { obligation: true },
  });

  const monthlyTrend: MonthBucket[] = trendMonths.map((m) => {
    const start = startOfMonth(m);
    const end = endOfMonth(m);
    const key = format(m, "yyyy-MM");
    const label = format(m, "MMM");

    const income = allIncome
      .filter((e) => e.date >= start && e.date <= end)
      .reduce((s, e) => s + e.amount, 0);

    const paid = allPayments
      .filter((p) => p.paidAt >= start && p.paidAt <= end)
      .reduce((s, p) => s + p.amount, 0);

    const due = collectUpcomingDues(obligationInputs, start, end).reduce(
      (s, d) => s + d.amount,
      0,
    );

    return { key, label, income, paid, due };
  });

  const safeToSpendAvg =
    totalIncome > 0
      ? Math.max(0, totalIncome - totalPaid - totalDue * 0.1)
      : 0;

  return {
    monthKey,
    monthLabel,
    totalIncome,
    totalPaid,
    totalDue,
    unpaidCount,
    paidCount,
    safeToSpendAvg,
    monthlyTrend,
    categoryBreakdown,
    recentPayments: payments.slice(0, 10).map((p) => ({
      id: p.id,
      name: p.obligation.name,
      amount: p.amount,
      paidAt: p.paidAt.toISOString(),
      category: p.obligation.category,
    })),
  };
}
