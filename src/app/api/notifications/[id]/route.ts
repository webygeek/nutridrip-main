import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth, badRequest, forbidden, notFound, serverError } from "@/lib/api-utils";

// PUT /api/notifications/[id]/read — Mark notification as read
export const PUT = withAuth(async (req, ctx) => {
  try {
    // Extract ID from path
    const match = req.nextUrl.pathname.match(/\/api\/notifications\/([^/]+)\/read/);
    const id = match?.[1];

    if (!id) {
      return badRequest("Notification ID required");
    }

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) {
      return notFound("Notification not found");
    }

    // Check access
    if (notification.userId !== ctx.user.id && ctx.user.role !== "admin") {
      return forbidden("Access denied");
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return NextResponse.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch {
    return serverError();
  }
});

// DELETE /api/notifications/[id] — Delete notification
export const DELETE = withAuth(async (req, ctx) => {
  try {
    // Extract ID from path
    const match = req.nextUrl.pathname.match(/\/api\/notifications\/([^/]+)/);
    const id = match?.[1];

    if (!id) {
      return badRequest("Notification ID required");
    }

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) {
      return notFound("Notification not found");
    }

    // Check access
    if (notification.userId !== ctx.user.id && ctx.user.role !== "admin") {
      return forbidden("Access denied");
    }

    await prisma.notification.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Notification deleted",
    });
  } catch {
    return serverError();
  }
});