import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashSync } from "bcryptjs";
import { withAuth, withRole, badRequest, forbidden, notFound, serverError } from "@/lib/api-utils";
import { userCreateSchema, userUpdateSchema, userDeleteSchema } from "@/lib/validations";
import { logUserCreate, logUserUpdate, auditLog } from "@/lib/audit";
import { rateLimitRequest } from "@/lib/rate-limit";

// Helper to exclude password from user objects
const excludePassword = (user: Record<string, unknown>) => {
  const { password, ...rest } = user;
  return rest;
};

// GET /api/users — List users (admin/subadmin) or get single user
export const GET = withAuth(async (req, ctx) => {
  try {
    // Rate limit
    const rl = rateLimitRequest(req, "api");
    if (rl) return rl;

    const role = req.nextUrl.searchParams.get("role");
    const id = req.nextUrl.searchParams.get("id");

    // Get single user
    if (id) {
      // Users can only fetch their own data unless they're admin
      if (ctx.user.role !== "admin" && ctx.user.role !== "subadmin" && id !== ctx.user.id) {
        return forbidden("You can only view your own profile");
      }

      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) return notFound("User not found");

      await auditLog(ctx.user.id, "user.read", "User", { resourceId: id }, req);
      return NextResponse.json({ success: true, data: excludePassword(user as unknown as Record<string, unknown>) });
    }

    // For listing, require admin/subadmin role
    if (ctx.user.role !== "admin" && ctx.user.role !== "subadmin") {
      return forbidden("Admin access required");
    }

    const where = role ? { role } : {};
    const users = await prisma.user.findMany({ where, orderBy: { createdAt: "desc" } });
    return NextResponse.json({ success: true, data: users.map((u) => excludePassword(u as unknown as Record<string, unknown>)) });
  } catch {
    return serverError();
  }
});

// POST /api/users — Create new user (admin only)
export const POST = withRole(async (req, ctx) => {
  try {
    // Rate limit
    const rl = rateLimitRequest(req, "api");
    if (rl) return rl;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return badRequest("Invalid JSON body");
    }

    const result = userCreateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: result.error.issues.map((e) => ({ field: e.path.join("."), message: e.message })),
        },
        { status: 400 }
      );
    }

    const { email, password, name, role, phone, permissions } = result.data;

    const exists = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (exists) {
      return NextResponse.json(
        { success: false, error: "Email already registered" },
        { status: 409 }
      );
    }

    const user = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        password: hashSync(password, 10),
        name,
        role,
        phone: phone || "",
        permissions: JSON.stringify(permissions || []),
      },
    });

    await logUserCreate(ctx.user.id, user.id, req);
    return NextResponse.json(
      { success: true, data: excludePassword(user as unknown as Record<string, unknown>) },
      { status: 201 }
    );
  } catch {
    return serverError();
  }
}, "admin");

// PUT /api/users — Update user (admin/subadmin)
export const PUT = withRole(async (req, ctx) => {
  try {
    // Rate limit
    const rl = rateLimitRequest(req, "api");
    if (rl) return rl;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return badRequest("Invalid JSON body");
    }

    const result = userUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: result.error.issues.map((e) => ({ field: e.path.join("."), message: e.message })),
        },
        { status: 400 }
      );
    }

    const { id, password: _password, permissions, ...fields } = result.data;

    // Subadmins can only edit users, not other admins or themselves
    if (ctx.user.role === "subadmin") {
      const target = await prisma.user.findUnique({ where: { id } });
      if (!target) return notFound("User not found");
      if (target.role === "admin" || id === ctx.user.id) {
        return forbidden("Cannot modify this user");
      }
    }

    const updateData: Record<string, unknown> = { ...fields };
    if (_password) updateData.password = hashSync(_password, 10);
    if (permissions) updateData.permissions = JSON.stringify(permissions);

    const user = await prisma.user.update({ where: { id }, data: updateData });

    await logUserUpdate(ctx.user.id, id, {}, req);
    return NextResponse.json({ success: true, data: excludePassword(user as unknown as Record<string, unknown>) });
  } catch {
    return serverError();
  }
}, "admin", "subadmin");

// DELETE /api/users — Delete user (admin only)
export const DELETE = withRole(async (req, ctx) => {
  try {
    // Rate limit
    const rl = rateLimitRequest(req, "api");
    if (rl) return rl;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return badRequest("Invalid JSON body");
    }

    const result = userDeleteSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: result.error.issues.map((e) => ({ field: e.path.join("."), message: e.message })),
        },
        { status: 400 }
      );
    }

    const { id } = result.data;

    // Prevent self-deletion
    if (id === ctx.user.id) {
      return badRequest("Cannot delete your own account");
    }

    // Subadmins cannot delete users
    if (ctx.user.role === "subadmin") {
      return forbidden("Insufficient permissions");
    }

    await prisma.user.delete({ where: { id } });

    await auditLog(ctx.user.id, "user.delete", "User", { resourceId: id }, req);
    return NextResponse.json({ success: true });
  } catch {
    return serverError();
  }
}, "admin");
