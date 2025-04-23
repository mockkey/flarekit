import { Button } from "@flarekit/ui/components/ui/button";
import { Progress } from "@flarekit/ui/components/ui/progress";
import { RiBarChart2Line, RiDeleteBinLine, RiTimeLine } from "@remixicon/react";
import { useTransition } from "react";
import { toast } from "sonner";
import { authClient } from "~/features/auth/client/auth";
import { Spinner } from "../spinner";

export interface Token {
  id: string;
  name: string | null;
  start: string | null;
  prefix: string | null;
  userId: string;
  refillInterval: number | null;
  refillAmount: number | null;
  lastRefillAt: Date | null;
  enabled: boolean;
  rateLimitEnabled: boolean;
  rateLimitTimeWindow: number | null;
  rateLimitMax: number | null;
  requestCount: number;
  remaining: number | null;
  lastRequest: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, string> | null;
  permissions?: string;
}

interface TokenItemProps {
  token: Token;
}

export default function TokenItem({ token }: TokenItemProps) {
  const [isPending, startTransition] = useTransition();

  const handleRevokeToken = () => {
    startTransition(async () => {
      const { error } = await authClient.apiKey.delete({
        keyId: token.id,
      });

      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Token revoked successfully");
    });
  };

  const usagePercentage = token.remaining
    ? Math.round(
        (token.requestCount / (token.remaining + token.requestCount)) * 100,
      )
    : 0;

  return (
    <div className="flex flex-col space-y-4 p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="font-medium">{token.name}</div>
          <code className="px-2 py-1 bg-muted rounded text-sm">
            {token.start}
          </code>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="destructive"
            size="sm"
            disabled={isPending}
            onClick={handleRevokeToken}
          >
            {isPending ? (
              <Spinner className="size-4" />
            ) : (
              <>
                <RiDeleteBinLine className="mr-2 size-4" />
                Revoke
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Token Details */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <RiTimeLine className="size-3" />
            Created: {new Date(token.createdAt).toLocaleDateString()}
          </div>
          {token.lastRequest && (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <RiTimeLine className="size-3" />
              Last Request: {new Date(token.lastRequest).toLocaleDateString()}
            </div>
          )}
          {token.expiresAt && (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <RiTimeLine className="size-3" />
              Expires: {new Date(token.expiresAt).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* Usage Stats */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <RiBarChart2Line className="size-3" />
              Usage
            </span>
            <span className="font-medium">{usagePercentage}%</span>
          </div>
          <Progress value={usagePercentage} className="h-2" />
          <div className="text-xs text-muted-foreground">
            {token.requestCount} / {(token.remaining || 0) + token.requestCount}{" "}
            requests
          </div>
        </div>
      </div>
    </div>
  );
}
