import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/** Bump when Prisma schema adds models so dev HMR refreshes the singleton. */
const PRISMA_SCHEMA_VERSION = 3;

const REQUIRED_DELEGATES = [
  "allocationSnapshot",
  "passwordResetToken",
  "savingsGoal",
  "recurringIncome",
  "household",
  "householdMember",
] as const;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaSchemaVersion?: number;
};

function getConnectionString(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Use a PostgreSQL URL, e.g. postgresql://finance:finance@localhost:5432/finance_tracker",
    );
  }
  return url;
}

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: getConnectionString() });
  return new PrismaClient({ adapter });
}

/** Dev HMR can keep an old Prisma singleton from before schema/client regenerate. */
function isClientCurrent(client: PrismaClient): boolean {
  return REQUIRED_DELEGATES.every((key) => {
    const delegate = client[key as keyof PrismaClient] as
      | { findMany?: unknown }
      | undefined;
    return typeof delegate?.findMany === "function";
  });
}

function getPrismaClient(): PrismaClient {
  const cached = globalForPrisma.prisma;
  if (
    cached &&
    globalForPrisma.prismaSchemaVersion === PRISMA_SCHEMA_VERSION &&
    isClientCurrent(cached)
  ) {
    return cached;
  }

  const client = createPrismaClient();

  if (!isClientCurrent(client)) {
    throw new Error(
      "Prisma client is out of date. Run: npx prisma generate && restart npm run dev",
    );
  }

  globalForPrisma.prisma = client;
  globalForPrisma.prismaSchemaVersion = PRISMA_SCHEMA_VERSION;

  return client;
}

export const prisma = getPrismaClient();
