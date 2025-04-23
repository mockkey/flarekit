import Accessibility from "~/components/settings/accessibility";
import ActiveSessions from "~/components/settings/active-sessions";
import ConnectedCard from "~/components/settings/connected-card";
import DeleteAccount from "~/components/settings/delete-account";
import ProfileCard from "~/components/settings/profile-card";

export const meta = () => [
  {
    title: "Profile Settings",
  },
];

export default function ProfileSettings() {
  return (
    <div className="space-y-6">
      {/* Profile Section with new layout */}
      <ProfileCard />

      {/* Accessibility */}
      <Accessibility />

      {/* Connected Accounts */}
      <ConnectedCard />

      {/* Active Sessions */}
      <ActiveSessions />

      {/* DeleteAccount */}
      <DeleteAccount />
    </div>
  );
}
