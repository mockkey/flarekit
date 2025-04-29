import { useAuth } from "@flarekit/auth/lib/auth-provider";
import SettingCard from "../setting-card";
import { ProviderCell } from "./provider-cell";

interface ProvidersCardProps {
  title?: string;
  description?: string;
  accounts?: { accountId: string; provider: string }[] | null;
}

export function ProvidersCard({
  title = "Connected Accounts",
  description = "Manage your connected accounts",
}: ProvidersCardProps) {
  const {
    socials,
    hooks: { useListAccounts },
  } = useAuth();
  const res = useListAccounts();
  const accounts = res.data;
  const isPending = res.isPending;
  return (
    <SettingCard title={title} description={description} isPending={isPending}>
      {socials.map((social) => {
        return (
          <ProviderCell
            account={accounts?.find(
              (account) => account.provider === social.name,
            )}
            key={social.name}
            social={social}
            isPending={isPending}
          />
        );
      })}
    </SettingCard>
  );
}
