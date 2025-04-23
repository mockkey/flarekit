import { Button } from "@flarekit/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@flarekit/ui/components/ui/card";
import { RiAddLine } from "@remixicon/react";
import { useState } from "react";
import { CreateTokenDialog } from "~/components/token/create-token-dialog";
import TokenItemList from "~/components/token/token-item-list";

export default function ApiTokens() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

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
            <Button onClick={() => setShowCreateDialog(true)}>
              <RiAddLine className="mr-2 size-4" />
              Create Token
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <TokenItemList />
        </CardContent>
      </Card>

      <CreateTokenDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}
