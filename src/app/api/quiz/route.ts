import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth, badRequest, serverError } from "@/lib/api-utils";
import { quizSubmitSchema } from "@/lib/validations";
import { rateLimitRequest } from "@/lib/rate-limit";

// Quiz recommendation algorithm
function calculateRecommendations(answers: Array<{ questionId: string; answer: string }>): {
  recommendations: string[];
  severity: string;
} {
  const recommendations: string[] = [];
  let severity = "low";
  const answerText = answers.map((a) => a.answer.toLowerCase()).join(" ");

  if (answerText.includes("energy") || answerText.includes("fatigue") || answerText.includes("tired")) {
    recommendations.push("velocity");
    severity = "moderate";
  }

  if (answerText.includes("immunity") || answerText.includes("immune") || answerText.includes("sick")) {
    recommendations.push("fortress");
    severity = "high";
  }

  if (answerText.includes("skin") || answerText.includes("beauty") || answerText.includes("glow")) {
    recommendations.push("luminescence");
    severity = severity === "high" ? "high" : "moderate";
  }

  if (answerText.includes("recovery") || answerText.includes("muscle") || answerText.includes("athletic")) {
    recommendations.push("velocity");
    severity = severity === "high" ? "high" : "moderate";
  }

  if (answerText.includes("focus") || answerText.includes("mental") || answerText.includes("brain")) {
    recommendations.push("velocity");
    severity = severity === "high" ? "high" : "moderate";
  }

  if (recommendations.length === 0) {
    recommendations.push("velocity");
  }

  return { recommendations: [...new Set(recommendations)], severity };
}

// POST /api/quiz — Submit quiz results
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

    const result = quizSubmitSchema.safeParse(body);
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

    const { answers, userId } = result.data;

    // Use provided userId or current user
    const targetUserId = userId || ctx.user.id;

    // Calculate recommendations
    const { recommendations, severity } = calculateRecommendations(answers);

    // Get drip IDs for recommendations
    const drips = await prisma.drip.findMany({
      where: { slug: { in: recommendations } },
      select: { id: true, slug: true, name: true, icon: true },
    });

    // If no drips found by slug, get any drips
    const finalDrips = drips.length > 0 ? drips : await prisma.drip.findMany({
      take: 3,
      select: { id: true, slug: true, name: true, icon: true },
    });

    // Create quiz response
    const quiz = await prisma.quizResponse.create({
      data: {
        userId: targetUserId,
        answers: JSON.stringify(answers),
        recommendations: JSON.stringify(finalDrips.map((d) => d.id)),
        severity,
        status: "pending",
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: quiz.id,
          recommendations: finalDrips,
          severity,
          message: "Quiz submitted successfully. A physician will review your results.",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Quiz submission error:", error);
    return serverError();
  }
});

// GET /api/quiz — List quiz responses
export const GET = withAuth(async (req, ctx) => {
  try {
    const rl = rateLimitRequest(req, "api");
    if (rl) return rl;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");

    const where: Record<string, unknown> = {};

    // Role-based filtering
    if (ctx.user.role === "patient") {
      where.userId = ctx.user.id;
    } else if (userId && ctx.user.role !== "patient") {
      where.userId = userId;
    }

    if (status && ctx.user.role !== "patient") {
      where.status = status;
    }

    const quizzes = await prisma.quizResponse.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Parse recommendations and get drip details
    const quizzesWithDrips = await Promise.all(
      quizzes.map(async (quiz) => {
        const recommendationIds = JSON.parse(quiz.recommendations || "[]");
        const drips = await prisma.drip.findMany({
          where: { id: { in: recommendationIds } },
          select: { id: true, slug: true, name: true, icon: true, price: true },
        });
        return {
          ...quiz,
          recommendations: drips,
        };
      })
    );

    return NextResponse.json({ success: true, data: quizzesWithDrips });
  } catch (error) {
    console.error("Get quizzes error:", error);
    return serverError();
  }
});
