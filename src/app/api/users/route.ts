import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashSync } from "bcryptjs";

const exclude = (user: Record<string, unknown>) => {
  const { password, ...rest } = user;
  return rest;
};

export async function GET(req: NextRequest) {
  try {
    const role = req.nextUrl.searchParams.get("role");
    const id = req.nextUrl.searchParams.get("id");

    if (id) {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
      return NextResponse.json({ success: true, data: exclude(user as unknown as Record<string, unknown>) });
    }

    const where = role ? { role } : {};
    const users = await prisma.user.findMany({ where, orderBy: { createdAt: "desc" } });
    return NextResponse.json({ success: true, data: users.map((u) => exclude(u as unknown as Record<string, unknown>)) });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, role, ...rest } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ success: false, error: "Email, password, and name required" }, { status: 400 });
    }

    const exists = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (exists) {
      return NextResponse.json({ success: false, error: "Email already exists" }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        password: hashSync(password, 10),
        name,
        role: role || "patient",
        ...rest,
      },
    });

    return NextResponse.json({ success: true, data: exclude(user as unknown as Record<string, unknown>) }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, password, ...fields } = body;

    if (!id) return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });

    const data: Record<string, unknown> = { ...fields };
    if (password) data.password = hashSync(password, 10);

    const user = await prisma.user.update({ where: { id }, data });
    return NextResponse.json({ success: true, data: exclude(user as unknown as Record<string, unknown>) });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
