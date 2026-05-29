import { redirect } from "next/navigation";
import { Nav } from "@/components/Nav";
import { getSession } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <>
      <Nav user={session} />
      <main className="mx-auto max-w-5xl flex-1 px-4 py-8">{children}</main>
    </>
  );
}
