import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/AuthForm";

function ResetPasswordInner({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  return <ResetPasswordForm token={searchParams.token ?? ""} />;
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  return (
    <Suspense fallback={<div className="text-sm text-zinc-500">Loading…</div>}>
      <ResetPasswordInner searchParams={params} />
    </Suspense>
  );
}
