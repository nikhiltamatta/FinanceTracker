import { prisma } from "@/lib/db";
import { DEFAULT_CURRENCY } from "@/lib/format";
import { createSession, type SessionUser } from "@/lib/auth";

const GOOGLE_AUTH = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO = "https://www.googleapis.com/oauth2/v2/userinfo";

export function isGoogleAuthConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );
}

export function getGoogleAuthUrl(state: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/auth/google/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });
  return `${GOOGLE_AUTH}?${params}`;
}

export async function handleGoogleCallback(
  code: string,
): Promise<SessionUser> {
  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/auth/google/callback`;

  const tokenRes = await fetch(GOOGLE_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    throw new Error("Failed to exchange Google code");
  }

  const tokens = (await tokenRes.json()) as { access_token: string };
  const profileRes = await fetch(GOOGLE_USERINFO, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  if (!profileRes.ok) {
    throw new Error("Failed to fetch Google profile");
  }

  const profile = (await profileRes.json()) as {
    id: string;
    email: string;
    name?: string;
  };

  const email = profile.email.toLowerCase();
  let user = await prisma.user.findFirst({
    where: { OR: [{ googleId: profile.id }, { email }] },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        googleId: profile.id,
        name: profile.name ?? null,
        emailVerified: true,
        settings: { create: { currency: DEFAULT_CURRENCY } },
      },
    });
  } else if (!user.googleId) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { googleId: profile.id, emailVerified: true },
    });
  }

  const sessionUser: SessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
  };
  await createSession(sessionUser);
  return sessionUser;
}
