import { NextResponse } from "next/server";
import { createPasswordResetToken } from "@/lib/auth";

export async function POST(request: Request) {
  const { email } = await request.json();
  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const token = await createPasswordResetToken(email);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const resetUrl = token ? `${baseUrl}/reset-password?token=${token}` : null;

  if (process.env.NODE_ENV !== "production" && resetUrl) {
    console.info("[FinanceTracker] Password reset link:", resetUrl);
  }

  return NextResponse.json({
    ok: true,
    message:
      "If that email exists, a reset link was sent. In development, check the server console for the link.",
    ...(process.env.NODE_ENV !== "production" && resetUrl ? { resetUrl } : {}),
  });
}
