import type { Obligation, IncomeEntry } from "@/generated/prisma/client";
import type { IncomeInput, ObligationInput } from "@/lib/types";

export function toObligationInput(obligation: Obligation): ObligationInput {
  return {
    id: obligation.id,
    name: obligation.name,
    category: obligation.category,
    amount: obligation.amount,
    dueRuleType: obligation.dueRuleType as ObligationInput["dueRuleType"],
    dueDayOfMonth: obligation.dueDayOfMonth,
    dueEveryNWeeks: obligation.dueEveryNWeeks,
    dueOneOffDate: obligation.dueOneOffDate,
    priority: obligation.priority as ObligationInput["priority"],
    active: obligation.active,
    paidThisMonth: obligation.paidThisMonth,
    minimumDue: obligation.minimumDue,
    statementBalance: obligation.statementBalance,
    loanEndDate: obligation.loanEndDate,
    interestRate: obligation.interestRate,
    lender: obligation.lender,
  };
}

export function toIncomeInput(entry: IncomeEntry): IncomeInput {
  return {
    id: entry.id,
    date: entry.date,
    amount: entry.amount,
    note: entry.note,
  };
}
