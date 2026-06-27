import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth, badRequest, notFound, serverError } from "@/lib/api-utils";
import { bookingCreateFullSchema } from "@/lib/validations";
import { logBookingCreate } from "@/lib/audit";
import { rateLimitRequest } from "@/lib/rate-limit";
import { hashSync } from "bcryptjs";
import { validateSession } from "@/lib/session";

// GET /api/bookings — List bookings
export const GET = withAuth(async (req, ctx) => {
  try {
    const rl = rateLimitRequest(req, "api");
    if (rl) return rl;

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");
    const nurseId = searchParams.get("nurseId");
    const assignedToMe = searchParams.get("assigned") === "true";

    const where: Record<string, unknown> = {};

    // Role-based filtering
    if (ctx.user.role === "patient") {
      where.userId = ctx.user.id;
    } else if (ctx.user.role === "nurse" && assignedToMe) {
      where.nurseId = ctx.user.id;
    } else if (ctx.user.role === "doctor") {
      where.doctorId = ctx.user.id;
    } else if (ctx.user.role === "subadmin" || ctx.user.role === "clinic") {
      // Can see bookings but limited scope
      if (userId) where.userId = userId;
    }
    // Admins can see all

    if (status) where.status = status;
    if (nurseId) where.nurseId = nurseId;

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        drip: true,
        user: {
          select: { id: true, name: true, email: true, phone: true }
        },
        consent: {
          select: {
            id: true,
            signatureName: true,
            signedAt: true,
          },
        },
      },
      orderBy: { scheduledAt: "desc" },
    });

    return NextResponse.json({ success: true, data: bookings });
  } catch (error) {
    console.error("Get bookings error:", error);
    return serverError();
  }
});

// POST /api/bookings — Create new booking (allows guest users with email)
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

    const result = bookingCreateFullSchema.safeParse(body);
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

    // Check if user is logged in (via auth middleware check)
    const auth = req.headers.get("authorization");
    const token = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : null;

    let userId = "";

    if (token) {
      // User is logged in - validate session
      const sessionUser = await validateSession(token);
      if (sessionUser && sessionUser.status === "active") {
        userId = sessionUser.id;
      }
    }

    // For guests, create user account with email
    if (!userId && data.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase() },
      });

      if (existingUser) {
        userId = existingUser.id;
      } else {
        const newUser = await prisma.user.create({
          data: {
            email: data.email.toLowerCase(),
            password: hashSync(`guest_${Date.now()}`, 10),
            name: `${data.firstName || ""} ${data.lastName || ""}`.trim() || "Guest",
            phone: data.mobile || "",
            role: "patient",
          },
        });
        userId = newUser.id;
      }
    } else if (!userId) {
      return badRequest("Email required for guest booking");
    }

    // Get drip details for amount - try ID first, then slug
    const drip = await prisma.drip.findFirst({
      where: {
        OR: [
          { id: data.dripId },
          { slug: data.dripId }, // Allow frontend to pass slug like "velocity"
        ],
      },
    });

    if (!drip) {
      return notFound("Drip not found");
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId,
        dripId: drip.id, // Use the actual drip ID from database
        scheduledAt: new Date(data.scheduledAt),
        location: data.location,
        address: data.address,
        notes: data.notes,
        amount: drip.price,
        status: "scheduled",
        sessionStatus: "scheduled",
      },
    });

    // Create booking note with health info
    if (data.healthNotes || data.allergies || data.medications || data.conditions) {
      await prisma.bookingNote.create({
        data: {
          bookingId: booking.id,
          healthNotes: data.healthNotes,
          allergies: data.allergies,
          medications: data.medications,
          conditions: data.conditions,
        },
      });
    }

    // Create session event
    await prisma.sessionEvent.create({
      data: {
        bookingId: booking.id,
        status: "created",
        notes: "Booking created",
        updatedById: userId,
      },
    });

    // Log the booking creation
    await logBookingCreate(userId, booking.id, req);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: booking.id,
          status: booking.status,
          scheduledAt: booking.scheduledAt,
          message: "Booking created successfully",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Booking creation error:", error);
    return serverError();
  }
}
