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
import { InputField } from "../input-field";

interface AccountDeleteDialogProps {
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
  email: string;
}

interface FormState {
  success: boolean;
  fields?: Record<string, string>;
  errors?: Record<string, string[]>;
}

export default function AccountDeleteDialog({
  showDialog,
  setShowDialog,
  email,
}: AccountDeleteDialogProps) {
  const [state, submitAction, isSubmitting] = useActionState(
    async (previousState: FormState, formData: FormData) => {
      const email = formData.get("email");
      console.log("email");
      console.log("previousState", previousState, email);

      return { success: false };
    },
    { success: false },
  );

  console.log("error", state);

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
            // ref={email}
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
