import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth, serverError } from "@/lib/api-utils";

// PUT /api/notifications/read-all — Mark all notifications as read
export const PUT = withAuth(async (_req, ctx) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: ctx.user.id, isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json(
      { success: true, message: "All notifications marked as read" }
    );
  } catch {
    return serverError();
  }
});