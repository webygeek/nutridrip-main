import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth, badRequest, serverError } from "@/lib/api-utils";
import { consentSchema } from "@/lib/validations";
import { rateLimitRequest } from "@/lib/rate-limit";

// POST /api/consent — Submit consent record
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

    const result = consentSchema.safeParse(body);
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

    // Check if consent already exists
    const existing = await prisma.consentRecord.findUnique({
      where: { bookingId: data.bookingId },
    });

    if (existing) {
      // Update existing consent
      const consent = await prisma.consentRecord.update({
        where: { bookingId: data.bookingId },
        data: {
          signatureName: data.signatureName,
          fingerprintDone: data.fingerprintDone,
          faceScanDone: data.faceScanDone,
          signedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        data: consent,
        message: "Consent updated successfully",
      });
    }

    // Create new consent
    const consent = await prisma.consentRecord.create({
      data: {
        bookingId: data.bookingId,
        patientId: ctx.user.id,
        signatureName: data.signatureName,
        fingerprintHash: data.fingerprintDone ? "completed" : "",
        fingerprintDone: data.fingerprintDone,
        faceScanHash: data.faceScanDone ? "completed" : "",
        faceScanDone: data.faceScanDone,
        ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "",
        userAgent: req.headers.get("user-agent") || "",
        signedAt: new Date(),
      },
    });

    // Update booking session status if consent is complete
    if (data.fingerprintDone && data.faceScanDone) {
      await prisma.booking.update({
        where: { id: data.bookingId },
        data: { sessionStatus: "in-progress", startedAt: new Date() },
      });

      // Create session event
      await prisma.sessionEvent.create({
        data: {
          bookingId: data.bookingId,
          status: "consent_verified",
          notes: "Patient consent verified via biometric authentication",
          updatedById: ctx.user.id,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: consent,
        message: "Consent recorded successfully",
      },
      { status: 201 }
    );
  } catch {
    return serverError();
  }
});