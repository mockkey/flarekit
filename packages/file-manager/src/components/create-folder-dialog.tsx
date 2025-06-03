import { useCreateFolder } from "@/hooks/use-file-manager";
import { useFileStore } from "@/store/use-file-store";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@flarekit/ui/components/ui/alert-dialog";
import { Input } from "@flarekit/ui/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateFolderDialog({
  open,
  onOpenChange,
}: CreateFolderDialogProps) {
  const [folderName, setFolderName] = useState("");
  const createFolder = useCreateFolder();
  const { currentFolderId } = useFileStore();

  const handleCreateFolder = () => {
    if (folderName.trim()) {
      createFolder.mutate(
        { name: folderName, parentId: currentFolderId },
        {
          onSuccess: () => {
            toast.success("Folder created successfully");
            setFolderName("");
            onOpenChange(false);
          },
          onError: (error) => {
            toast.error(error.message);
          },
        },
      );
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Create Folder</AlertDialogTitle>
          <AlertDialogDescription>
            Enter a name for the new folder.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            type="text"
            placeholder="Folder name"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCreateFolder}
            disabled={!folderName.trim()}
          >
            Create
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
