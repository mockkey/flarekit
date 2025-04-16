import { Suspense, useEffect, useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@flarekit/ui/components/ui/card";
import { Badge } from "@flarekit/ui/components/ui/badge";
import { Button } from "@flarekit/ui/components/ui/button";
import { RiAddLine, RiClipboardLine, RiDeleteBinLine } from "@remixicon/react";
import { toast } from "sonner";
import { Spinner } from "~/components/spinner";
import InputField from "~/features/auth/components/input-filed";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@flarekit/ui/components/ui/select";
import { Textarea } from "@flarekit/ui/components/ui/textarea";
import { Label } from "@flarekit/ui/components/ui/label";
import { CreateTokenDialog } from "~/components/token/create-token-dialog";
import { authClient } from "~/features/auth/client/auth";
import TokenItem, { Token } from "~/components/token/token-item";
import { TokenItemSkeleton } from "~/components/token/token-item-skeleton";
import TokenItemList from "~/components/token/token-item-list";
import { Outlet } from "react-router";


const expirationOptions = [
  { value: "never", label: "Never" },
  { value: "3600", label: "1 hour", seconds: 3600 },
  { value: "86400", label: "24 hours", seconds: 86400 },
  { value: "604800", label: "7 days", seconds: 604800 },
  { value: "2592000", label: "30 days", seconds: 2592000 },
  { value: "7776000", label: "90 days", seconds: 7776000 },
];




export default function ApiTokens() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [tokens, setTokens] = useState<Token[]>([]);


  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Token copied to clipboard");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>API Tokens</CardTitle>
              <CardDescription>
                Manage your API tokens for accessing the API
              </CardDescription>
            </div>
            <Button  onClick={() => setShowCreateDialog(true)}>
              <RiAddLine className="mr-2 size-4" />
              Create Token
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <TokenItemList 
            onTokenRemove={(tokenId) => {
              setTokens(prev => prev.filter(t => t.id !== tokenId));
            }} 
          />
        </CardContent>
      </Card>

      <CreateTokenDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onTokenCreated={(newToken) => {
          setTokens(prev => [...prev, newToken]);
        }}
      />
    </div>
  );
}
