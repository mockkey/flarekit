import { useAuth } from "@flarekit/auth/lib/auth-provider";
import { Button } from "@flarekit/ui/components/ui/button";
import { useState } from "react";
import SettingCard from "../setting-card";
import AccountDeleteDialog from "./account-delete-dialog";

export function AccountDeleteCard() {
  const [showDialog, setShowDialog] = useState(false);
  const { hooks } = useAuth();
  const res = hooks?.useSession();
  const data = res?.data;
  const isPending = res?.isPending;

  return (
    <>
      <SettingCard
        isPending={isPending}
        variant="destructive"
        title="Delete Account"
        description="Permanently delete your account and all of its contents. This action
          is not reversible."
        instructions="This action cannot be undone. This will permanently delete your"
        action={
          <Button
            variant="destructive"
            onClick={() => {
              setShowDialog(true);
            }}
          >
            Delete Account
          </Button>
        }
      />
      <AccountDeleteDialog
        showDialog={showDialog}
        setShowDialog={setShowDialog}
        email={data?.user?.email!}
      />
    </>
  );
}
