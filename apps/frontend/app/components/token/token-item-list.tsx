import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { authClient } from "~/features/auth/client/auth";
import TokenItem, { type Token } from "./token-item";
import { TokenItemSkeleton } from "./token-item-skeleton";

interface TokenListProps {
  onTokenRemove?: (tokenId: string) => void;
}

export default function TokenItemList({ onTokenRemove }: TokenListProps) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const { data: apiKeys, error } = await authClient.apiKey.list();
      if (error?.message) {
        toast.error(error?.message);
      }
      if (apiKeys) {
        setTokens(apiKeys);
      }
    });
  }, []);

  if (isPending) {
    return (
      <div className="max-h-[600px] overflow-y-auto pr-2">
        <TokenItemSkeleton />
      </div>
    );
  }

  if (!tokens.length && !isPending) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No API tokens created yet
      </div>
    );
  }

  return (
    <div className="max-h-[600px] overflow-y-auto space-y-4 pr-2">
      {tokens.map((token: any) => (
        <TokenItem key={token.id} token={token} />
      ))}
    </div>
  );
}
