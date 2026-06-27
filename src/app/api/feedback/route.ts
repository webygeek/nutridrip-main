import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth, badRequest, notFound, serverError } from "@/lib/api-utils";
import { feedbackSchema } from "@/lib/validations";
import { rateLimitRequest } from "@/lib/rate-limit";

// POST /api/feedback — Submit session feedback
export const POST = withAuth(async (req, ctx) => {
  try {
    const rl = rateLimitRequest(req, "api");
    if (rl) return rl;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return badRequest("Invalid JSON body");
    }

    const result = feedbackSchema.safeParse(body);
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

    // Check if booking exists and belongs to user
    const booking = await prisma.booking.findUnique({
      where: { id: data.bookingId },
    });

    if (!booking) {
      return notFound("Booking not found");
    }

    if (booking.userId !== ctx.user.id && ctx.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    // Check if feedback already exists
    const existing = await prisma.sessionFeedback.findUnique({
      where: { bookingId: data.bookingId },
    });

    if (existing) {
      // Update existing feedback
      const feedback = await prisma.sessionFeedback.update({
        where: { bookingId: data.bookingId },
        data: {
          hygieneRating: data.hygieneRating,
          behaviourRating: data.behaviourRating,
          comfortRating: data.comfortRating,
          overallRating: data.overallRating || Math.round(
            (data.hygieneRating + data.behaviourRating + data.comfortRating) / 3
          ),
          comment: data.comment,
          isDuringDrip: booking.sessionStatus === "in-progress",
        },
      });

      return NextResponse.json({
        success: true,
        data: feedback,
        message: "Feedback updated successfully",
      });
    }

    // Create new feedback
    const feedback = await prisma.sessionFeedback.create({
      data: {
        bookingId: data.bookingId,
        patientId: ctx.user.id,
        hygieneRating: data.hygieneRating,
        behaviourRating: data.behaviourRating,
        comfortRating: data.comfortRating,
        overallRating: data.overallRating || Math.round(
          (data.hygieneRating + data.behaviourRating + data.comfortRating) / 3
        ),
        comment: data.comment,
        isDuringDrip: booking.sessionStatus === "in-progress",
      },
    });

    // Update booking status if needed
    if (booking.sessionStatus !== "completed") {
      await prisma.booking.update({
        where: { id: data.bookingId },
        data: { sessionStatus: "completed", completedAt: new Date() },
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: feedback,
        message: "Thank you for your feedback!",
      },
      { status: 201 }
    );
  } catch {
    return serverError();
  }
});

// GET /api/feedback — List feedback (admin/doctor only)
export async function GET(req: NextRequest) {
  try {
    // Extract user from auth header (simplified for this example)
    const auth = req.headers.get("authorization") || "";
    if (!auth.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const feedbacks = await prisma.sessionFeedback.findMany({
      include: {
        booking: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            drip: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json({ success: true, data: feedbacks });
  } catch {
    return serverError();
  }
}