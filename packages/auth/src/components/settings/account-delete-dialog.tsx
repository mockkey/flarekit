import { useAuth } from "@flarekit/auth/hooks/use-auth";
import type { FormState } from "@flarekit/auth/types/from";
import { Spinner } from "@flarekit/ui/components/spinner";
import { Button } from "@flarekit/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@flarekit/ui/components/ui/dialog";
import { useActionState } from "react";
import { toast } from "sonner";
import { InputField } from "../input-field";

interface AccountDeleteDialogProps {
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
  email: string;
}

export default function AccountDeleteDialog({
  showDialog,
  setShowDialog,
  email,
}: AccountDeleteDialogProps) {
  const { authClient, navigate } = useAuth();

  const deleteAction = async (_: FormState, formData: FormData) => {
    const inputEmail = formData.get("email");
    if (inputEmail === email) {
      authClient?.deleteUser({
        callbackURL: "/auth/sign-in",
      });
      navigate("/auth/sign-in");
      return { success: false };
    }
    toast.error("Email does not match. Please try again.");
    return {
      success: false,
    };
  };

  const [_state, submitAction, isSubmitting] = useActionState(deleteAction, {
    success: true,
  });
  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {/* <RiAlertLine className="size-5 text-destructive" /> */}
            Delete Account
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
        <form action={submitAction} className="space-y-4">
          <InputField
            label="Confirm by typing your email"
            name="email"
            type="email"
            placeholder={email}
            disabled={isSubmitting}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Spinner className="size-4" />
                  <span>Deleting...</span>
                </div>
              ) : (
                "Delete Account"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
