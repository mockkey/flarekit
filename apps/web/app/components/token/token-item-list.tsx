import { useApiKeyList } from "~/features/auth/hooks/use-api-key";
import TokenItem from "./token-item";
import { TokenItemSkeleton } from "./token-item-skeleton";

export default function TokenItemList() {
  const { data: apiKeys, isPending } = useApiKeyList();

  if (isPending) {
    return (
      <div className="max-h-[600px] overflow-y-auto pr-2">
        <TokenItemSkeleton />
      </div>
    );
  }

  if (!apiKeys?.length && !isPending) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No API tokens created yet
      </div>
    );
  }

  return (
    <div className="max-h-[600px] overflow-y-auto space-y-4 pr-2">
      {apiKeys?.map((token) => (
        <TokenItem key={token?.id} token={token!} />
      ))}
    </div>
  );
}
