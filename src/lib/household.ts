import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";

function generateInviteCode(): string {
  return randomBytes(4).toString("hex").toUpperCase();
}

export async function getUserHousehold(userId: string) {
  if (!prisma.householdMember?.findFirst) return null;

  const membership = await prisma.householdMember.findFirst({
    where: { userId },
    include: {
      household: {
        include: {
          members: { include: { user: { select: { id: true, email: true, name: true } } } },
          obligations: { where: { active: true, sharedWithHousehold: true } },
        },
      },
    },
  });
  return membership?.household ?? null;
}

export async function createHousehold(userId: string, name: string) {
  const existing = await prisma.householdMember.findFirst({ where: { userId } });
  if (existing) throw new Error("You are already in a household");

  let inviteCode = generateInviteCode();
  for (let i = 0; i < 5; i++) {
    const clash = await prisma.household.findUnique({ where: { inviteCode } });
    if (!clash) break;
    inviteCode = generateInviteCode();
  }

  return prisma.household.create({
    data: {
      name,
      inviteCode,
      ownerId: userId,
      members: { create: { userId, role: "owner" } },
    },
    include: { members: true },
  });
}

export async function joinHousehold(userId: string, inviteCode: string) {
  const household = await prisma.household.findUnique({
    where: { inviteCode: inviteCode.toUpperCase() },
  });
  if (!household) throw new Error("Invalid invite code");

  const existing = await prisma.householdMember.findFirst({ where: { userId } });
  if (existing) throw new Error("Leave your current household first");

  await prisma.householdMember.create({
    data: { householdId: household.id, userId, role: "member" },
  });

  return household;
}

export async function getHouseholdObligations(userId: string) {
  const household = await getUserHousehold(userId);
  if (!household) return [];

  return prisma.obligation.findMany({
    where: {
      householdId: household.id,
      sharedWithHousehold: true,
      active: true,
      NOT: { userId },
    },
  });
}
