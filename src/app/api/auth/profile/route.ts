import { NextResponse } from "next/server";
import { createSession, updateProfile } from "@/lib/auth";
import { isSession, requireApiSession } from "@/lib/api-auth";

export async function PATCH(request: Request) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  try {
    const body = await request.json();
    const user = await updateProfile(session.id, {
      name: body.name,
      email: body.email,
    });
    await createSession(user);
    return NextResponse.json({ user });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Profile update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
