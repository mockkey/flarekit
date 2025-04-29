import { useAuth } from "@flarekit/auth/lib/auth-provider";
import { Button } from "@flarekit/ui/components/ui/button";
import { Input } from "@flarekit/ui/components/ui/input";
import { Skeleton } from "@flarekit/ui/components/ui/skeleton";
import { RiUploadCloud2Line } from "@remixicon/react";
import type { User } from "better-auth";
import { useRef, useTransition } from "react";
import { toast } from "sonner";
import AvatarUser from "../avatar-user";

interface UpdateAvatarCellProps {
  isPending?: boolean;
}

const size = 2 * 1024 * 1024; // 2MB
const fileTypes = ["image/jpeg", "image/png", "image/gif"];

async function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      image.src = e.target?.result as string;
    };

    image.onload = () => resolve(image);
    image.onerror = (err) => reject(err);

    reader.readAsDataURL(file);
  });
}

async function resizeAndCropImage(
  file: File,
  name: string,
  size: number,
  avatarExtension: string,
): Promise<File> {
  const image = await loadImage(file);

  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;

  const ctx = canvas.getContext("2d");

  const minEdge = Math.min(image.width, image.height);

  const sx = (image.width - minEdge) / 2;
  const sy = (image.height - minEdge) / 2;
  const sWidth = minEdge;
  const sHeight = minEdge;

  ctx?.drawImage(image, sx, sy, sWidth, sHeight, 0, 0, size, size);

  const resizedImageBlob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, `image/${avatarExtension}`),
  );

  return new File(
    [resizedImageBlob as BlobPart],
    `${name}.${avatarExtension}`,
    {
      type: `image/${avatarExtension}`,
    },
  );
}

export default function UpdateAvatarCell({
  isPending: externalIsPending,
}: UpdateAvatarCellProps) {
  const uploadFileRef = useRef<HTMLInputElement>(null);
  const {
    hooks: { useSession },
    mutators: { updateUser },
    uploadAvatar,
  } = useAuth();
  const { data: sessionData, isPending: sessionPending } = useSession();
  const isPending = sessionPending || externalIsPending;
  const [uploading, startTransition] = useTransition();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    startTransition(async () => {
      const files = e.target.files;
      if (!files || !sessionData?.session) {
        return;
      }
      const file = files[0];
      const isValidFile =
        file && fileTypes.includes(file.type) && file.size <= size;
      if (!isValidFile) {
        toast.error("Invalid file type or size. Please select a valid image.");
        uploadFileRef.current!.value = "";
        return;
      }

      const resizedFile = await resizeAndCropImage(
        file,
        sessionData.user.id,
        256,
        "png",
      );

      if (uploadAvatar) {
        const image = await uploadAvatar(resizedFile);
        if (image) {
          await updateUser({
            image,
          });
          toast.success("updated successfully");
        } else {
          toast.error("Failed to update avatar.");
        }
      }
      uploadFileRef.current!.value = "";
    });
  };
  const handleUpload = () => {
    uploadFileRef.current?.click();
  };

  return (
    <>
      {isPending ? (
        <div className="space-y-4">
          <Skeleton className="aspect-square" />
          <div className="space-y-2 flex flex-col">
            <Skeleton className="w-full h-6" />
            <Skeleton className="w-3/4 h-4 self-center" />
          </div>
        </div>
      ) : (
        <div className="w-full space-y-4">
          <div className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center relative overflow-hidden">
            <AvatarUser user={sessionData?.user as User} />
          </div>
          <div className="space-y-2">
            <Input
              type="file"
              className="hidden"
              accept="image/*"
              name="avatar"
              ref={uploadFileRef}
              multiple={false}
              onChange={handleAvatarChange}
            />
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={handleUpload}
              type="button"
              disabled={uploading}
            >
              <RiUploadCloud2Line className="size-4" />
              Change Photo
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              JPG, GIF or PNG. Max size 2MB.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
