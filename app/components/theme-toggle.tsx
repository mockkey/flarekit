import { Button } from '@flarekit/ui/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@flarekit/ui/components/ui/dropdown-menu'
import { Laptop, Moon, Sun } from 'lucide-react'


const themeIcons = {
    light: <Sun />,
    dark:  <Moon />,
    system: <Laptop />
} as const

export default function ThemeToggle() {
  return (
    <DropdownMenu>
        <DropdownMenuTrigger asChild >
            <Button variant={"ghost"} >
                <span className="text-sm">Select Theme</span>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48 p-2 bg-white border border-gray-300 rounded-lg shadow-md">
            {themeIcons.}
            <DropdownMenuItem className="p-2 text-sm text-gray-700 hover:bg-gray-100">Light</DropdownMenuItem>
            <DropdownMenuItem className="p-2 text-sm text-gray-700 hover:bg-gray-100">Dark</DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
  )
}
