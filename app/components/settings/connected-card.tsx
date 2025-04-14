import { Button } from "@flarekit/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@flarekit/ui/components/ui/card";
import { RiGithubFill } from "@remixicon/react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { authClient } from "~/features/auth/client/auth";

const provider = ["github"] as const;

type Provider = (typeof provider)[number];

interface ConnectedItem {
  accountId?: string;
  createdAt?: string;
  id?: string;
  provider?: Provider;
  updatedAt?: string;
  isConnected: boolean;
  icon: React.ElementType;
}

export default function ConnectedCard() {
  const [isPending, startTransition] = useTransition();
  const [connectedList, setConnectedList] = useState<ConnectedItem[]>([
    {
      provider: "github",
      isConnected: false,
      icon: RiGithubFill,
      id: "1",
    },
  ]);

  const unlinkHandle = async (item: ConnectedItem) => {
    startTransition(async () => {
      const { data, error } = await authClient.unlinkAccount({
        providerId: item.provider as string,
        accountId: item.accountId,
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("success");
      return;
    });
  };

  const connectHandle = async (item: ConnectedItem) => {
    startTransition(async () => {
      const { data } = await authClient.linkSocial({
        provider: "github",
        callbackURL: "/settings",
      });
      console.log("data", data);
      return;
    });
  };

  const getlistAccounts = async () => {
    const { data } = await authClient.listAccounts();
    const tempConnectedList: ConnectedItem[] = [];
    connectedList.forEach((connecteditem) => {
      let isset = false;
      data?.forEach((item) => {
        if (item.provider == connecteditem.provider) {
          isset = true;
          connecteditem.id = item.id;
          connecteditem.accountId = item.accountId;
        }
      });
      tempConnectedList.push({
        ...connecteditem,
        isConnected: isset,
      });
    });
    setConnectedList(tempConnectedList);
  };

  useEffect(() => {
    getlistAccounts();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected Accounts</CardTitle>
        <CardDescription>Manage your connected accounts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {connectedList.map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RiGithubFill className="size-6" />
              <div>
                <p className="font-medium">
                  {item.provider?.toLocaleUpperCase()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Access with {item.provider?.toLocaleUpperCase()} account
                </p>
              </div>
            </div>
            {item.isConnected ? (
              <Button
                disabled={isPending}
                variant="destructive"
                onClick={() => {
                  unlinkHandle(item);
                }}
              >
                Disconnect
              </Button>
            ) : (
              <Button
                variant="outline"
                disabled={isPending}
                onClick={() => {
                  connectHandle(item);
                }}
              >
                Connect
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
