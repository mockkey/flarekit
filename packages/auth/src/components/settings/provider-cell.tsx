import { useAuth } from "@flarekit/auth/lib/auth-provider";
import type { SocialProvider } from "@flarekit/auth/types/auth-client";
import { Spinner } from "@flarekit/ui/components/spinner";
import { Button } from "@flarekit/ui/components/ui/button";
import { Skeleton } from "@flarekit/ui/components/ui/skeleton";
import { useTransition } from "react";

interface ProviderCell {
  social: SocialProvider;
  isPending: boolean;
  account: { accountId: string; provider: string } | null;
}

export function ProviderCell({ social, isPending, account }: ProviderCell) {
  const [isSubmitting, startTransition] = useTransition();
  const { authClient } = useAuth();
  const handleLink = () => {
    startTransition(async () => {
      await authClient.linkSocial({
        provider: "github",
        callbackURL: "/settings",
      });
    });
  };

  const handleUnlink = () => {
    startTransition(async () => {
      if (account) {
        await authClient.unlinkAccount({
          accountId: account.accountId,
          providerId: social.name,
          fetchOptions: { throw: true },
        });
      }
    });
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {isPending ? <Skeleton className="size-8" /> : social.icon}

        <div className="flex flex-col">
          {isPending ? (
            <Skeleton className="w-16 h-6" />
          ) : (
            <p className="font-medium">{social.name}</p>
          )}
        </div>
      </div>

      {isPending ? (
        <Skeleton className="h-8 w-12" />
      ) : (
        <Button
          size="sm"
          onClick={() => {
            !account ? handleLink() : handleUnlink();
          }}
          variant={account ? "outline" : "default"}
          disabled={isSubmitting}
        >
          {isSubmitting && <Spinner />}
          {account ? "Unlink" : "Link"}
        </Button>
      )}
    </div>
  );
}
