import { Alert, AlertDescription } from "@flarekit/ui/components/ui/alert";
import { Button } from "@flarekit/ui/components/ui/button";
import { DialogFooter } from "@flarekit/ui/components/ui/dialog";
import { Label } from "@flarekit/ui/components/ui/label";
import { RiClipboardLine, RiErrorWarningLine } from "@remixicon/react";
import { toast } from "sonner";

interface TokenCardProps {
  newToken: string;
  handleClose: () => void;
}

export default function TokenCard({handleClose, newToken }: TokenCardProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Token copied to clipboard");
  };

  return (
    <div className="space-y-4">
      <Alert
        variant="destructive"
        className="bg-yellow-50/50 dark:bg-yellow-900/20"
      >
        <RiErrorWarningLine className="size-4 text-yellow-600 dark:text-yellow-500" />
        <AlertDescription className="text-yellow-600 dark:text-yellow-500">
          Make sure to copy your token now - it won't be shown again!
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label>Your New API Token</Label>
        <div className="relative">
          <div className="p-4 bg-muted rounded-lg break-all font-mono text-sm">
            {newToken}
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="absolute top-2 right-2"
            onClick={() => copyToClipboard(newToken)}
          >
            <RiClipboardLine className="size-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2 rounded-lg bg-muted p-4">
        <h4 className="font-medium">Next steps:</h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li>Copy your token and store it securely</li>
          <li>Use this token in your API requests</li>
          <li>Add it to your environment variables</li>
        </ul>
      </div>

      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={handleClose}>
          Done
        </Button>
        <Button onClick={() => copyToClipboard(newToken)}>
          <RiClipboardLine className="mr-2 size-4" />
          Copy Token
        </Button>
      </DialogFooter>
    </div>
  );
}
