import { prisma } from "@/lib/db";

export async function getActiveGoalsReserve(userId: string): Promise<number> {
  const goals = await prisma.savingsGoal.findMany({
    where: { userId, active: true },
  });

  return goals.reduce((sum, g) => {
    const remaining = Math.max(0, g.targetAmount - g.currentAmount);
    return sum + remaining;
  }, 0);
}

export async function listGoals(userId: string) {
  return prisma.savingsGoal.findMany({
    where: { userId },
    orderBy: [{ active: "desc" }, { name: "asc" }],
  });
}
