import { Button } from "@flarekit/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@flarekit/ui/components/ui/card";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@flarekit/ui/components/ui/avatar";
import { RiUploadCloud2Line } from "@remixicon/react";
import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { authClient } from "~/features/auth/client/auth";
import InputField from "~/features/auth/components/input-filed";
import { useAuth } from "~/features/auth/hooks";
import { NameSchema } from "~/features/auth/schemas";
import { Spinner } from "../spinner";

export default function ProfileCard() {
  const user = useAuth();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    user.user.image || null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [username, setUserName] = useState<string>(user.user.name);
  const size = 2 * 1024 * 1024; // 2MB
  const fileTypes = ["image/jpeg", "image/png", "image/gif"];
  const isValidFile =
    avatarFile &&
    fileTypes.includes(avatarFile.type) &&
    avatarFile.size <= size;

  const updataName = async (_, formData: FormData) => {
    const newName = formData.get("name") as string;
    const res = NameSchema.safeParse({ name: newName });
    if (res.error) {
      return { error: res.error.issues[0].message };
    }

    if (newName === username) {
      return { error: "Name is the same as before" };
    }
    const { error } = await authClient.updateUser({ name: newName });

    if (error) {
      setUserName(username);
      return { error: "Failed to update name" };
    }
    setUserName(newName);
    return { message: "Name updated successfully" };
  };

  const [actionState, updateNameAction, isPending] = useActionState(
    updataName,
    null,
  );

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    if (!avatarFile) return;
    if (!isValidFile) {
      toast.error("Invalid file type or size. Please select a valid image.");
      setAvatarFile(null);
      return;
    }
    const url = URL.createObjectURL(avatarFile);
    setPreviewUrl(url);

    const formData = new FormData();
    formData.append("file", avatarFile);
    fetch("/api/upload/avatar", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          toast.error(data.error);
          return;
        }
      });
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  useEffect(() => {
    if (actionState?.message) {
      toast.success(actionState.message);
    }
    if (actionState?.error) {
      toast.error(actionState.error);
    }
  }, [actionState]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Manage your profile image and information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left side - Avatar preview and upload */}
          <div className="flex-shrink-0 w-full md:w-[240px] space-y-4">
            <div className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center relative overflow-hidden">
              <Avatar>
                <AvatarImage
                  src={previewUrl || "/logo.svg"}
                  alt="Avatar preview"
                  className="size-full object-cover"
                />
                <AvatarFallback className="size-full">FK</AvatarFallback>
              </Avatar>
            </div>
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                name="avatar"
                multiple={false}
                onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
              />
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={handleButtonClick}
                type="button"
              >
                <RiUploadCloud2Line className="size-4" />
                Change Photo
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                JPG, GIF or PNG. Max size 2MB.
              </p>
            </div>
          </div>

          {/* Right side - Profile form */}
          <div className="flex-1">
            <form className="space-y-4" action={updateNameAction}>
              <InputField
                label="name"
                name="name"
                placeholder="Your name"
                disabled={isPending}
                defaultValue={username}
              />
              <div className="flex justify-end">
                <Button disabled={isPending}>
                  {isPending ? (
                    <div className="flex items-center justify-center gap-2">
                      <Spinner className="size-4" />
                      <span>Save...</span>
                    </div>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
