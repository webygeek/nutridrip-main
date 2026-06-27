import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth, badRequest, forbidden, notFound, serverError } from "@/lib/api-utils";
import { quizReviewSchema } from "@/lib/validations";
import { rateLimitRequest } from "@/lib/rate-limit";

// PUT /api/quiz/[id] — Review quiz (doctor only)
export const PUT = withAuth(async (req, ctx) => {
  // Only doctors and admins can review
  if (ctx.user.role !== "doctor" && ctx.user.role !== "admin") {
    return forbidden("Only doctors can review quizzes");
  }

  try {
    const rl = rateLimitRequest(req, "api");
    if (rl) return rl;

    // Extract ID from path
    const match = req.nextUrl.pathname.match(/\/api\/quiz\/([^/]+)/);
    const id = match?.[1];

    if (!id) {
      return badRequest("Quiz ID required");
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return badRequest("Invalid JSON body");
    }

    const result = quizReviewSchema.safeParse(body);
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

    const { status, doctorId, doctorName, notes } = result.data;

    // Update quiz
    const quiz = await prisma.quizResponse.update({
      where: { id },
      data: {
        status,
        doctorId: doctorId || ctx.user.id,
        doctorName: doctorName || ctx.user.name,
        notes: notes || "",
        reviewedAt: new Date(),
      },
    });

    // Create notification for patient
    await prisma.notification.create({
      data: {
        userId: quiz.userId,
        title: status === "approved" ? "Quiz Reviewed & Approved" : "Quiz Needs Update",
        body: status === "approved"
          ? "Your health quiz has been reviewed by a physician. You can now book your recommended IV therapy."
          : `Your health quiz requires additional information. ${notes || "Please check your quiz responses."}`,
        type: status === "approved" ? "success" : "warning",
        link: `/dashboard/patient`,
      },
    });

    return NextResponse.json({
      success: true,
      data: quiz,
      message: status === "approved"
        ? "Quiz approved. Patient has been notified."
        : "Quiz updated. Patient has been notified.",
    });
  } catch (error) {
    console.error("Quiz review error:", error);
    return serverError();
  }
});

// GET /api/quiz/[id] — Get single quiz
export const GET = withAuth(async (req, ctx) => {
  try {
    const rl = rateLimitRequest(req, "api");
    if (rl) return rl;

    // Extract ID from path
    const match = req.nextUrl.pathname.match(/\/api\/quiz\/([^/]+)/);
    const id = match?.[1];

    if (!id) {
      return badRequest("Quiz ID required");
    }

    const quiz = await prisma.quizResponse.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            allergies: true,
            chronicConditions: true,
            currentMedications: true,
          },
        },
      },
    });

    if (!quiz) {
      return notFound("Quiz not found");
    }

    // Check access
    const isAdmin = ctx.user.role === "admin" || ctx.user.role === "subadmin";
    const isOwner = quiz.userId === ctx.user.id;
    if (!isOwner && !isAdmin) {
      return forbidden("Access denied");
    }

    // Parse answers
    const answers = JSON.parse(quiz.answers);
    const recommendationIds = JSON.parse(quiz.recommendations);

    const drips = await prisma.drip.findMany({
      where: { id: { in: recommendationIds } },
      select: { id: true, slug: true, name: true, icon: true, price: true, description: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...quiz,
        answers,
        recommendations: drips,
      },
    });
  } catch (error) {
    console.error("Get quiz error:", error);
    return serverError();
  }
});
