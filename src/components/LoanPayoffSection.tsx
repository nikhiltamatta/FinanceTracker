import { prisma } from "@/lib/db";
import { formatDate, formatMoney } from "@/lib/format";
import { projectLoanPayoffs } from "@/lib/loan-payoff";
import { toObligationInput } from "@/lib/mappers";

export async function LoanPayoffSection({
  userId,
  currency,
}: {
  userId: string;
  currency: string;
}) {
  const obligations = await prisma.obligation.findMany({
    where: { userId, active: true, category: "loan" },
  });

  const projections = projectLoanPayoffs(obligations.map(toObligationInput));

  if (projections.length === 0) {
    return (
      <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="font-medium">Loan payoff</h2>
        <p className="mt-2 text-sm text-zinc-500">
          Add loan obligations with an end date to see payoff projections.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="font-medium">Loan payoff</h2>
      <ul className="mt-3 divide-y divide-zinc-200 dark:divide-zinc-800">
        {projections.map((p) => (
          <li
            key={p.obligationId}
            className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
          >
            <div>
              <p className="font-medium">{p.name}</p>
              <p className="text-zinc-500">
                {p.remainingMonths} months left · payoff{" "}
                {formatDate(p.payoffDate)}
              </p>
            </div>
            <div className="text-right tabular-nums">
              <p>{formatMoney(p.monthlyPayment, currency)}/mo</p>
              <p className="text-zinc-500">
                {formatMoney(p.totalRemaining, currency)} remaining
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
