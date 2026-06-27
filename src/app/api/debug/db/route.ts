import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { extractToken, getAuthUser } from "@/lib/api-utils";

// GET /api/debug/db - View database tables
export async function GET(req: Request) {
  try {
    // Get auth user
    const authUser = await getAuthUser(req as any);

    // Get counts
    const counts = {
      users: await prisma.user.count(),
      bookings: await prisma.booking.count(),
      quizzes: await prisma.quizResponse.count(),
      labReports: await prisma.labReport.count(),
      drips: await prisma.drip.count(),
      clinicEnquiries: await prisma.clinicEnquiry.count(),
      notifications: await prisma.notification.count(),
      consents: await prisma.consentRecord.count(),
      sessions: await prisma.userSession.count(),
    };

    // Get recent sessions
    const sessions = await prisma.userSession.findMany({
      orderBy: { expiresAt: "desc" },
    });

    // Get users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Get recent bookings
    const bookings = await prisma.booking.findMany({
      include: {
        drip: { select: { name: true, price: true } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get drips
    const drips = await prisma.drip.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        category: true,
        active: true,
      },
      orderBy: { name: "asc" },
    });

    // Get quizzes
    const quizzes = await prisma.quizResponse.findMany({
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get lab reports (no orderBy - model may not have createdAt)
    const labReports = await prisma.labReport.findMany({
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    // Get clinic enquiries
    const clinicEnquiries = await prisma.clinicEnquiry.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      authUser: authUser ? { id: authUser.id, email: authUser.email, role: authUser.role } : null,
      timestamp: new Date().toISOString(),
      counts,
      sessions: sessions.slice(0, 5).map(s => ({
        tokenPreview: s.token.slice(0, 20) + "...",
        expiresAt: s.expiresAt,
        userId: s.userId,
      })),
      users: users.slice(0, 50),
      bookings: bookings.slice(0, 50),
      drips,
      quizzes: quizzes.slice(0, 20),
      labReports: labReports.slice(0, 20),
      clinicEnquiries: clinicEnquiries.slice(0, 20),
    });
  } catch (error) {
    console.error("Debug DB error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
