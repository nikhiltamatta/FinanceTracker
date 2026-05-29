import { describe, expect, it } from "vitest";
import {
  collectUpcomingDues,
  computePayPeriodPlan,
  computeWhatIf,
  getDueDatesForObligation,
} from "@/lib/allocation";
import type { IncomeInput, ObligationInput, SettingsInput } from "@/lib/types";

const baseSettings: SettingsInput = {
  payFrequency: "weekly",
  payDayOfWeek: 5,
  bufferAmount: 1000,
  savingsPercent: 10,
  accountBalance: 5000,
  expectedPayAmount: 15000,
  planningHorizonWeeks: 4,
  viewMode: "weekly",
  rolloverSafeToSpend: false,
  incomeAverageWeeks: 4,
};

const rent: ObligationInput = {
  id: "rent",
  name: "Rent",
  category: "rent",
  amount: 12000,
  dueRuleType: "day_of_month",
  dueDayOfMonth: 1,
  priority: "must_pay",
  active: true,
  paidThisMonth: false,
};

const emi7: ObligationInput = {
  id: "emi7",
  name: "Car EMI",
  category: "loan",
  amount: 4500,
  dueRuleType: "day_of_month",
  dueDayOfMonth: 7,
  priority: "must_pay",
  active: true,
  paidThisMonth: false,
};

const emi22: ObligationInput = {
  id: "emi22",
  name: "Personal Loan",
  category: "loan",
  amount: 3200,
  dueRuleType: "day_of_month",
  dueDayOfMonth: 22,
  priority: "must_pay",
  active: true,
  paidThisMonth: false,
};

describe("getDueDatesForObligation", () => {
  it("returns day-of-month due dates within range", () => {
    const rangeStart = new Date(2026, 4, 1);
    const rangeEnd = new Date(2026, 4, 31, 23, 59, 59, 999);
    const dates = getDueDatesForObligation(rent, rangeStart, rangeEnd);
    expect(dates).toHaveLength(1);
    expect(dates[0].getDate()).toBe(1);
  });

  it("skips obligations marked paid this month", () => {
    const paid = { ...rent, paidThisMonth: true };
    const dates = getDueDatesForObligation(
      paid,
      new Date(2026, 4, 1),
      new Date(2026, 4, 31),
    );
    expect(dates).toHaveLength(0);
  });
});

describe("collectUpcomingDues", () => {
  it("collects scattered monthly dues before next payday", () => {
    const rangeStart = new Date(2026, 4, 1);
    const rangeEnd = new Date(2026, 4, 10, 23, 59, 59, 999);
    const dues = collectUpcomingDues(
      [rent, emi7, emi22],
      rangeStart,
      rangeEnd,
    );
    expect(dues.map((d) => d.name)).toContain("Rent");
    expect(dues.map((d) => d.name)).toContain("Car EMI");
    expect(dues.map((d) => d.name)).not.toContain("Personal Loan");
  });
});

describe("computePayPeriodPlan", () => {
  it("computes must-hold from weekly income against near-term bills", () => {
    const today = new Date(2026, 4, 5);
    const income: IncomeInput[] = [
      { id: "1", date: new Date(2026, 4, 2), amount: 14000, note: "Week 1" },
    ];

    const plan = computePayPeriodPlan(
      today,
      baseSettings,
      [rent, emi7, emi22],
      income,
    );

    expect(plan.mustHold).toBeGreaterThan(0);
    expect(plan.mustHoldBreakdown.length).toBeGreaterThanOrEqual(1);
    expect(plan.safeToSpend).toBeGreaterThanOrEqual(0);
    expect(plan.explanation).toContain("Hold");
  });

  it("flags shortfall when obligations exceed available funds", () => {
    const today = new Date(2026, 4, 1);
    const tightSettings: SettingsInput = {
      ...baseSettings,
      accountBalance: 0,
      bufferAmount: 0,
      savingsPercent: 0,
      expectedPayAmount: 2000,
    };

    const plan = computePayPeriodPlan(
      today,
      tightSettings,
      [rent, emi7],
      [],
    );

    expect(plan.status).toBe("red");
    expect(plan.catchUp).toBeGreaterThan(0);
  });

  it("exposes income source and supports what-if cuts", () => {
    const today = new Date(2026, 4, 5);
    const plan = computePayPeriodPlan(today, baseSettings, [rent], []);
    expect(["actual", "average", "expected"]).toContain(plan.incomeSource);

    const whatIf = computeWhatIf(plan, 500);
    expect(whatIf.newSafeToSpend).toBeGreaterThanOrEqual(plan.safeToSpend);
  });
});
