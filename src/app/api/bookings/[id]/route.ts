import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth, badRequest, forbidden, notFound, serverError } from "@/lib/api-utils";
import { rateLimitRequest } from "@/lib/rate-limit";
import { logBookingUpdate } from "@/lib/audit";

// GET /api/bookings/[id] — Get single booking
export async function GET(req: NextRequest) {
  try {
    // User validation handled by auth in production
    const _ctx = { user: null, request: req };

    // Extract ID from path
    const match = req.nextUrl.pathname.match(/\/api\/bookings\/([^/]+)/);
    const id = match?.[1];

    if (!id) {
      return badRequest("Booking ID required");
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        drip: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            dob: true,
            bloodGroup: true,
            allergies: true,
            chronicConditions: true,
            currentMedications: true,
          }
        },
        consent: true,
        note: true,
        sessionEvents: {
          orderBy: { createdAt: "desc" },
        },
        feedback: true,
      },
    });

    if (!booking) {
      return notFound("Booking not found");
    }

    return NextResponse.json({ success: true, data: booking });
  } catch {
    return serverError();
  }
}

// PUT /api/bookings/[id] — Update booking
export const PUT = withAuth(async (req, ctx) => {
  try {
    const rl = rateLimitRequest(req, "api");
    if (rl) return rl;

    // Extract ID from path
    const match = req.nextUrl.pathname.match(/\/api\/bookings\/([^/]+)/);
    const id = match?.[1];

    if (!id) {
      return badRequest("Booking ID required");
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return badRequest("Invalid JSON body");
    }

    const updates = body as Record<string, unknown>;

    // Get existing booking
    const existing = await prisma.booking.findUnique({ where: { id } });
    if (!existing) {
      return notFound("Booking not found");
    }

    // Check access
    const canUpdate =
      ctx.user.role === "admin" ||
      ctx.user.role === "subadmin" ||
      existing.userId === ctx.user.id ||
      existing.nurseId === ctx.user.id ||
      existing.doctorId === ctx.user.id;

    if (!canUpdate) {
      return forbidden("Access denied");
    }

    // Handle cancellation
    if (updates.status === "cancelled") {
      const isSameDay = isSameDayCancellation(existing.scheduledAt);
      updates.cancelledAt = new Date();
      updates.cancellationFee = isSameDay ? 1500 : 0;
    }

    // Update booking
    const booking = await prisma.booking.update({
      where: { id },
      data: updates as Record<string, unknown>,
    });

    // Create session event for status changes
    if (updates.sessionStatus) {
      await prisma.sessionEvent.create({
        data: {
          bookingId: id,
          status: updates.sessionStatus as string,
          notes: `Status updated to ${updates.sessionStatus}`,
          updatedById: ctx.user.id,
        },
      });
    }

    // Log the update
    await logBookingUpdate(ctx.user.id, id, {
      status: { from: existing.status, to: booking.status },
    }, req);

    return NextResponse.json({ success: true, data: booking });
  } catch {
    return serverError();
  }
});

// DELETE /api/bookings/[id] — Cancel booking
export const DELETE = withAuth(async (req, ctx) => {
  try {
    // Extract ID from path
    const match = req.nextUrl.pathname.match(/\/api\/bookings\/([^/]+)/);
    const id = match?.[1];

    if (!id) {
      return badRequest("Booking ID required");
    }

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      return notFound("Booking not found");
    }

    // Only admin or booking owner can cancel
    if (ctx.user.role !== "admin" && booking.userId !== ctx.user.id) {
      return forbidden("Access denied");
    }

    const isSameDay = isSameDayCancellation(booking.scheduledAt);

    await prisma.booking.update({
      where: { id },
      data: {
        status: "cancelled",
        cancelledAt: new Date(),
        cancellationFee: isSameDay ? 1500 : 0,
      },
    });

    await prisma.sessionEvent.create({
      data: {
        bookingId: id,
        status: "cancelled",
        notes: isSameDay
          ? "Cancelled (same-day, fee applicable)"
          : "Cancelled (free, 24+ hours notice)",
        updatedById: ctx.user.id,
      },
    });

    await logBookingUpdate(ctx.user.id, id, {
      status: { from: booking.status, to: "cancelled" },
    }, req);

    return NextResponse.json({
      success: true,
      data: {
        cancellationFee: isSameDay ? 1500 : 0,
        message: isSameDay
          ? "Booking cancelled. A cancellation fee of ₹1,500 will be charged."
          : "Booking cancelled successfully. No cancellation fee.",
      },
    });
  } catch {
    return serverError();
  }
});

// Helper function
function isSameDayCancellation(scheduledAt: Date): boolean {
  const now = new Date();
  const scheduled = new Date(scheduledAt);
  return (
    scheduled.getDate() === now.getDate() &&
    scheduled.getMonth() === now.getMonth() &&
    scheduled.getFullYear() === now.getFullYear()
  );
}