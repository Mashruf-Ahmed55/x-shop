import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prismaDb: PrismaClient | undefined;
};

const prisma =
  globalForPrisma.prismaDb ??
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaDb = prisma;

export default prisma;
