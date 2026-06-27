// Audit logging for PHI access and sensitive operations
// All user data modifications are logged for HIPAA-equivalent compliance

import { prisma } from "@/lib/db";

export type AuditAction =
  | "user.create"
  | "user.read"
  | "user.update"
  | "user.delete"
  | "user.login"
  | "user.logout"
  | "booking.create"
  | "booking.read"
  | "booking.update"
  | "booking.delete"
  | "approval.create"
  | "approval.update"
  | "content.create"
  | "content.update"
  | "content.delete"
  | "labreport.upload"
  | "labreport.read"
  | "labreport.delete"
  | "consent.sign"
  | "session.start"
  | "session.complete"
  | "notification.create";

export type AuditResource =
  | "User"
  | "Booking"
  | "Approval"
  | "ContentBlock"
  | "LabReport"
  | "ConsentRecord"
  | "Session"
  | "Notification"
  | "Auth";

export interface AuditLogDetails {
  resourceId?: string;
  changes?: Record<string, { from: unknown; to: unknown }>;
  metadata?: Record<string, unknown>;
}

/**
 * Create an audit log entry
 */
export async function auditLog(
  userId: string,
  action: AuditAction,
  resource: AuditResource,
  details: AuditLogDetails = {},
  request?: Request
): Promise<void> {
  try {
    const ipAddress = request
      ? getClientIpFromRequest(request)
      : "";

    const userAgent = request
      ? request.headers.get("user-agent") || ""
      : "";

    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        resourceId: details.resourceId || "",
        details: JSON.stringify({
          changes: details.changes,
          metadata: details.metadata,
        }),
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    // Don't fail the main operation if audit logging fails
    // Just log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Audit log failed:", error);
    }
  }
}

/**
 * Get audit logs with filters
 */
export async function getAuditLogs(options: {
  userId?: string;
  action?: AuditAction;
  resource?: AuditResource;
  resourceId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const where: Record<string, unknown> = {};

  if (options.userId) where.userId = options.userId;
  if (options.action) where.action = options.action;
  if (options.resource) where.resource = options.resource;
  if (options.resourceId) where.resourceId = options.resourceId;
  if (options.startDate || options.endDate) {
    where.createdAt = {};
    if (options.startDate) (where.createdAt as Record<string, Date>).gte = options.startDate;
    if (options.endDate) (where.createdAt as Record<string, Date>).lte = options.endDate;
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: options.limit || 50,
      skip: options.offset || 0,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total };
}

/**
 * Log user login
 */
export async function logLogin(userId: string, request?: Request) {
  await auditLog(userId, "user.login", "Auth", {}, request);
}

/**
 * Log user logout
 */
export async function logLogout(userId: string, request?: Request) {
  await auditLog(userId, "user.logout", "Auth", {}, request);
}

/**
 * Log user creation
 */
export async function logUserCreate(
  adminId: string,
  newUserId: string,
  request?: Request
) {
  await auditLog(adminId, "user.create", "User", { resourceId: newUserId }, request);
}

/**
 * Log user update with changes
 */
export async function logUserUpdate(
  adminId: string,
  userId: string,
  changes: Record<string, { from: unknown; to: unknown }>,
  request?: Request
) {
  await auditLog(adminId, "user.update", "User", { resourceId: userId, changes }, request);
}

/**
 * Log content update
 */
export async function logContentUpdate(
  userId: string,
  key: string,
  request?: Request
) {
  await auditLog(userId, "content.update", "ContentBlock", { resourceId: key }, request);
}

/**
 * Log booking creation
 */
export async function logBookingCreate(
  userId: string,
  bookingId: string,
  request?: Request
) {
  await auditLog(userId, "booking.create", "Booking", { resourceId: bookingId }, request);
}

/**
 * Log booking status change
 */
export async function logBookingUpdate(
  userId: string,
  bookingId: string,
  changes: Record<string, { from: unknown; to: unknown }>,
  request?: Request
) {
  await auditLog(userId, "booking.update", "Booking", { resourceId: bookingId, changes }, request);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getClientIpFromRequest(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "";
}