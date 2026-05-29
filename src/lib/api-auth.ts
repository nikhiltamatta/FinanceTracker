import { NextResponse } from "next/server";
import { getSession, type SessionUser } from "@/lib/auth";

export async function requireApiSession(): Promise<
  SessionUser | NextResponse
> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session;
}

export function isSession(
  value: SessionUser | NextResponse,
): value is SessionUser {
  return "id" in value && typeof value.id === "string";
}
