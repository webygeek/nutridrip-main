// Data layer abstraction.
// NOW:   Prisma + SQLite (local file)
// LATER: Change this ONE file to Prisma + Supabase/PostgreSQL
//        OR replace with direct Supabase client calls.

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
