import { ChangePasswordForm } from "@/components/ChangePasswordForm";
import { ExportBackupButton } from "@/components/ExportBackupButton";
import { HouseholdPanel } from "@/components/HouseholdPanel";
import { ProfileForm } from "@/components/ProfileForm";
import { SettingsForm } from "@/components/SettingsForm";
import { getUserHousehold } from "@/lib/household";
import { requireUser } from "@/lib/page-auth";
import { getOrCreateSettings } from "@/lib/settings";

export default async function SettingsPage() {
  const user = await requireUser();
  const [settings, household] = await Promise.all([
    getOrCreateSettings(user.id),
    getUserHousehold(user.id),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Pay schedule, EUR currency, rollover, profile, and security.
        </p>
      </header>
      <ProfileForm user={user} />
      <HouseholdPanel household={household} />
      <SettingsForm settings={settings} />
      <ExportBackupButton />
      <ChangePasswordForm />
    </div>
  );
}
