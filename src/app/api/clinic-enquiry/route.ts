import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth, withRole, badRequest, serverError } from "@/lib/api-utils";
import { clinicEnquirySchema } from "@/lib/validations";
import { rateLimitRequest } from "@/lib/rate-limit";

// POST /api/clinic-enquiry — Submit B2B enquiry (public)
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

    const result = clinicEnquirySchema.safeParse(body);
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

    const enquiry = await prisma.clinicEnquiry.create({
      data: {
        clinicName: data.clinicName,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        orderType: data.orderType,
        formulas: JSON.stringify(data.formulas),
        qty: data.qty,
        address: data.address,
        instructions: data.instructions,
        status: "pending",
      },
    });

    // Notify admins (in production, this would create notifications)
    // await prisma.notification.createMany({...})

    return NextResponse.json(
      {
        success: true,
        data: {
          id: enquiry.id,
          message: "Thank you for your enquiry. Our B2B team will contact you within 24 hours.",
        },
      },
      { status: 201 }
    );
  } catch {
    return serverError();
  }
}

// GET /api/clinic-enquiry — List enquiries (admin/clinic only)
export const GET = withRole(async (_req, ctx) => {
  try {
    const enquiries = await prisma.clinicEnquiry.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Parse JSON fields
    const parsed = enquiries.map(e => ({
      ...e,
      formulas: JSON.parse(e.formulas),
    }));

    return NextResponse.json({ success: true, data: parsed });
  } catch {
    return serverError();
  }
}, "admin", "clinic");