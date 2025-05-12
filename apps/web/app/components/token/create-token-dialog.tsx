import { Button } from "@flarekit/ui/components/ui/button";
import { Checkbox } from "@flarekit/ui/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@flarekit/ui/components/ui/dialog";
import { Input } from "@flarekit/ui/components/ui/input";
import { Label } from "@flarekit/ui/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@flarekit/ui/components/ui/select";
import { RiSearchLine } from "@remixicon/react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Spinner } from "~/components/spinner";
import { permissionGroups } from "~/config/permissions";
import InputField from "~/features/auth/components/input-filed";
import { createApiKey } from "~/features/auth/hooks/use-api-key";
import TokenCard from "./token-card";

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
}

export function CreateTokenDialog({
  open,
  onOpenChange,
}: CreateTokenDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [newToken, setNewToken] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const mutation = createApiKey();
  const [selectedPermissions, setSelectedPermissions] = useState<
    Record<string, string[]>
  >({
    files: [],
    users: [],
    admin: [],
  });

  const filteredPermissionGroups = Object.entries(permissionGroups).reduce(
    (acc, [resource, group]) => {
      const filteredPermissions = group.permissions.filter(
        (permission) =>
          permission.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          permission.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          group.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );

      if (filteredPermissions.length > 0) {
        acc[resource] = {
          ...group,
          permissions: filteredPermissions,
        };
      }
      return acc;
    },
    {} as typeof permissionGroups,
  );

  const handlePermissionChange = (resource: string, permission: string) => {
    setSelectedPermissions((current) => ({
      ...current,
      [resource]: current[resource].includes(permission)
        ? current[resource].filter((p) => p !== permission)
        : [...current[resource], permission],
    }));
  };

  const handleCreateToken = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        name: formData.get("name") as string,
        expiresIn: formData.get("expiresIn") as string,
      };

      const validatedData = createTokenSchema.parse(data);

      startTransition(async () => {
        const queryString = JSON.stringify({
          name: validatedData.name,
          expiresIn:
            validatedData.expiresIn === "never"
              ? null
              : Number.parseInt(validatedData.expiresIn),
          permissions: selectedPermissions,
        });

        mutation.mutate(queryString, {
          onSuccess: (data) => {
            setNewToken(data.key);
            toast.success("Token created successfully");
          },
          onError: () => {
            toast.error("Failed to create token. Please try again.");
          },
        });
        return;
      });
    } catch (_error) {
      toast.error("Failed to create token");
    }
  };

  const handleClose = () => {
    setNewToken(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create API Token</DialogTitle>
          <DialogDescription>
            Create a new token to access the API. Make sure to copy your token -
            you won't be able to see it again!
          </DialogDescription>
        </DialogHeader>

        {newToken ? (
          <TokenCard newToken={newToken} handleClose={handleClose} />
        ) : (
          <form onSubmit={handleCreateToken} className="space-y-6">
            <InputField
              label="Token Name"
              name="name"
              placeholder="e.g. Development Token"
              disabled={isPending}
              required
            />
            <div className="space-y-2">
              <Label>Expiration</Label>
              <Select name="expiresIn" defaultValue="never" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select expiration time" />
                </SelectTrigger>
                <SelectContent>
                  {expirationOptions.map((option) => (
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

            <div className="space-y-4 max-h-[300px] overflow-y-auto px-2">
              <div className="sticky top-0 bg-background z-10 pb-4">
                <Label>Permissions</Label>
                <div className="relative mt-2">
                  <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search permissions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="border rounded-lg divide-y">
                {Object.entries(filteredPermissionGroups).length > 0 ? (
                  Object.entries(filteredPermissionGroups).map(
                    ([resource, group]) => (
                      <div key={resource} className="p-4 space-y-3">
                        <div className="space-y-1">
                          <h4 className="font-medium text-sm">{group.name}</h4>
                          {group.description && (
                            <p className="text-xs text-muted-foreground">
                              {group.description}
                            </p>
                          )}
                        </div>
                        <div className="grid gap-3">
                          {group.permissions.map((permission) => (
                            <div
                              key={`${resource}:${permission.id}`}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`${resource}:${permission.id}`}
                                checked={selectedPermissions[
                                  resource
                                ]?.includes(permission.id)}
                                onCheckedChange={() =>
                                  handlePermissionChange(
                                    resource,
                                    permission.id,
                                  )
                                }
                                disabled={isPending}
                              />
                              <div className="grid gap-0.5">
                                <label
                                  htmlFor={`${resource}:${permission.id}`}
                                  className="text-sm leading-none"
                                >
                                  {permission.label}
                                </label>
                                {permission.description && (
                                  <p className="text-xs text-muted-foreground">
                                    {permission.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ),
                  )
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    No permissions found matching "{searchQuery}"
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <div className="flex items-center gap-2">
                    <Spinner className="size-4" />
                    <span>Creating...</span>
                  </div>
                ) : (
                  "Create Token"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
