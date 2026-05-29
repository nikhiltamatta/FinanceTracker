# FinanceTracker

Pay-period cash flow planner for weekly income and scattered monthly bills (rent, EMIs, loans, cards).

## Features

- **Landing page** — public marketing home at `/`
- **Login & signup** — per-user accounts with secure sessions
- **This period** (`/dashboard`) — must-hold, safe-to-spend, and explainable allocation before next payday
- **Obligations** — unified rent / EMI / loan / card entries with day-of-month or custom due rules
- **Income log** — manual paycheck entries
- **Settings** — weekly/monthly view, buffer, savings %, pay frequency, **EUR default**, rollover safe-to-spend, income averaging
- **What-if** — see impact of cutting a bill on safe-to-spend
- **Edit obligations & income** — inline edit, search/filter on obligations
- **Credit cards & loans** — minimum due, statement balance, loan end date, payoff projections
- **CSV import** — bulk income and obligations
- **Password reset & profile** — forgot password, change password, update profile
- **Shortfall history** — past periods with catch-up from allocation snapshots
- **Calendar** — month view of income and dues with alerts and mark-paid
- **Analytics** — 6-month income/paid/due trends and category breakdown
- **Reports** — monthly summary with CSV and PDF download
- **Mark paid** — full or partial payments; progress counts toward must-hold
- **Savings goals** (`/goals`) — reserve amounts reduce safe-to-spend
- **Recurring income** — auto-log paychecks on your pay weekday
- **Household** — share bills with a partner via invite code
- **Google sign-in** — optional OAuth (see `.env.example`)
- **Email** — password reset & bill reminders via Resend
- **PWA** — installable from browser (`manifest.json`)
- **Backup** — JSON export from Settings
- **Deploy** — see [DEPLOY.md](DEPLOY.md) for Vercel + Neon

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- **PostgreSQL** + Prisma ORM

## Setup

### 1. Start PostgreSQL (Docker)

```bash
docker compose up -d
```

This starts Postgres on `localhost:5433` (mapped from container port 5432) with database `finance_tracker` (user/password: `finance` / `finance`). Port 5433 avoids conflicts if you already have Postgres on 5432.

### 2. Configure environment

Copy `.env.example` to `.env` and adjust if needed:

```bash
cp .env.example .env
```

Required variables:

- `DATABASE_URL` — PostgreSQL connection string
- `AUTH_SECRET` — at least 16 characters for session cookies
- `NEXT_PUBLIC_APP_URL` — optional, used in password-reset links (defaults to `http://localhost:3000`)

Default currency is **EUR** (change in Settings or onboarding).

### 3. Install and migrate

```bash
npm install
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), **sign up**, then complete onboarding.

### Using your own PostgreSQL

Point `DATABASE_URL` at any Postgres instance (Neon, Supabase, Railway, local install):

```
postgresql://USER:PASSWORD@HOST:5432/DATABASE
```

Then run `npx prisma migrate deploy` (production) or `npx prisma migrate dev` (development).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm test` | Allocation engine unit tests |
| `npm run db:up` | Start Docker Postgres |
| `npm run db:down` | Stop Docker Postgres |
| `npm run db:migrate` | Apply Prisma migrations |

Inspect data: `npx prisma studio`
