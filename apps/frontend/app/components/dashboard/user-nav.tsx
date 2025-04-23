import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@flarekit/ui/components/ui/avatar";
import { Button } from "@flarekit/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@flarekit/ui/components/ui/dropdown-menu";
import {
  RiLogoutCircleLine,
  RiSettings4Line,
  RiUser3Line,
} from "@remixicon/react";
import { type User } from "better-auth";
import { useTransition } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { authClient } from "~/features/auth/client/auth";

interface UserNavProps {
  user: User;
}

export default function UserNav({ user }: UserNavProps) {
  let navigate = useNavigate();
  const [isPending, startTransition] = useTransition();
  const LogOutHandle = () => {
    startTransition(async () => {
      const { error } = await authClient.signOut();
      if (error) {
        toast.error(error.message);
      }
      navigate("/auth/sign-in");
    });
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar>
            <AvatarImage src={user.image || ""} />
            <AvatarFallback>
              {user.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to="/settings">
              <RiUser3Line className="mr-2 size-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/settings">
              <RiSettings4Line className="mr-2 size-4" />
              Settings
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={LogOutHandle}
          disabled={isPending}
          className="text-red-600 dark:text-red-400"
        >
          <RiLogoutCircleLine className="mr-2 size-4" />
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
