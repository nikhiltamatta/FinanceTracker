import {
  addDays,
  addMonths,
  addWeeks,
  endOfDay,
  endOfMonth,
  getDaysInMonth,
  startOfDay,
  startOfMonth,
} from "date-fns";

export function toStartOfDay(date: Date): Date {
  return startOfDay(date);
}

export function toEndOfDay(date: Date): Date {
  return endOfDay(date);
}

export function setDayOfMonthSafe(base: Date, day: number): Date {
  const monthStart = startOfMonth(base);
  const maxDay = getDaysInMonth(monthStart);
  const safeDay = Math.min(Math.max(1, day), maxDay);
  const result = new Date(monthStart);
  result.setDate(safeDay);
  return startOfDay(result);
}

export function getMostRecentPayday(today: Date, payDayOfWeek: number): Date {
  const d = startOfDay(today);
  let diff = d.getDay() - payDayOfWeek;
  if (diff < 0) diff += 7;
  return addDays(d, -diff);
}

export function getNextPayday(
  today: Date,
  payFrequency: "weekly" | "biweekly" | "monthly",
  payDayOfWeek: number,
): Date {
  const recent = getMostRecentPayday(today, payDayOfWeek);

  if (payFrequency === "weekly") {
    const next = addDays(recent, 7);
    return startOfDay(next <= today ? addDays(next, 7) : next);
  }

  if (payFrequency === "biweekly") {
    let next = addDays(recent, 14);
    while (next <= today) {
      next = addDays(next, 14);
    }
    return startOfDay(next);
  }

  const dayOfMonth = Math.min(Math.max(1, payDayOfWeek), 28);
  let candidate = setDayOfMonthSafe(today, dayOfMonth);
  if (candidate <= today) {
    candidate = setDayOfMonthSafe(addMonths(today, 1), dayOfMonth);
  }
  return candidate;
}

export function getPayPeriodWindow(
  today: Date,
  payFrequency: "weekly" | "biweekly" | "monthly",
  payDayOfWeek: number,
): { periodStart: Date; periodEnd: Date; nextPayday: Date } {
  const nextPayday = getNextPayday(today, payFrequency, payDayOfWeek);
  let periodStart: Date;

  if (payFrequency === "weekly") {
    periodStart = addDays(nextPayday, -7);
  } else if (payFrequency === "biweekly") {
    periodStart = addDays(nextPayday, -14);
  } else {
    periodStart = addMonths(nextPayday, -1);
    const dayOfMonth = Math.min(Math.max(1, payDayOfWeek), 28);
    periodStart = setDayOfMonthSafe(periodStart, dayOfMonth);
  }

  const periodEnd = addDays(nextPayday, -1);

  return {
    periodStart: startOfDay(periodStart),
    periodEnd: endOfDay(periodEnd),
    nextPayday: startOfDay(nextPayday),
  };
}

export function getHorizonEnd(
  today: Date,
  planningHorizonWeeks: number,
  viewMode: "weekly" | "monthly",
): Date {
  if (viewMode === "monthly") {
    return endOfMonth(today);
  }
  return endOfDay(addWeeks(startOfDay(today), planningHorizonWeeks));
}

export function isWithinRange(
  date: Date,
  rangeStart: Date,
  rangeEnd: Date,
): boolean {
  const d = startOfDay(date).getTime();
  return d >= startOfDay(rangeStart).getTime() && d <= rangeEnd.getTime();
}
