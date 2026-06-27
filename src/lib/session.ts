import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";

const TOKEN_BYTES = 48;
const TTL_DAYS = 30;

export function generateToken(): string {
  return randomBytes(TOKEN_BYTES).toString("hex");
}

export async function createSession(userId: string): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + TTL_DAYS * 24 * 60 * 60 * 1000);
  await prisma.userSession.create({ data: { userId, token, expiresAt } });
  return token;
}

export async function validateSession(token: string | null) {
  if (!token) return null;
  const session = await prisma.userSession.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prisma.userSession.delete({ where: { token } }).catch(() => null);
    return null;
  }
  return session.user;
}

export async function deleteSession(token: string): Promise<void> {
  await prisma.userSession.delete({ where: { token } }).catch(() => null);
}

export async function purgeExpiredSessions(): Promise<void> {
  await prisma.userSession.deleteMany({ where: { expiresAt: { lt: new Date() } } });
}
