export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full items-center justify-center bg-zinc-100 px-4 py-12 dark:bg-zinc-950">
      {children}
    </div>
  );
}
