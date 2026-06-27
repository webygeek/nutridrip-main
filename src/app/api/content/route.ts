import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withRole, badRequest } from "@/lib/api-utils";
import { contentBlockSchema, contentBlockDeleteSchema } from "@/lib/validations";
import { logContentUpdate } from "@/lib/audit";
import { rateLimitRequest } from "@/lib/rate-limit";

// GET /api/content — Public (no auth required)
export async function GET(req: NextRequest) {
  try {
    const key = req.nextUrl.searchParams.get("key");
    if (key) {
      const block = await prisma.contentBlock.findUnique({ where: { key } });
      return NextResponse.json({ success: true, data: block ? { key: block.key, value: block.value } : null });
    }
    const blocks = await prisma.contentBlock.findMany();
    const overrides: Record<string, string> = {};
    for (const b of blocks) overrides[b.key] = b.value;
    return NextResponse.json({ success: true, data: overrides });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// POST /api/content — Update content block (admin/subadmin only)
export const POST = withRole(async (req, ctx) => {
  try {
    const rl = rateLimitRequest(req, "content");
    if (rl) return rl;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return badRequest("Invalid JSON body");
    }

    const result = contentBlockSchema.safeParse(body);
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

    const { key, value } = result.data;

    await prisma.contentBlock.upsert({
      where: { key },
      update: { value, updatedBy: ctx.user.id },
      create: { key, value, updatedBy: ctx.user.id },
    });

    await logContentUpdate(ctx.user.id, key, req);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}, "admin", "subadmin");

// DELETE /api/content — Delete content block (admin only)
export const DELETE = withRole(async (req, ctx) => {
  try {
    const rl = rateLimitRequest(req, "content");
    if (rl) return rl;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return badRequest("Invalid JSON body");
    }

    const result = contentBlockDeleteSchema.safeParse(body);
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

    const { key } = result.data;

    if (key) {
      await prisma.contentBlock.deleteMany({ where: { key } });
    } else {
      // Only admin can delete all content (subadmin cannot)
      if (ctx.user.role !== "admin") {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
      }
      await prisma.contentBlock.deleteMany();
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}, "admin");
