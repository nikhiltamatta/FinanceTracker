# Deploy FinanceTracker

## Vercel + Neon (recommended)

1. Push the repo to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Add a [Neon](https://neon.tech) Postgres database and copy `DATABASE_URL`.
4. Set environment variables:

| Variable | Required | Notes |
|----------|----------|--------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `AUTH_SECRET` | Yes | Min 16 characters |
| `NEXT_PUBLIC_APP_URL` | Yes | e.g. `https://your-app.vercel.app` |
| `RESEND_API_KEY` | No | Password reset & bill reminders |
| `EMAIL_FROM` | No | Verified sender in Resend |
| `GOOGLE_CLIENT_ID` | No | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth |
| `CRON_SECRET` | No | Protects `/api/cron/reminders` |

5. Build command: `prisma generate && prisma migrate deploy && next build`  
   Or use the included `vercel.json` build settings.

6. After deploy, sign up and run onboarding.

## Docker Postgres (local)

```bash
docker compose up -d
cp .env.example .env
npm run db:migrate
npm run dev
```

## Cron (bill reminders)

On Vercel, add a cron job in `vercel.json` (included) that calls:

```
GET /api/cron/reminders
Authorization: Bearer <CRON_SECRET>
```

Schedule: daily at 8:00 UTC (adjust in `vercel.json`).
