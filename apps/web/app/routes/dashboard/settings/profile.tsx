import { AccountDeleteCard } from "@flarekit/auth/components/settings/account-delete-card";
import { ProfileCard } from "@flarekit/auth/components/settings/profile-card";
import { ProvidersCard } from "@flarekit/auth/components/settings/providers-card";
import { SessionsCard } from "@flarekit/auth/components/settings/sessions-card";
import Accessibility from "~/components/settings/accessibility";

export const meta = () => [
  {
    title: "Profile Settings",
  },
];

export default function ProfileSettings() {
  return (
    <div className="space-y-6">
      <ProfileCard />
      <Accessibility />
      <ProvidersCard />
      <SessionsCard />
      <AccountDeleteCard />
    </div>
  );
}
