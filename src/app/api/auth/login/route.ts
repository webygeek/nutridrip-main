import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { compareSync } from "bcryptjs";
import { createSession } from "@/lib/session";
import { AUTH_COOKIE_NAME, COOKIE_OPTIONS } from "@/lib/cookies";
import { loginSchema } from "@/lib/validations";
import { rateLimitRequest } from "@/lib/rate-limit";
import { logLogin } from "@/lib/audit";
import { ALL_PERMISSIONS, type Permission } from "@/lib/auth";

export async function POST(req: NextRequest) {
  // Rate limit auth endpoints
  const rateLimitResponse = rateLimitRequest(req, "auth");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: result.error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user || !compareSync(password, user.password)) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (user.status !== "active") {
      return NextResponse.json(
        { success: false, error: "Account disabled. Contact support." },
        { status: 403 }
      );
    }

    const token = await createSession(user.id);

    // Log successful login
    await logLogin(user.id, req);

    // Parse permissions
    const permissions = (JSON.parse(user.permissions) as string[]).filter(
      (p): p is Permission => ALL_PERMISSIONS.includes(p as Permission)
    );

    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        permissions,
      },
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, COOKIE_OPTIONS);

    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
