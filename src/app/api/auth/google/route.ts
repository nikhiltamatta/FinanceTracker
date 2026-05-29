import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getGoogleAuthUrl, isGoogleAuthConfigured } from "@/lib/google-auth";

export async function GET() {
  if (!isGoogleAuthConfigured()) {
    return NextResponse.json(
      { error: "Google sign-in is not configured" },
      { status: 503 },
    );
  }

  const state = randomBytes(16).toString("hex");
  const url = getGoogleAuthUrl(state);

  const response = NextResponse.redirect(url);
  response.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return response;
}
