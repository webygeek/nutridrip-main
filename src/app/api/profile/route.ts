import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth, badRequest, serverError } from "@/lib/api-utils";
import { profileUpdateSchema } from "@/lib/validations";
import { rateLimitRequest } from "@/lib/rate-limit";

// GET /api/profile — Get current user's profile
export const GET = withAuth(async (req, ctx) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: ctx.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        dob: true,
        bloodGroup: true,
        address: true,
        emergencyContact: true,
        allergies: true,
        chronicConditions: true,
        currentMedications: true,
        surgeries: true,
        familyHistory: true,
        lifestyleNotes: true,
        specialty: true,
        qualifications: true,
        experience: true,
        rnNumber: true,
        shift: true,
        languages: true,
        status: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch {
    return serverError();
  }
});

// PUT /api/profile — Update current user's profile
export const PUT = withAuth(async (req, ctx) => {
  try {
    const rl = rateLimitRequest(req, "api");
    if (rl) return rl;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return badRequest("Invalid JSON body");
    }

    const result = profileUpdateSchema.safeParse(body);
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

    const updates = result.data;

    const user = await prisma.user.update({
      where: { id: ctx.user.id },
      data: updates,
    });

    // Return without sensitive fields
    const { password: _, ...safeUser } = user;

    return NextResponse.json({
      success: true,
      data: safeUser,
      message: "Profile updated successfully",
    });
  } catch {
    return serverError();
  }
});