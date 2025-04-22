import { Button } from "@flarekit/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@flarekit/ui/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@flarekit/ui/components/ui/dialog";
import { RiAlertLine } from "@remixicon/react";
import { useRef, useState } from "react";
import { Form, useNavigate } from "react-router";
import { toast } from "sonner";
import InputField from "~/features/auth/components/input-filed";
import { useAuth } from "~/features/auth/hooks";
import { Spinner } from "../spinner";
import { authClient } from "~/features/auth/client/auth";

export default function DeleteAccount() {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const email = useRef<HTMLInputElement>(null);
  const user = useAuth();
  const navigate = useNavigate();
  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfirming(true);
    if (email.current?.value !== user.user.email) {
      toast.error("Email does not match. Please try again.");
      setConfirming(false);
      return;
    }
    try {
      const { error } = await authClient.deleteUser();
      if (error) {
        toast.error("Failed to delete account");
        return;
      }
      toast.success("Account deleted successfully");
      navigate("/auth/sign-in");
    } catch (error) {
      toast.error("Failed to delete account");
    } finally {
      setConfirming(false);
      setOpen(false);
    }
  };

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">Delete Account</CardTitle>
        <CardDescription>
          Permanently delete your account and all of its contents. This action
          is not reversible.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive">Delete Account</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RiAlertLine className="size-5 text-destructive" />
                Delete Account
              </DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </DialogDescription>
            </DialogHeader>
            <Form onSubmit={handleDelete} className="space-y-4">
              <InputField
                ref={email}
                label="Confirm by typing your email"
                name="email"
                type="email"
                placeholder={user.user.email}
                disabled={confirming}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={confirming}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={confirming}
                >
                  {confirming ? (
                    <div className="flex items-center gap-2">
                      <Spinner className="size-4" />
                      <span>Deleting...</span>
                    </div>
                  ) : (
                    "Delete Account"
                  )}
                </Button>
              </DialogFooter>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
