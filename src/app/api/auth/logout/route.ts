import { NextRequest, NextResponse } from "next/server";
import { deleteSession, validateSession } from "@/lib/session";
import { AUTH_COOKIE_NAME, COOKIE_OPTIONS_CLEAR } from "@/lib/cookies";
import { extractToken } from "@/lib/api-utils";
import { logLogout } from "@/lib/audit";

// DELETE /api/auth/logout — Clear session and cookie
export async function DELETE(req: NextRequest) {
  try {
    const token = extractToken(req);

    if (token) {
      // Validate session and log the logout
      const user = await validateSession(token);
      if (user) {
        await logLogout(user.id, req);
      }

      // Delete session from database
      await deleteSession(token);
    }

    // Clear the cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set(AUTH_COOKIE_NAME, "", COOKIE_OPTIONS_CLEAR);

    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

// POST /api/auth/logout — Alias for DELETE (some clients prefer POST)
export async function POST(req: NextRequest) {
  return DELETE(req);
}