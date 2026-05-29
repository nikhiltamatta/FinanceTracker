import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { handleGoogleCallback } from "@/lib/google-auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const cookieStore = await cookies();
  const savedState = cookieStore.get("google_oauth_state")?.value;

  if (!code || !state || state !== savedState) {
    return NextResponse.redirect(
      new URL("/login?error=google_auth_failed", request.url),
    );
  }

  try {
    await handleGoogleCallback(code);
    cookieStore.delete("google_oauth_state");
    return NextResponse.redirect(new URL("/onboarding", request.url));
  } catch {
    return NextResponse.redirect(
      new URL("/login?error=google_auth_failed", request.url),
    );
  }
}
