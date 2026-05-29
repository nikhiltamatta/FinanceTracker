import { redirect } from "next/navigation";
import { AlertList } from "@/components/AlertList";
import { DueItemRow } from "@/components/DueItemRow";
import { MoneyCard } from "@/components/MoneyCard";
import { StatusBadge } from "@/components/StatusBadge";
import { OnboardingChecklist } from "@/components/OnboardingChecklist";
import { WhatIfPanel } from "@/components/WhatIfPanel";
import { getPlanData } from "@/lib/data";
import { formatDate, formatMoney } from "@/lib/format";
import { getPlanningAmount } from "@/lib/obligations";
import { toObligationInput } from "@/lib/mappers";
import { requireUser } from "@/lib/page-auth";

export default async function DashboardPage() {
  const user = await requireUser();
  const {
    settings,
    plan,
    alerts,
    obligations,
    incomeEntries,
    paidByObligation,
  } = await getPlanData(user.id);

  if (!settings.onboardingComplete) {
    redirect("/onboarding");
  }

  const currency = settings.currency;
  const paidMap = new Map(
    obligations.map((o) => [o.id, o.paidThisMonth]),
  );

  const whatIfObligations = obligations
    .filter((o) => o.active)
    .map((o) => {
      const input = toObligationInput(o);
      return {
        id: o.id,
        name: o.name,
        amount: getPlanningAmount(input),
        minimumDue: o.minimumDue,
        category: o.category,
      };
    });

  const incomeLabel =
    plan.incomeSource === "average"
      ? `avg ${formatMoney(plan.averageIncome ?? plan.incomeUsed, currency)} / period`
      : plan.incomeSource === "expected"
        ? `expected ${formatMoney(plan.incomeUsed, currency)}`
        : `logged ${formatMoney(plan.incomeThisPeriod, currency)}`;

  return (
    <div className="space-y-8">
      <OnboardingChecklist
        hasObligations={obligations.length > 0}
        hasIncome={incomeEntries.length > 0}
        onboardingComplete={settings.onboardingComplete}
      />
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            This pay period
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {formatDate(plan.periodStart)} – {formatDate(plan.periodEnd)} · Next
            payday {formatDate(plan.nextPayday)}
          </p>
        </div>
        <StatusBadge status={plan.status} />
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MoneyCard
          label="Safe to spend"
          amount={formatMoney(plan.safeToSpend, currency)}
          hint={`~${formatMoney(plan.dailyAllowance, currency)} per day until payday`}
          highlight
        />
        <MoneyCard
          label="Must hold"
          amount={formatMoney(plan.mustHold, currency)}
          hint="Reserved for must-pay bills before next payday"
        />
        <MoneyCard
          label="Income this period"
          amount={formatMoney(plan.incomeUsed, currency)}
          hint={incomeLabel}
        />
        <MoneyCard
          label="Catch-up needed"
          amount={formatMoney(plan.catchUp, currency)}
          hint={plan.catchUp > 0 ? "Gap to cover must-pay items" : "None"}
        />
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="font-medium">Why this plan</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {plan.explanation}
        </p>
        <p className="mt-2 text-xs text-zinc-500">
          Income: {incomeLabel}
          {plan.goalsReserve > 0
            ? ` · Goals reserve ${formatMoney(plan.goalsReserve, currency)}`
            : ""}
          {plan.rolloverAmount > 0
            ? ` · Rollover ${formatMoney(plan.rolloverAmount, currency)}`
            : ""}
        </p>
        {plan.mustHoldBreakdown.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-2">
            {plan.mustHoldBreakdown.map((item) => {
              const paid = item.paidAmount ?? 0;
              const remaining = Math.max(0, item.amount - paid);
              return (
                <li
                  key={item.obligationId}
                  className="rounded-full bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-800"
                >
                  {item.name}: {formatMoney(remaining, currency)}
                </li>
              );
            })}
          </ul>
        ) : null}
      </section>

      <WhatIfPanel
        currency={currency}
        currentSafeToSpend={plan.safeToSpend}
        obligations={whatIfObligations}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-3 font-medium">Must-pay before next payday</h2>
          {plan.mustHoldBreakdown.length === 0 ? (
            <p className="text-sm text-zinc-500">Nothing due in this window.</p>
          ) : (
            <ul className="space-y-2">
              {plan.mustHoldBreakdown.map((item) => (
                <DueItemRow
                  key={`${item.obligationId}-${item.dueDate.toISOString()}`}
                  obligationId={item.obligationId}
                  name={item.name}
                  amount={item.amount}
                  dueDate={item.dueDate}
                  currency={currency}
                  paidThisMonth={paidMap.get(item.obligationId) ?? false}
                  paidAmount={paidByObligation[item.obligationId] ?? 0}
                />
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-3 font-medium">Alerts</h2>
          <AlertList alerts={alerts} />
        </section>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-3 font-medium">Flexible bills in window</h2>
        {plan.flexibleDue.length === 0 ? (
          <p className="text-sm text-zinc-500">No flexible items due soon.</p>
        ) : (
          <ul className="space-y-2">
            {plan.flexibleDue.map((item) => (
              <DueItemRow
                key={`${item.obligationId}-${item.dueDate.toISOString()}`}
                obligationId={item.obligationId}
                name={item.name}
                amount={item.amount}
                dueDate={item.dueDate}
                currency={currency}
                paidThisMonth={paidMap.get(item.obligationId) ?? false}
                paidAmount={paidByObligation[item.obligationId] ?? 0}
              />
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-3 font-medium">All bills this month</h2>
        <p className="mb-3 text-xs text-zinc-500">
          Mark bills paid as you go — resets automatically each month.
        </p>
        {obligations.filter((o) => o.active).length === 0 ? (
          <p className="text-sm text-zinc-500">
            <a href="/obligations" className="text-emerald-600 underline">
              Add obligations
            </a>{" "}
            to track payments.
          </p>
        ) : (
          <ul className="space-y-2">
            {obligations
              .filter((o) => o.active)
              .map((o) => (
                <DueItemRow
                  key={o.id}
                  obligationId={o.id}
                  name={o.name}
                  amount={o.amount}
                  dueDate={
                    o.dueDayOfMonth
                      ? new Date(
                          new Date().getFullYear(),
                          new Date().getMonth(),
                          o.dueDayOfMonth,
                        )
                      : new Date()
                  }
                  currency={currency}
                  paidThisMonth={o.paidThisMonth}
                  paidAmount={paidByObligation[o.id] ?? 0}
                />
              ))}
          </ul>
        )}
      </section>
    </div>
  );
}
