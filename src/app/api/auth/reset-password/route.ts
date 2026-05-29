import { NextResponse } from "next/server";
import { resetPasswordWithToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();
    if (!token || !password || String(password).length < 6) {
      return NextResponse.json(
        { error: "Token and password (min 6 chars) required" },
        { status: 400 },
      );
    }
    await resetPasswordWithToken(token, password);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Reset failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
