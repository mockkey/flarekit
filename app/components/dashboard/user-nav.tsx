import { Avatar, AvatarFallback, AvatarImage } from '@flarekit/ui/components/ui/avatar'
import { Button } from '@flarekit/ui/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@flarekit/ui/components/ui/dropdown-menu'
import { RiLogoutCircleLine, RiSettings4Line, RiUser3Line } from '@remixicon/react'
import { type User } from 'better-auth'

interface UserNavProps {
    user:User
}

export default function UserNav({user}:UserNavProps) {
  return (
    <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button 
        variant="ghost" 
        className="relative h-10 w-10 rounded-full"
      >
        <Avatar>
          <AvatarImage src={user.image || ''} />
          <AvatarFallback>
            {user.name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-56" align="end" forceMount>
      <DropdownMenuLabel className="font-normal">
        <div className="flex flex-col space-y-1">
          <p className="text-sm font-medium">
            {user.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {user.email}
          </p>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem>
          <RiUser3Line className="mr-2 size-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem>
          <RiSettings4Line className="mr-2 size-4" />
          Settings
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem className="text-red-600 dark:text-red-400">
        <RiLogoutCircleLine className="mr-2 size-4" />
        Log out
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
  )
}
