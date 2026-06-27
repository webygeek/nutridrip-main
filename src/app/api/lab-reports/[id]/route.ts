import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth, badRequest, forbidden, notFound, serverError } from "@/lib/api-utils";

// DELETE /api/lab-reports/[id] — Delete lab report
export const DELETE = withAuth(async (req, ctx) => {
  try {
    // Extract ID from path
    const match = req.nextUrl.pathname.match(/\/api\/lab-reports\/([^/]+)/);
    const id = match?.[1];

    if (!id) {
      return badRequest("Lab report ID required");
    }

    const report = await prisma.labReport.findUnique({ where: { id } });
    if (!report) {
      return notFound("Lab report not found");
    }

    // Check access - owner or admin can delete
    if (report.userId !== ctx.user.id && ctx.user.role !== "admin" && ctx.user.role !== "subadmin") {
      return forbidden("Access denied");
    }

    await prisma.labReport.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Lab report deleted successfully",
    });
  } catch {
    return serverError();
  }
});

// GET /api/lab-reports/[id] — Get single lab report
export const GET = withAuth(async (req, ctx) => {
  try {
    // Extract ID from path
    const match = req.nextUrl.pathname.match(/\/api\/lab-reports\/([^/]+)/);
    const id = match?.[1];

    if (!id) {
      return badRequest("Lab report ID required");
    }

    const report = await prisma.labReport.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!report) {
      return notFound("Lab report not found");
    }

    // Check access
    if (
      report.userId !== ctx.user.id &&
      ctx.user.role !== "admin" &&
      ctx.user.role !== "subadmin" &&
      ctx.user.role !== "doctor"
    ) {
      return forbidden("Access denied");
    }

    return NextResponse.json({ success: true, data: report });
  } catch {
    return serverError();
  }
});