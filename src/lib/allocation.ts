import {
  addMonths,
  addWeeks,
  isAfter,
  isBefore,
  startOfDay,
} from "date-fns";
import {
  getHorizonEnd,
  getPayPeriodWindow,
  isWithinRange,
  setDayOfMonthSafe,
  toStartOfDay,
} from "@/lib/dates";
import { computeAverageIncome, resolveEffectiveIncome } from "@/lib/income";
import { getPlanningAmount } from "@/lib/obligations";
import type {
  Alert,
  CalendarEvent,
  IncomeInput,
  ObligationInput,
  PayPeriodPlan,
  SettingsInput,
  UpcomingDue,
  WhatIfResult,
  WhatIfScenario,
} from "@/lib/types";

export function getDueDatesForObligation(
  obligation: ObligationInput,
  rangeStart: Date,
  rangeEnd: Date,
  includeIfPaid = false,
): Date[] {
  if (!obligation.active || (obligation.paidThisMonth && !includeIfPaid)) {
    return [];
  }

  const start = toStartOfDay(rangeStart);
  const end = rangeEnd;

  if (obligation.dueRuleType === "one_off" && obligation.dueOneOffDate) {
    const due = toStartOfDay(obligation.dueOneOffDate);
    return isWithinRange(due, start, end) ? [due] : [];
  }

  if (
    obligation.dueRuleType === "every_n_weeks" &&
    obligation.dueEveryNWeeks &&
    obligation.dueEveryNWeeks > 0
  ) {
    const dates: Date[] = [];
    let cursor = start;
    const step = obligation.dueEveryNWeeks;
    while (!isAfter(cursor, end)) {
      if (isWithinRange(cursor, start, end)) {
        dates.push(toStartOfDay(cursor));
      }
      cursor = addWeeks(cursor, step);
    }
    return dates;
  }

  if (
    obligation.dueRuleType === "day_of_month" &&
    obligation.dueDayOfMonth
  ) {
    const dates: Date[] = [];
    let monthCursor = startOfDay(
      new Date(start.getFullYear(), start.getMonth(), 1),
    );
    const lastMonth = new Date(end.getFullYear(), end.getMonth(), 1);

    while (monthCursor <= lastMonth) {
      const due = setDayOfMonthSafe(monthCursor, obligation.dueDayOfMonth);
      if (isWithinRange(due, start, end)) {
        dates.push(due);
      }
      monthCursor = addMonths(monthCursor, 1);
    }
    return dates;
  }

  return [];
}

export function collectUpcomingDues(
  obligations: ObligationInput[],
  rangeStart: Date,
  rangeEnd: Date,
  paidByObligation: Record<string, number> = {},
): UpcomingDue[] {
  const items: UpcomingDue[] = [];

  for (const obligation of obligations) {
    const dueDates = getDueDatesForObligation(
      obligation,
      rangeStart,
      rangeEnd,
    );
    const amount = getPlanningAmount(obligation);
    for (const dueDate of dueDates) {
      items.push({
        obligationId: obligation.id,
        name: obligation.name,
        category: obligation.category,
        amount,
        dueDate,
        priority: obligation.priority,
        paidAmount: paidByObligation[obligation.id] ?? 0,
      });
    }
  }

  return items.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
}

function sumAmount(items: UpcomingDue[]): number {
  return items.reduce((sum, item) => {
    const remaining = Math.max(0, item.amount - (item.paidAmount ?? 0));
    return sum + remaining;
  }, 0);
}

function buildExplanation(
  breakdown: UpcomingDue[],
  incomeSource: string,
): string {
  if (breakdown.length === 0) {
    return "No must-pay bills due before your next payday.";
  }
  const parts = breakdown.map(
    (item) => `${item.name} (${formatAmountInline(item.amount)})`,
  );
  const incomeNote =
    incomeSource === "average"
      ? " Using your recent pay average for income."
      : incomeSource === "expected"
        ? " Using your expected pay amount."
        : "";
  return `Hold ${formatAmountInline(sumAmount(breakdown))}: ${parts.join(" + ")} due before next payday.${incomeNote}`;
}

function formatAmountInline(amount: number): string {
  return Math.round(amount).toLocaleString("de-DE");
}

