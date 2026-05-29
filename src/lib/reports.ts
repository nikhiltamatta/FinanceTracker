import { format } from "date-fns";
import { computeAnalytics } from "@/lib/analytics";
import { computePayPeriodPlan } from "@/lib/allocation";
import { prisma } from "@/lib/db";
import { toIncomeInput, toObligationInput } from "@/lib/mappers";
import { ensureMonthlyPaidReset } from "@/lib/payments";
import { getOrCreateSettings, toSettingsInput } from "@/lib/settings";

export type ReportData = {
  generatedAt: string;
  monthLabel: string;
  currency: string;
  summary: {
    totalIncome: number;
    totalPaid: number;
    totalDue: number;
    unpaidCount: number;
    paidCount: number;
  };
  plan: {
    mustHold: number;
    safeToSpend: number;
    catchUp: number;
    explanation: string;
  };
  obligations: {
    name: string;
    category: string;
    amount: number;
    dueDay: string;
    status: string;
  }[];
  income: { date: string; amount: number; note: string }[];
  payments: { date: string; name: string; amount: number; category: string }[];
};

export async function buildMonthlyReport(
  userId: string,
  month: Date = new Date(),
): Promise<ReportData> {
  await ensureMonthlyPaidReset(userId);

  const settingsRow = await getOrCreateSettings(userId);
  const settings = toSettingsInput(settingsRow);
  const analytics = await computeAnalytics(userId, month);

  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const monthEnd = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
    23,
    59,
    59,
  );

  const [obligations, incomeEntries, payments] = await Promise.all([
    prisma.obligation.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    }),
    prisma.incomeEntry.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    }),
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
  const incomeInputs = incomeEntries.map(toIncomeInput);
  const plan = computePayPeriodPlan(
    new Date(),
    settings,
    obligationInputs.filter((o) => o.active),
    incomeInputs,
  );

  return {
    generatedAt: new Date().toISOString(),
    monthLabel: analytics.monthLabel,
    currency: settingsRow.currency,
    summary: {
      totalIncome: analytics.totalIncome,
      totalPaid: analytics.totalPaid,
      totalDue: analytics.totalDue,
      unpaidCount: analytics.unpaidCount,
      paidCount: analytics.paidCount,
    },
    plan: {
      mustHold: plan.mustHold,
      safeToSpend: plan.safeToSpend,
      catchUp: plan.catchUp,
      explanation: plan.explanation,
    },
    obligations: obligations.map((o) => ({
      name: o.name,
      category: o.category,
      amount: o.amount,
      dueDay:
        o.dueRuleType === "day_of_month" && o.dueDayOfMonth
          ? `Day ${o.dueDayOfMonth}`
          : o.dueRuleType,
      status: o.paidThisMonth ? "Paid" : "Unpaid",
    })),
    income: incomeEntries
      .filter((e) => {
        const d = e.date;
        return (
          d.getMonth() === month.getMonth() &&
          d.getFullYear() === month.getFullYear()
        );
      })
      .map((e) => ({
        date: format(e.date, "yyyy-MM-dd"),
        amount: e.amount,
        note: e.note ?? "",
      })),
    payments: payments.map((p) => ({
      date: format(p.paidAt, "yyyy-MM-dd"),
      name: p.obligation.name,
      amount: p.amount,
      category: p.obligation.category,
    })),
  };
}

export function reportToCsv(report: ReportData): string {
  const lines: string[] = [
    `FinanceTracker Monthly Report - ${report.monthLabel}`,
    `Generated,${report.generatedAt}`,
    "",
    "Summary",
    `Total Income,${report.summary.totalIncome}`,
    `Total Paid,${report.summary.totalPaid}`,
    `Total Due,${report.summary.totalDue}`,
    `Bills Paid,${report.summary.paidCount}`,
    `Bills Unpaid,${report.summary.unpaidCount}`,
    "",
    "Current Plan",
    `Must Hold,${report.plan.mustHold}`,
    `Safe to Spend,${report.plan.safeToSpend}`,
    `Catch-up,${report.plan.catchUp}`,
    "",
    "Obligations",
    "Name,Category,Amount,Due,Status",
    ...report.obligations.map(
      (o) =>
        `"${o.name}","${o.category}",${o.amount},"${o.dueDay}","${o.status}"`,
    ),
    "",
    "Income",
    "Date,Amount,Note",
    ...report.income.map(
      (i) => `${i.date},${i.amount},"${i.note.replace(/"/g, '""')}"`,
    ),
    "",
    "Payments",
    "Date,Name,Amount,Category",
    ...report.payments.map(
      (p) =>
        `${p.date},"${p.name}",${p.amount},"${p.category}"`,
    ),
  ];
  return lines.join("\n");
}
