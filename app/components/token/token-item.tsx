import { Button } from "@flarekit/ui/components/ui/button";
import { RiClipboardLine, RiDeleteBinLine } from "@remixicon/react";
import { useTransition } from "react";
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
  metadata: Record<string, any> | null;
  permissions?: string;
}

interface TokenItemProps {
  token: Token;
}

export default function TokenItem({ token }: TokenItemProps) {
  const [isPending, startTransition] = useTransition();

  const handleRevokeToken = () => {
    startTransition(async () => {
      const { data: result, error } = await authClient.apiKey.delete({
        keyId: token.id,
      });
      console.log("result", result, error);
      return;
    });
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="space-y-1">
        <div className="font-medium">{token.name}</div>
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <code className="px-2 py-1 bg-muted rounded">{token.start}</code>
        </div>
        <div className="text-xs text-muted-foreground">
          Created: {new Date(token.createdAt).toLocaleDateString()}
          {token.expiresAt &&
            ` • Last used: ${new Date(token.expiresAt).toLocaleDateString()}`}
          {token.expiresAt &&
            ` • Expires: ${new Date(token.expiresAt).toLocaleDateString()}`}
        </div>
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
            <RiDeleteBinLine className="mr-2 size-4" />
          )}
          Revoke
        </Button>
      </div>
    </div>
  );
}