export function computePayPeriodPlan(
  today: Date,
  settings: SettingsInput,
  obligations: ObligationInput[],
  incomeEntries: IncomeInput[],
  options?: {
    rolloverAmount?: number;
    paidByObligation?: Record<string, number>;
    goalsReserve?: number;
  },
): PayPeriodPlan {
  const { periodStart, periodEnd, nextPayday } = getPayPeriodWindow(
    today,
    settings.payFrequency,
    settings.payDayOfWeek,
  );

  const holdRangeEnd = addDaysBeforePayday(nextPayday);
  const holdRangeStart = toStartOfDay(today);

  const paidByObligation = options?.paidByObligation ?? {};

  const allUpcoming = collectUpcomingDues(
    obligations,
    holdRangeStart,
    holdRangeEnd,
    paidByObligation,
  );

  const mustHoldBreakdown = allUpcoming.filter(
    (item) => item.priority === "must_pay",
  );
  const flexibleDue = allUpcoming.filter(
    (item) => item.priority === "flexible",
  );

  const mustHold = sumAmount(mustHoldBreakdown);

  const incomeThisPeriod = incomeEntries
    .filter((entry) => {
      const d = toStartOfDay(entry.date);
      return d >= periodStart && d <= toStartOfDay(today);
    })
    .reduce((sum, entry) => sum + entry.amount, 0);

  const averageIncome = computeAverageIncome(
    incomeEntries,
    settings.incomeAverageWeeks,
    today,
  );

  const { amount: incomeUsed, source: incomeSource } = resolveEffectiveIncome(
    incomeThisPeriod,
    averageIncome,
    settings.expectedPayAmount,
  );

  const rolloverAmount = options?.rolloverAmount ?? 0;

  const grossAvailable =
    settings.accountBalance +
    incomeUsed +
    rolloverAmount -
    settings.bufferAmount;

  const savingsTarget = (grossAvailable * settings.savingsPercent) / 100;
  const goalsReserve = options?.goalsReserve ?? 0;

  const availableBeforeSpend =
    grossAvailable - mustHold - savingsTarget - goalsReserve;

  const safeToSpend = Math.max(0, availableBeforeSpend);
  const catchUp = availableBeforeSpend < 0 ? Math.abs(availableBeforeSpend) : 0;

  const daysUntilPay = Math.max(
    1,
    Math.ceil(
      (nextPayday.getTime() - toStartOfDay(today).getTime()) /
        (1000 * 60 * 60 * 24),
    ),
  );

  const dailyAllowance = safeToSpend / daysUntilPay;

  let status: PayPeriodPlan["status"] = "green";
  if (catchUp > 0) {
    status = "red";
  } else if (safeToSpend < settings.expectedPayAmount * 0.15) {
    status = "amber";
  }

  const horizonEnd = getHorizonEnd(
    today,
    settings.planningHorizonWeeks,
    settings.viewMode,
  );

  return {
    periodStart,
    periodEnd,
    nextPayday,
    mustHold,
    mustHoldBreakdown,
    flexibleDue,
    incomeThisPeriod,
    incomeUsed,
    incomeSource,
    averageIncome,
    rolloverAmount,
    savingsTarget,
    goalsReserve,
    bufferAmount: settings.bufferAmount,
    availableBeforeSpend,
    safeToSpend,
    catchUp,
    dailyAllowance,
    status,
    explanation: buildExplanation(mustHoldBreakdown, incomeSource),
    horizonEnd,
  };
}

export function computeWhatIf(
  plan: PayPeriodPlan,
  extraCut: number,
  context?: {
    obligationId?: string;
    obligationName?: string;
    scenario?: WhatIfScenario;
    obligationAmount?: number;
    minimumDue?: number | null;
  },
): WhatIfResult {
  let cut = extraCut;
  const scenario = context?.scenario ?? "cut";

  if (context?.obligationId && scenario !== "cut") {
    const full = context.obligationAmount ?? 0;
    if (scenario === "skip") {
      cut = full;
    } else if (scenario === "minimum") {
      cut = Math.max(0, full - (context.minimumDue ?? full));
    }
  }

  const newAvailable = plan.availableBeforeSpend + cut;
  const newSafeToSpend = Math.max(0, newAvailable);
  const coversShortfall = plan.catchUp > 0 && newAvailable >= 0;

  const label = context?.obligationName ?? "spending";
  let message: string;

  if (scenario === "skip" && context?.obligationName) {
    message = coversShortfall
      ? `Skipping ${label} (${formatAmountInline(cut)}) would cover your shortfall.`
      : `Skipping ${label} adds ${formatAmountInline(cut)} to safe-to-spend (total ${formatAmountInline(newSafeToSpend)}).`;
  } else if (scenario === "minimum" && context?.obligationName) {
    message = `Paying minimum on ${label} frees ${formatAmountInline(cut)} — safe-to-spend ${formatAmountInline(newSafeToSpend)}.`;
  } else if (cut <= 0) {
    message = "Enter an amount or pick a bill scenario.";
  } else if (coversShortfall) {
    message = `Cutting ${formatAmountInline(cut)} would cover your ${formatAmountInline(plan.catchUp)} shortfall.`;
  } else if (plan.catchUp > 0) {
    const stillShort = plan.catchUp - cut;
    message = `You would still be short ${formatAmountInline(Math.max(0, stillShort))} after cutting ${formatAmountInline(cut)}.`;
  } else {
    message = `You could add ${formatAmountInline(cut)} to safe-to-spend (total ${formatAmountInline(newSafeToSpend)}).`;
  }

  return {
    extraCut: cut,
    newSafeToSpend,
    coversShortfall,
    message,
    obligationId: context?.obligationId,
    scenario,
  };
}

