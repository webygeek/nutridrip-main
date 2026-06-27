import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth, serverError } from "@/lib/api-utils";
import { rateLimitRequest } from "@/lib/rate-limit";

// GET /api/notifications — List user's notifications
export const GET = withAuth(async (req, ctx) => {
  try {
    const rl = rateLimitRequest(req, "api");
    if (rl) return rl;

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unread") === "true";

    const where: Record<string, unknown> = { userId: ctx.user.id };
    if (unreadOnly) {
      where.isRead = false;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: ctx.user.id, isRead: false },
    });

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch {
    return serverError();
  }
});

// PUT /api/notifications — Mark notification as read
export async function PUT(req: NextRequest) {
  // This endpoint is handled by /api/notifications/[id]/read
  return NextResponse.json(
    { success: false, error: "Use /api/notifications/[id]/read to mark notifications as read" },
    { status: 400 }
  );
}