import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/OnboardingForm";
import { requireUser } from "@/lib/page-auth";
import { getOrCreateSettings } from "@/lib/settings";

export default async function OnboardingPage() {
  const user = await requireUser();
  const settings = await getOrCreateSettings(user.id);

  if (settings.onboardingComplete) {
    redirect("/dashboard");
  }

  return <OnboardingForm />;
}
