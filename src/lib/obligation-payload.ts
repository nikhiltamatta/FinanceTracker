export function parseObligationBody(body: Record<string, unknown>) {
  return {
    name: body.name as string | undefined,
    category: body.category as string | undefined,
    amount: body.amount !== undefined ? Number(body.amount) : undefined,
    dueRuleType: body.dueRuleType as string | undefined,
    dueDayOfMonth:
      body.dueDayOfMonth !== undefined
        ? body.dueDayOfMonth
          ? Number(body.dueDayOfMonth)
          : null
        : undefined,
    dueEveryNWeeks:
      body.dueEveryNWeeks !== undefined
        ? body.dueEveryNWeeks
          ? Number(body.dueEveryNWeeks)
          : null
        : undefined,
    dueOneOffDate:
      body.dueOneOffDate !== undefined
        ? body.dueOneOffDate
          ? new Date(body.dueOneOffDate as string)
          : null
        : undefined,
    priority: body.priority as string | undefined,
    active: body.active as boolean | undefined,
    paidThisMonth: body.paidThisMonth as boolean | undefined,
    lender: body.lender as string | null | undefined,
    note: body.note as string | null | undefined,
    minimumDue:
      body.minimumDue !== undefined
        ? body.minimumDue
          ? Number(body.minimumDue)
          : null
        : undefined,
    statementBalance:
      body.statementBalance !== undefined
        ? body.statementBalance
          ? Number(body.statementBalance)
          : null
        : undefined,
    loanEndDate:
      body.loanEndDate !== undefined
        ? body.loanEndDate
          ? new Date(body.loanEndDate as string)
          : null
        : undefined,
    interestRate:
      body.interestRate !== undefined
        ? body.interestRate
          ? Number(body.interestRate)
          : null
        : undefined,
    sharedWithHousehold: body.sharedWithHousehold as boolean | undefined,
    householdId: body.householdId as string | null | undefined,
  };
}

export function buildObligationCreate(
  userId: string,
  body: Record<string, unknown>,
) {
  const p = parseObligationBody(body);
  return {
    userId,
    name: p.name as string,
    category: p.category as string,
    amount: Number(p.amount),
    dueRuleType: p.dueRuleType as string,
    dueDayOfMonth: p.dueDayOfMonth ?? null,
    dueEveryNWeeks: p.dueEveryNWeeks ?? null,
    dueOneOffDate: p.dueOneOffDate ?? null,
    priority: p.priority ?? "must_pay",
    active: p.active ?? true,
    paidThisMonth: p.paidThisMonth ?? false,
    lender: p.lender ?? null,
    note: p.note ?? null,
    minimumDue: p.minimumDue ?? null,
    statementBalance: p.statementBalance ?? null,
    loanEndDate: p.loanEndDate ?? null,
    interestRate: p.interestRate ?? null,
    sharedWithHousehold: p.sharedWithHousehold ?? false,
    householdId: p.householdId ?? null,
  };
}
