import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth, badRequest, serverError } from "@/lib/api-utils";
import { labReportUploadSchema } from "@/lib/validations";
import { rateLimitRequest } from "@/lib/rate-limit";

// GET /api/lab-reports — List user's lab reports
export const GET = withAuth(async (req, ctx) => {
  try {
    const rl = rateLimitRequest(req, "api");
    if (rl) return rl;

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    // Role-based filtering
    const where: Record<string, unknown> = {};
    if (ctx.user.role === "patient") {
      where.userId = ctx.user.id;
    } else if (userId && (ctx.user.role === "doctor" || ctx.user.role === "admin" || ctx.user.role === "subadmin")) {
      where.userId = userId;
    }

    const reports = await prisma.labReport.findMany({
      where,
      orderBy: { uploadedAt: "desc" },
    });

    return NextResponse.json({ success: true, data: reports });
  } catch {
    return serverError();
  }
});

// POST /api/lab-reports — Upload lab report
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

    const result = labReportUploadSchema.safeParse(body);
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

    const { fileName, fileSize, category, notes } = result.data;

    // In production, this would handle actual file upload to cloud storage
    // For now, we'll create a placeholder path
    const filePath = `/uploads/lab-reports/${Date.now()}_${fileName}`;

    const report = await prisma.labReport.create({
      data: {
        userId: ctx.user.id,
        fileName,
        filePath,
        fileSize,
        category,
        notes: notes || "",
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: report,
        message: "Lab report uploaded successfully",
      },
      { status: 201 }
    );
  } catch {
    return serverError();
  }
});