import { prisma } from "@/lib/db";
import type { PayPeriodPlan, ShortfallRecord } from "@/lib/types";

const SNAPSHOT_MIN_INTERVAL_MS = 60 * 60 * 1000;

function periodKey(d: Date) {
  return d.toISOString();
}

export async function saveAllocationSnapshot(
  userId: string,
  plan: PayPeriodPlan,
) {
  const snapshot = prisma.allocationSnapshot;
  if (!snapshot?.upsert) return null;

  const existing = await snapshot.findUnique({
    where: {
      userId_periodStart_periodEnd: {
        userId,
        periodStart: plan.periodStart,
        periodEnd: plan.periodEnd,
      },
    },
  });

  if (existing) {
    const elapsed = Date.now() - existing.computedAt.getTime();
    const unchanged =
      existing.mustHold === plan.mustHold &&
      existing.safeToSpend === plan.safeToSpend &&
      existing.catchUp === plan.catchUp &&
      existing.incomeUsed === plan.incomeUsed;

    if (elapsed < SNAPSHOT_MIN_INTERVAL_MS && unchanged) {
      return existing;
    }

    return snapshot.update({
      where: { id: existing.id },
      data: {
        mustHold: plan.mustHold,
        safeToSpend: plan.safeToSpend,
        catchUp: plan.catchUp,
        incomeUsed: plan.incomeUsed,
        computedAt: new Date(),
      },
    });
  }

  return snapshot.create({
    data: {
      userId,
      periodStart: plan.periodStart,
      periodEnd: plan.periodEnd,
      mustHold: plan.mustHold,
      safeToSpend: plan.safeToSpend,
      catchUp: plan.catchUp,
      incomeUsed: plan.incomeUsed,
    },
  });
}

export async function getLastSnapshot(userId: string) {
  return prisma.allocationSnapshot.findFirst({
    where: { userId },
    orderBy: { computedAt: "desc" },
  });
}

export async function getRolloverAmount(
  userId: string,
  rolloverEnabled: boolean,
): Promise<number> {
  if (!rolloverEnabled) return 0;
  const last = await getLastSnapshot(userId);
  if (!last || last.catchUp > 0) return 0;
  return Math.max(0, last.safeToSpend);
}

export async function getShortfallHistory(
  userId: string,
  limit = 12,
): Promise<ShortfallRecord[]> {
  const snapshot = prisma.allocationSnapshot;
  if (!snapshot?.findMany) return [];

  const rows = await snapshot.findMany({
    where: { userId, catchUp: { gt: 0 } },
    orderBy: { computedAt: "desc" },
    take: limit * 3,
  });

  const seen = new Set<string>();
  const unique: ShortfallRecord[] = [];

  for (const r of rows) {
    const key = `${periodKey(r.periodStart)}-${periodKey(r.periodEnd)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push({
      id: r.id,
      periodStart: r.periodStart.toISOString(),
      periodEnd: r.periodEnd.toISOString(),
      catchUp: r.catchUp,
      mustHold: r.mustHold,
      incomeUsed: r.incomeUsed,
      computedAt: r.computedAt.toISOString(),
    });
    if (unique.length >= limit) break;
  }

  return unique;
}
