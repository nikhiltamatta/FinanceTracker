import { NextResponse } from "next/server";
import { isSession, requireApiSession } from "@/lib/api-auth";
import {
  createHousehold,
  getUserHousehold,
  joinHousehold,
} from "@/lib/household";

export async function GET() {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const household = await getUserHousehold(session.id);
  return NextResponse.json({ household });
}

export async function POST(request: Request) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  try {
    const body = await request.json();
    if (body.action === "join") {
      const household = await joinHousehold(session.id, body.inviteCode);
      return NextResponse.json({ household });
    }
    const household = await createHousehold(
      session.id,
      body.name ?? "My household",
    );
    return NextResponse.json({ household }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
