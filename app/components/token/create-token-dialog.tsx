import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@flarekit/ui/components/ui/dialog";
import { Button } from "@flarekit/ui/components/ui/button";
import { Label } from "@flarekit/ui/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@flarekit/ui/components/ui/select";
import { RiClipboardLine, RiErrorWarningLine } from "@remixicon/react";
import { Spinner } from "~/components/spinner";
import InputField from "~/features/auth/components/input-filed";
import { toast } from "sonner";
import { useState } from "react";
import { z } from "zod";
import { authClient } from "~/features/auth/client/auth";
import { Alert, AlertDescription } from "@flarekit/ui/components/ui/alert";

const createTokenSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name is too long"),
  expiresIn: z.string(),
});

const expirationOptions = [
  { value: "never", label: "Never" },
  { value: "3600", label: "1 hour" },
  { value: "86400", label: "24 hours" },
  { value: "604800", label: "7 days" },
  { value: "2592000", label: "30 days" },
];

interface CreateTokenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTokenCreated: (token: any) => void;
}

export function CreateTokenDialog({ open, onOpenChange, onTokenCreated }: CreateTokenDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleCreateToken = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    
    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        name: formData.get("name") as string,
        expiresIn: formData.get("expiresIn") as string,
      };


      const validatedData = createTokenSchema.parse(data);
      setIsLoading(true);


      const { data: apiKey, error } = await authClient.apiKey.create({
        name: validatedData.name,
        expiresIn: validatedData.expiresIn === "never" ? null : parseInt(validatedData.expiresIn),
      })
      console.log("apiKey",apiKey,error)
      
      toast.success("Token created successfully");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            newErrors[err.path[0]] = err.message;
          }
        });
        setErrors(newErrors);
      } else {
        toast.error("Failed to create token");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Token copied to clipboard");
  };

  const handleClose = () => {
    setNewToken(null);
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create API Token</DialogTitle>
          <DialogDescription>
            Create a new token to access the API. Make sure to copy your token - you won't be able to see it again!
          </DialogDescription>
        </DialogHeader>

        {newToken ? (
          <div className="space-y-4">
            <Alert  variant="destructive" className="bg-yellow-50/50 dark:bg-yellow-900/20">
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
        ) : (
          <form onSubmit={handleCreateToken} className="space-y-4">
            <InputField
              label="Token Name"
              name="name"
              placeholder="e.g. Development Token"
              error={!!errors.name}
              disabled={isLoading}
              required
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name}</p>
            )}

            <div className="space-y-2">
              <Label>Expiration</Label>
              <Select name="expiresIn" defaultValue="never" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select expiration time" />
                </SelectTrigger>
                <SelectContent>
                  {expirationOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                After expiration, the token will no longer be valid
              </p>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Spinner className="size-4" />
                    <span>Creating...</span>
                  </div>
                ) : (
                  'Create Token'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
