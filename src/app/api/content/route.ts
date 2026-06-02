import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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

export async function POST(req: NextRequest) {
  try {
    const { key, value } = await req.json();
    if (!key) return NextResponse.json({ success: false, error: "Key required" }, { status: 400 });
    await prisma.contentBlock.upsert({ where: { key }, update: { value }, create: { key, value } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { key } = await req.json();
    if (key) {
      await prisma.contentBlock.deleteMany({ where: { key } });
    } else {
      await prisma.contentBlock.deleteMany();
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
