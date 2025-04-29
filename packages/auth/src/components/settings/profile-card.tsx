import { useAuth } from "@flarekit/auth/lib/auth-provider";
import type { FormState } from "@flarekit/auth/types/from";
import { Spinner } from "@flarekit/ui/components/spinner";
import { Button } from "@flarekit/ui/components/ui/button";
import { Skeleton } from "@flarekit/ui/components/ui/skeleton";
import { useActionState, useRef } from "react";
import { toast } from "sonner";
import { InputField } from "../input-field";
import SettingCard from "../setting-card";
import UpdateAvatarCell from "./update-avatar-cell";

interface ProfileCardProps {
  title?: string;
  description?: string;
  instructions?: string;
}

export function ProfileCard({
  title = "Avatar",
  description = "Click on the avatar to upload a custom one from your files.",
  instructions = "Please use 32 characters at maximum.",
}: ProfileCardProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const {
    hooks: { useSession },
    mutators: { updateUser },
  } = useAuth();
  const { data: sessionData, isPending: sessionPending } = useSession();
  const updataName = async (_: FormState, formData: FormData) => {
    const newName = formData.get("name") as string;
    if (newName === "") {
      toast.error("Name is not valid!");
      return {
        success: true,
      };
    }
    if (sessionData?.user.name === newName) {
      return {
        fields: {
          name: newName,
        },
        errors: {
          name: ["Name is the same as before"],
        },
        success: false,
      };
    }

    try {
      await updateUser({ name: newName });
      // await refetch?.()
      toast.success("Name updated successfully");
      return { success: true };
    } catch (_error) {
      return { success: false };
    }
  };

  const [actionState, updateNameAction, isPending] = useActionState(
    updataName,
    {
      success: true,
    },
  );

  const handleSubmit = () => {
    if (formRef.current) {
      console.log(formRef.current.requestSubmit());
    }
  };

  return (
    <SettingCard
      title={title}
      description={description}
      isPending={sessionPending}
      instructions={instructions}
      action={
        <Button
          disabled={isPending}
          onClick={() => {
            handleSubmit();
          }}
        >
          {isPending && <Spinner className="size-4" />}
          Save
        </Button>
      }
    >
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left side - Avatar preview and upload */}

        <div className="flex-shrink-0 w-full md:w-[240px]">
          <UpdateAvatarCell />
        </div>
        {/* Right side - Profile form */}
        <div className="flex-1">
          <form className="space-y-4" ref={formRef} action={updateNameAction}>
            {sessionPending ? (
              <div className="flex flex-col space-y-2">
                <Skeleton className="w-12 h-6" />
                <Skeleton className="w-full h-8" />
              </div>
            ) : (
              <InputField
                label="Name"
                name="name"
                placeholder="Your name"
                disabled={isPending}
                errorMessage={actionState?.errors?.name}
                defaultValue={
                  actionState?.fields?.name || sessionData?.user.name
                }
              />
            )}
          </form>
        </div>
      </div>
    </SettingCard>
  );
}