function addDaysBeforePayday(nextPayday: Date): Date {
  const end = new Date(nextPayday);
  end.setDate(end.getDate() - 1);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function buildCalendarEvents(
  month: Date,
  obligations: ObligationInput[],
  incomeEntries: IncomeInput[],
): CalendarEvent[] {
  const rangeStart = startOfDay(
    new Date(month.getFullYear(), month.getMonth(), 1),
  );
  const rangeEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  rangeEnd.setHours(23, 59, 59, 999);

  const events: CalendarEvent[] = [];

  for (const entry of incomeEntries) {
    if (isWithinRange(entry.date, rangeStart, rangeEnd)) {
      events.push({
        id: `income-${entry.id}`,
        date: toStartOfDay(entry.date),
        title: entry.note ? `Pay: ${entry.note}` : "Paycheck",
        amount: entry.amount,
        type: "income",
      });
    }
  }

  for (const obligation of obligations) {
    if (!obligation.active) continue;
    const dueDates = getDueDatesForObligation(
      obligation,
      rangeStart,
      rangeEnd,
      true,
    );
    for (const dueDate of dueDates) {
      events.push({
        id: `obligation-${obligation.id}-${dueDate.toISOString()}`,
        date: dueDate,
        title: obligation.name,
        amount: getPlanningAmount(obligation),
        type: "obligation",
        category: obligation.category,
        priority: obligation.priority,
        obligationId: obligation.id,
      });
    }
  }

  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function buildAlerts(
  today: Date,
  plan: PayPeriodPlan,
  settings: SettingsInput,
): Alert[] {
  const alerts: Alert[] = [];

  if (plan.catchUp > 0) {
    alerts.push({
      id: "shortfall",
      severity: "danger",
      message: `You are short ${formatAmountInline(plan.catchUp)} for bills due before your next payday.`,
      gap: plan.catchUp,
    });
  }

  if (plan.rolloverAmount > 0) {
    alerts.push({
      id: "rollover",
      severity: "info",
      message: `Rolled ${formatAmountInline(plan.rolloverAmount)} from last period into this plan.`,
    });
  }

  const threeDaysOut = addDays(today, 3);
  for (const due of plan.mustHoldBreakdown) {
    const paid = due.paidAmount ?? 0;
    const gap = Math.max(0, due.amount - paid);

    if (gap > 0 && paid > 0) {
      alerts.push({
        id: `underpaid-${due.obligationId}`,
        severity: "warning",
        message: `${due.name}: due ${formatAmountInline(due.amount)}, paid ${formatAmountInline(paid)} (short ${formatAmountInline(gap)}).`,
        dueDate: due.dueDate,
        amount: due.amount,
        paidAmount: paid,
        gap,
      });
    } else if (
      gap > 0 &&
      !isBefore(due.dueDate, toStartOfDay(today)) &&
      !isAfter(due.dueDate, threeDaysOut)
    ) {
      alerts.push({
        id: `due-soon-${due.obligationId}`,
        severity: "warning",
        message: `${due.name} (${formatAmountInline(due.amount)}) is due soon.`,
        dueDate: due.dueDate,
        amount: due.amount,
        gap,
      });
    }
  }

  if (plan.safeToSpend < settings.bufferAmount && plan.catchUp === 0) {
    alerts.push({
      id: "tight-week",
      severity: "info",
      message:
        "Spending room is tight this period. Consider reducing flexible expenses.",
    });
  }

  return alerts;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
