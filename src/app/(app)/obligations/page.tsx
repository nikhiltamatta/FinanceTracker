import { ObligationForm } from "@/components/ObligationForm";
import { ObligationList } from "@/components/ObligationList";
import { getPlanData } from "@/lib/data";
import { requireUser } from "@/lib/page-auth";

export default async function ObligationsPage() {
  const user = await requireUser();
  const { obligations, settings } = await getPlanData(user.id);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Obligations</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Rent, EMIs, loans, and cards — one list for everything you must plan
          around.
        </p>
      </header>
      <ObligationForm />
      <ObligationList
        obligations={obligations.map((o) => ({
          id: o.id,
          name: o.name,
          category: o.category,
          amount: o.amount,
          dueRuleType: o.dueRuleType,
          dueDayOfMonth: o.dueDayOfMonth,
          dueEveryNWeeks: o.dueEveryNWeeks,
          dueOneOffDate: o.dueOneOffDate?.toISOString() ?? null,
          priority: o.priority,
          active: o.active,
          paidThisMonth: o.paidThisMonth,
          lender: o.lender,
          note: o.note,
          minimumDue: o.minimumDue,
          statementBalance: o.statementBalance,
          loanEndDate: o.loanEndDate?.toISOString() ?? null,
          interestRate: o.interestRate,
        }))}
        currency={settings.currency}
      />
    </div>
  );
}
