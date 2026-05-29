import Link from "next/link";

export function OnboardingChecklist({
  hasObligations,
  hasIncome,
  onboardingComplete,
}: {
  hasObligations: boolean;
  hasIncome: boolean;
  onboardingComplete: boolean;
}) {
  const steps = [
    {
      done: onboardingComplete,
      label: "Set pay schedule",
      href: "/onboarding",
    },
    {
      done: hasObligations,
      label: "Add at least one bill",
      href: "/obligations",
    },
    {
      done: hasIncome,
      label: "Log a paycheck",
      href: "/income",
    },
    {
      done: hasObligations && onboardingComplete,
      label: "Review this period",
      href: "/dashboard",
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  if (doneCount === steps.length) return null;

  return (
    <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/40">
      <h2 className="font-medium text-emerald-900 dark:text-emerald-200">
        Getting started ({doneCount}/{steps.length})
      </h2>
      <ul className="mt-3 space-y-2">
        {steps.map((step) => (
          <li key={step.label} className="flex items-center gap-2 text-sm">
            <span
              className={
                step.done
                  ? "text-emerald-600"
                  : "text-zinc-400"
              }
            >
              {step.done ? "✓" : "○"}
            </span>
            {step.done ? (
              <span className="text-zinc-600">{step.label}</span>
            ) : (
              <Link
                href={step.href}
                className="text-emerald-700 underline dark:text-emerald-300"
              >
                {step.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
