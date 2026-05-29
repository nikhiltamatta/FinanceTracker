import { NextResponse } from "next/server";
import { changePassword } from "@/lib/auth";
import { isSession, requireApiSession } from "@/lib/api-auth";

export async function POST(request: Request) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  try {
    const { currentPassword, newPassword } = await request.json();
    await changePassword(session.id, currentPassword, newPassword);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Password change failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
