import { prisma } from "@/lib/db";
import type { PayPeriodPlan } from "@/lib/types";
import type { ShortfallRecord } from "@/lib/types";

export async function saveAllocationSnapshot(
  userId: string,
  plan: PayPeriodPlan,
) {
  return prisma.allocationSnapshot.create({
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
  if (!snapshot?.findMany) {
    return [];
  }

  const rows = await snapshot.findMany({
    where: { userId, catchUp: { gt: 0 } },
    orderBy: { computedAt: "desc" },
    take: limit,
  });

  return rows.map((r) => ({
    id: r.id,
    periodStart: r.periodStart.toISOString(),
    periodEnd: r.periodEnd.toISOString(),
    catchUp: r.catchUp,
    mustHold: r.mustHold,
    incomeUsed: r.incomeUsed,
    computedAt: r.computedAt.toISOString(),
  }));
}
