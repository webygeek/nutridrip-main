import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth, badRequest, serverError } from "@/lib/api-utils";
import { consultationSchema } from "@/lib/validations";
import { rateLimitRequest } from "@/lib/rate-limit";

// POST /api/consult — Submit consultation request (public)
export async function POST(req: NextRequest) {
  try {
    const rl = rateLimitRequest(req, "api");
    if (rl) return rl;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return badRequest("Invalid JSON body");
    }

    const result = consultationSchema.safeParse(body);
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

    const data = result.data;

    const consultation = await prisma.consultationRequest.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        concern: data.concern,
        preferredTime: data.preferredTime,
        userId: data.userId || "",
        status: "pending",
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: consultation.id,
          message: "Your consultation request has been submitted. We will contact you shortly.",
        },
      },
      { status: 201 }
    );
  } catch {
    return serverError();
  }
}

// GET /api/consult — List consultations (doctor/admin only)
export const GET = withAuth(async (req, ctx) => {
  try {
    // Only doctors and admins can view consultations
    if (ctx.user.role !== "admin" && ctx.user.role !== "doctor") {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    const consultations = await prisma.consultationRequest.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: consultations });
  } catch {
    return serverError();
  }
});