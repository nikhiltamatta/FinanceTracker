import { ChangePasswordForm } from "@/components/ChangePasswordForm";
import { ProfileForm } from "@/components/ProfileForm";
import { SettingsForm } from "@/components/SettingsForm";
import { requireUser } from "@/lib/page-auth";
import { getOrCreateSettings } from "@/lib/settings";

export default async function SettingsPage() {
  const user = await requireUser();
  const settings = await getOrCreateSettings(user.id);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Pay schedule, EUR currency, rollover, profile, and security.
        </p>
      </header>
      <ProfileForm user={user} />
      <SettingsForm settings={settings} />
      <ChangePasswordForm />
    </div>
  );
}
