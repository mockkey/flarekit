import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@flarekit/ui/components/ui/avatar";
import type { User } from "better-auth";

interface AvatarUserProps {
  user: User;
}

export default function AvatarUser({ user }: AvatarUserProps) {
  return (
    <Avatar className="size-8/12">
      <AvatarImage
        src={user?.image || ""}
        alt="Avatar preview"
        className="size-full object-cover"
      />
      <AvatarFallback className="size-full">
        {user?.name.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}
