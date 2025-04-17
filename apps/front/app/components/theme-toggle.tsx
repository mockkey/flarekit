import { Button } from '@flarekit/ui/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@flarekit/ui/components/ui/dropdown-menu'
import { Laptop, Moon, Sun } from 'lucide-react'
import {  Theme ,useTheme } from 'remix-themes';


const themeIcons = {
    light: <Sun />,
    dark:  <Moon />,
    system: <Laptop />
} as const

const themes = [
    {
        name: "Light",
        value: "light" as Theme,
        icon: themeIcons.light,
    },
    {
        name: "Dark",
        value: "dark" as Theme,
        icon: themeIcons.dark,
    },
] as const

export default function ThemeToggle() {
  const [, setTheme] = useTheme()


  return (
    <DropdownMenu>
        <DropdownMenuTrigger asChild >
            <Button variant={"ghost"} >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48 p-2 bg-white/80 dark:bg-black/80 border border-gray-300 rounded-lg shadow-md">
            {themes.map((theme) => (
                <DropdownMenuItem key={theme.value} className="p-2 text-sm  hover:bg-gray-100" onClick={() => setTheme(theme.value)}>
                    {theme.icon}
                    <span className="ml-2">{theme.name}</span>
                </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
    </DropdownMenu>
  )
}
