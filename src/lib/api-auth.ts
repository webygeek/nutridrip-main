import { NextRequest } from "next/server";
import { validateSession } from "@/lib/session";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  phone: string;
};

export async function getSessionUser(req: NextRequest): Promise<SessionUser | null> {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : null;
  if (!token) return null;
  const user = await validateSession(token);
  if (!user || user.status !== "active") return null;
  return { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone };
}

export function requireRole(user: SessionUser | null, ...roles: string[]) {
  if (!user) return { error: "Unauthorized", status: 401 } as const;
  if (!roles.includes(user.role) && user.role !== "admin") {
    return { error: "Forbidden", status: 403 } as const;
  }
  return null;
}
