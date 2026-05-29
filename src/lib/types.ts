export type PayFrequency = "weekly" | "biweekly" | "monthly";
export type ViewMode = "weekly" | "monthly";
export type DueRuleType = "day_of_month" | "every_n_weeks" | "one_off";
export type ObligationCategory =
  | "rent"
  | "loan"
  | "card"
  | "utilities"
  | "other";
export type Priority = "must_pay" | "flexible";

export interface ObligationInput {
  id: string;
  name: string;
  category: string;
  amount: number;
  dueRuleType: DueRuleType;
  dueDayOfMonth?: number | null;
  dueEveryNWeeks?: number | null;
  dueOneOffDate?: Date | null;
  priority: Priority;
  active: boolean;
  paidThisMonth: boolean;
  minimumDue?: number | null;
  statementBalance?: number | null;
  loanEndDate?: Date | null;
  interestRate?: number | null;
  lender?: string | null;
}

export interface SettingsInput {
  payFrequency: PayFrequency;
  payDayOfWeek: number;
  bufferAmount: number;
  savingsPercent: number;
  accountBalance: number;
  expectedPayAmount: number;
  planningHorizonWeeks: number;
  viewMode: ViewMode;
  rolloverSafeToSpend: boolean;
  incomeAverageWeeks: number;
}

export interface IncomeInput {
  id: string;
  date: Date;
  amount: number;
  note?: string | null;
}

export interface UpcomingDue {
  obligationId: string;
  name: string;
  category: string;
  amount: number;
  dueDate: Date;
  priority: Priority;
  paidAmount?: number;
}

export interface PayPeriodPlan {
  periodStart: Date;
  periodEnd: Date;
  nextPayday: Date;
  mustHold: number;
  mustHoldBreakdown: UpcomingDue[];
  flexibleDue: UpcomingDue[];
  incomeThisPeriod: number;
  incomeUsed: number;
  incomeSource: "actual" | "average" | "expected";
  averageIncome?: number;
  rolloverAmount: number;
  savingsTarget: number;
  goalsReserve: number;
  bufferAmount: number;
  availableBeforeSpend: number;
  safeToSpend: number;
  catchUp: number;
  dailyAllowance: number;
  status: "green" | "amber" | "red";
  explanation: string;
  horizonEnd: Date;
}

export type WhatIfScenario = "cut" | "skip" | "minimum" | "custom";

export interface WhatIfResult {
  extraCut: number;
  newSafeToSpend: number;
  coversShortfall: boolean;
  message: string;
  obligationId?: string;
  scenario?: WhatIfScenario;
}

export interface LoanPayoffProjection {
  obligationId: string;
  name: string;
  monthlyPayment: number;
  remainingMonths: number;
  payoffDate: Date;
  totalRemaining: number;
}

export interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  amount: number;
  type: "income" | "obligation";
  category?: string;
  priority?: Priority;
  obligationId?: string;
}

export interface Alert {
  id: string;
  severity: "warning" | "danger" | "info";
  message: string;
  dueDate?: Date;
  amount?: number;
  paidAmount?: number;
  gap?: number;
}

export interface ShortfallRecord {
  id: string;
  periodStart: string;
  periodEnd: string;
  catchUp: number;
  mustHold: number;
  incomeUsed: number;
  computedAt: string;
}
