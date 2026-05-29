import { Suspense } from "react";
import { LoginForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-sm text-zinc-500">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
