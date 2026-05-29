import { redirect } from "next/navigation";
import { getSession, type SessionUser } from "@/lib/auth";

export async function requireUser(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}
