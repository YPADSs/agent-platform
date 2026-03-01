import { PrismaClient } from "@prisma/client";

/**
 * Lazy Prisma client factory.
 * NOTE: Prisma needs DATABASE_URL at runtime; we avoid throwing during build by not instantiating at module load.
 */
export function getPrisma(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  // eslint-disable-next-line no-var
  const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }
  return globalForPrisma.prisma;
}
