// API middleware utilities — wrap route handlers to enforce auth, roles, and validation

import { NextRequest, NextResponse } from "next/server";
import { ZodSchema } from "zod";
import { validateSession } from "@/lib/session";
import { AUTH_COOKIE_NAME } from "@/lib/cookies";
import { ALL_PERMISSIONS, type Permission } from "@/lib/auth";

// ─── Types ───────────────────────────────────────────────────────────────────

export type AuthenticatedUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  phone: string;
  permissions: Permission[];
};

export type AuthenticatedContext = {
  user: AuthenticatedUser;
  request: NextRequest;
};

export type ApiContext = AuthenticatedContext;

// ─── Auth middleware ──────────────────────────────────────────────────────────

/**
 * Extract token from Authorization header or cookie
 */
export function extractToken(req: NextRequest): string | null {
  // Try Authorization header first
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    return auth.slice(7).trim() || null;
  }

  // Fall back to cookie (handle cases where cookies may not be available)
  try {
    const cookies = req.cookies.get(AUTH_COOKIE_NAME);
    return cookies?.value || null;
  } catch {
    return null;
  }
}

/**
 * Validate session and return user, or null if invalid
 */
export async function getAuthUser(req: NextRequest): Promise<AuthenticatedUser | null> {
  const token = extractToken(req);
  if (!token) return null;

  const user = await validateSession(token);
  if (!user || user.status !== "active") return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone,
    permissions: (JSON.parse(user.permissions) as string[]).filter((p): p is Permission =>
      ALL_PERMISSIONS.includes(p as Permission)
    ),
  };
}

// ─── Handler wrappers ─────────────────────────────────────────────────────────

/**
 * Require authentication — returns 401 if not authenticated
 */
export function withAuth(
  handler: (req: NextRequest, ctx: AuthenticatedContext) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    return handler(req, { user, request: req });
  };
}

/**
 * Require specific roles — returns 403 if role doesn't match
 * Admin always has access (unless explicitly excluded)
 */
export function withRole(
  handler: (req: NextRequest, ctx: AuthenticatedContext) => Promise<NextResponse>,
  ...allowedRoles: string[]
) {
  return withAuth(async (req, ctx) => {
    const { user } = ctx;

    // Admin bypasses role check, subadmin gets admin access
    const effectiveRole = user.role === "subadmin" && allowedRoles.includes("admin")
      ? "admin"
      : user.role;

    if (!allowedRoles.includes(effectiveRole)) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    return handler(req, ctx);
  });
}

/**
 * Require specific permissions
 */
export function withPermission(
  handler: (req: NextRequest, ctx: AuthenticatedContext) => Promise<NextResponse>,
  ...requiredPermissions: Permission[]
) {
  return withAuth(async (req, ctx) => {
    const { user } = ctx;

    // Admin has all permissions
    if (user.role === "admin") {
      return handler(req, ctx);
    }

    const hasAllPermissions = requiredPermissions.every((p) =>
      user.permissions.includes(p)
    );

    if (!hasAllPermissions) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    return handler(req, ctx);
  });
}

/**
 * Validate request body against a Zod schema
 */
export function withValidation<T>(
  schema: ZodSchema<T>,
  handler: (req: NextRequest, ctx: AuthenticatedContext, body: T) => Promise<NextResponse>
) {
  return withAuth(async (req, ctx) => {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const result = schema.safeParse(body);
    if (!result.success) {
      const errors = result.error.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return NextResponse.json(
        { success: false, error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    return handler(req, ctx, result.data);
  });
}

// ─── Error helpers ────────────────────────────────────────────────────────────

export function badRequest(message: string, details?: unknown) {
  return NextResponse.json(
    { success: false, error: message, details },
    { status: 400 }
  );
}

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json(
    { success: false, error: message },
    { status: 401 }
  );
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json(
    { success: false, error: message },
    { status: 403 }
  );
}

export function notFound(message = "Not found") {
  return NextResponse.json(
    { success: false, error: message },
    { status: 404 }
  );
}

export function serverError(message = "Server error") {
  return NextResponse.json(
    { success: false, error: message },
    { status: 500 }
  );
}

export function tooManyRequests(retryAfter = 60) {
  return NextResponse.json(
    { success: false, error: "Too many requests", retryAfter },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfter) },
    }
  );
}