import { prisma } from "@/lib/db";

export async function getActiveGoalsReserve(userId: string): Promise<number> {
  const savingsGoal = prisma.savingsGoal;
  if (!savingsGoal?.findMany) return 0;

  const goals = await savingsGoal.findMany({
    where: { userId, active: true },
  });

  return goals.reduce((sum, g) => {
    const remaining = Math.max(0, g.targetAmount - g.currentAmount);
    return sum + remaining;
  }, 0);
}

export async function listGoals(userId: string) {
  if (!prisma.savingsGoal?.findMany) return [];
  return prisma.savingsGoal.findMany({
    where: { userId },
    orderBy: [{ active: "desc" }, { name: "asc" }],
  });
}
