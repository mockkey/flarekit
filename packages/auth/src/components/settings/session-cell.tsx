import { useAuth } from "@flarekit/auth/lib/auth-provider";
import { Spinner } from "@flarekit/ui/components/spinner";
import { Button } from "@flarekit/ui/components/ui/button";
import { RiMacbookLine, RiSmartphoneLine } from "@remixicon/react";
import type { Session } from "better-auth";
import { useTransition } from "react";
import { toast } from "sonner";
import { UAParser } from "ua-parser-js";

interface SessionCellProps {
  session: Session;
  refetch?: () => Promise<void>;
}
export function SessionCell({ refetch, session }: SessionCellProps) {
  const [isSubmitting, startTransition] = useTransition();
  const {
    navigate,
    authClient,
    hooks: { useSession },
    mutators: { revokeSession },
  } = useAuth();
  const { data: sessionData } = useSession();
  const isCurrentSession = session.token === sessionData?.session.token;
  const parser = UAParser(session.userAgent as string);
  const isMobile = parser.device.type === "mobile";
  const browser = parser.browser.name;
  const systemName = parser.os.name;

  const handleRevoke = () => {
    startTransition(async () => {
      try {
        if (isCurrentSession) {
          authClient.signOut({
            fetchOptions: {
              onSuccess: () => {
                navigate("/auth/sign-in");
              },
            },
          });
          return;
        }
        await revokeSession({ token: session.token });
        refetch?.();
      } catch (_error) {
        toast.error("Failed to revoke session");
      }
    });
  };

  return (
    <div className="flex flex-row  justify-between items-center gap-3  py-3">
      <div className="flex flex-row items-center gap-2">
        {isMobile ? (
          <RiSmartphoneLine className="size-4" />
        ) : (
          <RiMacbookLine className="size-4" />
        )}
        <div className="flex flex-col">
          <span className="font-semibold text-sm">
            {isCurrentSession ? "Current Session" : session.ipAddress}
          </span>
          <span className="text-muted-foreground text-xs">
            {systemName}, {browser}
          </span>
        </div>
      </div>
      <Button
        size="sm"
        onClick={handleRevoke}
        disabled={isSubmitting}
        variant={isCurrentSession ? "destructive" : "outline"}
      >
        {isSubmitting && <Spinner />}
        {isCurrentSession ? "Sign Out" : "Revoke"}
      </Button>
    </div>
  );
}
