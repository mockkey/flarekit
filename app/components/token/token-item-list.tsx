import { useEffect, useState, useTransition } from "react";
import { authClient } from "~/features/auth/client/auth";
import TokenItem, { Token } from "./token-item";
import { toast } from "sonner";
import { TokenItemSkeleton } from "./token-item-skeleton";

export default function TokenItemList() {
  const [apiKeys, setApiKeys] = useState<Token[]>([]);
  const [isPending, startTransition] = useTransition();
  useEffect(() => {
    startTransition(async () => {
      const { data: apiKeys, error } = await authClient.apiKey.list();
      if (error?.message) {
        toast.error(error?.message);
      }
      if (apiKeys) {
        setApiKeys(apiKeys);
      }
      return;
    });
  }, []);

  if (isPending) {
    return <TokenItemSkeleton />;
  }

  if (!apiKeys.length && !isPending) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No API tokens created yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {apiKeys.map((token: any) => (
        <TokenItem key={token.id} token={token} />
      ))}
    </div>
  );
}
