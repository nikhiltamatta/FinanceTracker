import Link from "next/link";

const coreFeatures = [
  {
    title: "Must hold vs safe to spend",
    description:
      "See how much to reserve for must-pay bills before next payday, and what you can actually spend day to day.",
  },
  {
    title: "Catch-up & alerts",
    description:
      "Spot shortfalls early. Per-bill alerts when something is due but not paid yet this month.",
  },
  {
    title: "What-if planning",
    description:
      "Model cutting a bill or expense and see the impact on safe-to-spend before you commit.",
  },
];

const billFeatures = [
  {
    title: "Scattered due dates",
    description:
      "Rent on the 1st, EMIs on the 7th and 22nd — day-of-month, every-N-weeks, or one-off dates in one list.",
  },
  {
    title: "Credit cards",
    description:
      "Track statement balance and minimum due. Planning uses minimum due when you set it.",
  },
  {
    title: "Loans & payoff",
    description:
      "Loan end dates and payoff projections so you know months left and total remaining.",
  },
  {
    title: "Mark paid",
    description:
      "Record payments from the dashboard, obligations, or calendar. Resets automatically each month.",
  },
];

const workflowFeatures = [
  {
    title: "Income log & averaging",
    description:
      "Log each paycheck. The engine uses actual pay when available, or averages recent weeks when you prefer.",
  },
  {
    title: "Rollover safe-to-spend",
    description:
      "Optionally carry unused safe-to-spend into the next period when you had no shortfall.",
  },
  {
    title: "Calendar view",
    description:
      "Month view of income and bills with due dates and amounts at a glance.",
  },
  {
    title: "CSV import",
    description:
      "Bulk-add income or obligations from CSV — handy when setting up or migrating.",
  },
];

const insightFeatures = [
  {
    title: "Analytics",
    description:
      "Income vs paid vs due trends, category breakdown, loan payoff, and shortfall history from saved snapshots.",
  },
  {
    title: "Reports",
    description:
      "Monthly summary with downloadable CSV or PDF for your records.",
  },
  {
    title: "EUR by default",
    description:
      "Built for European-style formatting (€). Change currency anytime in settings.",
  },
  {
    title: "Your account",
    description:
      "Secure signup, profile, change password, and forgot-password reset when you need it.",
  },
];

const steps = [
  {
    step: "1",
    title: "Set your pay schedule",
    description:
      "Weekly or biweekly pay day, expected paycheck, buffer, and savings percent.",
  },
  {
    step: "2",
    title: "Add bills & income",
    description:
      "Rent, EMIs, cards, utilities — or import from CSV. Log paychecks as they land.",
  },
  {
    step: "3",
    title: "Follow this period",
    description:
      "Open the dashboard for must-hold, safe-to-spend, catch-up, and what-if before you spend.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <section className="mx-auto max-w-5xl flex-1 px-4 py-16 text-center sm:py-24">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-600">
          Pay-period planning · EUR-friendly
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Know what to do with
          <span className="text-emerald-600"> this week&apos;s paycheck</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          Weekly income, rent on the 1st, EMIs on the 7th and 22nd — FinanceTracker
          tells you how much to hold, how much you can safely spend, and when you
          need to catch up before next payday.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-medium text-white shadow hover:bg-emerald-700"
          >
            Start free
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-zinc-300 px-6 py-3 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Log in
          </Link>
        </div>
        <div className="mx-auto mt-12 grid max-w-3xl gap-3 sm:grid-cols-3">
          <Stat label="Must hold" value="Reserved for bills" />
          <Stat label="Safe to spend" value="Daily allowance" />
          <Stat label="Catch-up" value="When you're short" />
        </div>
      </section>

      <section className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <SectionHeading
            eyebrow="Core"
            title="The pay-period engine"
            subtitle="Everything revolves around the gap between payday and scattered monthly bills."
          />
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {coreFeatures.map((f) => (
              <Feature key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <SectionHeading
            eyebrow="Bills"
            title="One place for rent, EMIs & cards"
            subtitle="Edit, search, and mark paid without spreadsheets."
          />
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {billFeatures.map((f) => (
              <Feature key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <SectionHeading
            eyebrow="Workflow"
            title="Income, calendar & import"
            subtitle="Built for real weekly pay — not just monthly budgets."
          />
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {workflowFeatures.map((f) => (
              <Feature key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <SectionHeading
            eyebrow="Insights"
            title="Analytics, reports & history"
            subtitle="See trends, export summaries, and learn from past shortfalls."
          />
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {insightFeatures.map((f) => (
              <Feature key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-200 bg-emerald-950 text-white dark:border-zinc-800">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <SectionHeading
            eyebrow="How it works"
            title="Up and running in minutes"
            subtitle="Sign up, complete onboarding, add obligations — then open This period."
            inverted
          />
          <ol className="mt-10 grid gap-8 sm:grid-cols-3">
            {steps.map((s) => (
              <li key={s.step} className="text-center sm:text-left">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold">
                  {s.step}
                </span>
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-emerald-100/80">{s.description}</p>
              </li>
            ))}
          </ol>
          <div className="mt-12 text-center">
            <Link
              href="/signup"
              className="inline-flex rounded-xl bg-white px-6 py-3 text-sm font-medium text-emerald-900 hover:bg-emerald-50"
            >
              Create your account
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-200 py-10 dark:border-zinc-800">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-zinc-500">
          <p className="font-medium text-zinc-700 dark:text-zinc-300">
            FinanceTracker
          </p>
          <p className="mt-1">
            Built for weekly pay and scattered monthly bills.
          </p>
          <p className="mt-4 text-zinc-400">
            Made by{" "}
            <span className="text-zinc-600 dark:text-zinc-300">
              Nikhil Tamatta
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
  inverted,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  inverted?: boolean;
}) {
  return (
    <div className="text-center sm:text-left">
      <p
        className={`text-sm font-medium uppercase tracking-wide ${
          inverted ? "text-emerald-300" : "text-emerald-600"
        }`}
      >
        {eyebrow}
      </p>
      <h2
        className={`mt-2 text-2xl font-semibold tracking-tight ${
          inverted ? "text-white" : ""
        }`}
      >
        {title}
      </h2>
      <p
        className={`mt-2 max-w-2xl text-sm ${
          inverted
            ? "text-emerald-100/80"
            : "text-zinc-600 dark:text-zinc-400"
        }`}
      >
        {subtitle}
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">
        {label}
      </p>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{value}</p>
    </div>
  );
}

function Feature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {description}
      </p>
    </div>
  );
}
