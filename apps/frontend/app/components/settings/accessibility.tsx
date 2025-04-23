import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@flarekit/ui/components/ui/card";
import { Label } from "@flarekit/ui/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@flarekit/ui/components/ui/radio-group";
import { RiComputerLine, RiMoonLine, RiSunLine } from "@remixicon/react";
import { Theme, useTheme } from "remix-themes";

const themes = [
  {
    value: "light",
    label: "Light",
    icon: RiSunLine,
    svg: (
      <svg
        className="size-32 rounded-md overflow-hidden ring-1 ring-gray-200"
        viewBox="0 0 32 32"
      >
        <rect width="32" height="32" fill="white" />
        <rect width="32" height="4" fill="#f8fafc" />
        <rect x="4" y="1" width="12" height="2" fill="#e2e8f0" rx="1" />
        <rect width="8" height="32" fill="#f1f5f9" />
        <circle cx="4" cy="12" r="1.5" fill="#3b82f6" />
        <circle cx="4" cy="18" r="1.5" fill="#94a3b8" />
        <rect x="12" y="8" width="16" height="3" fill="#f1f5f9" rx="1" />
        <rect x="12" y="14" width="12" height="3" fill="#f1f5f9" rx="1" />
      </svg>
    ),
  },
  {
    value: "dark",
    label: "Dark",
    icon: RiMoonLine,
    svg: (
      <svg
        className="size-32 rounded-md overflow-hidden ring-1 ring-gray-800"
        viewBox="0 0 32 32"
      >
        <rect width="32" height="32" fill="#020817" />
        <rect width="32" height="4" fill="#0f172a" />
        <rect x="4" y="1" width="12" height="2" fill="#1e293b" rx="1" />
        <rect width="8" height="32" fill="#0f172a" />
        <circle cx="4" cy="12" r="1.5" fill="#3b82f6" />
        <circle cx="4" cy="18" r="1.5" fill="#475569" />
        <rect x="12" y="8" width="16" height="3" fill="#1e293b" rx="1" />
        <rect x="12" y="14" width="12" height="3" fill="#1e293b" rx="1" />
      </svg>
    ),
  },
  {
    value: "system",
    label: "System",
    icon: RiComputerLine,
    svg: (
      <svg
        className="size-32 rounded-md overflow-hidden ring-1 ring-gray-200 dark:ring-gray-800"
        viewBox="0 0 32 32"
      >
        <defs>
          <clipPath id="leftClip">
            <rect x="0" y="0" width="16" height="32" />
          </clipPath>
          <clipPath id="rightClip">
            <rect x="16" y="0" width="16" height="32" />
          </clipPath>
        </defs>

        <g clipPath="url(#leftClip)">
          <rect width="32" height="32" fill="white" />
          <rect width="32" height="4" fill="#f8fafc" />
          <rect x="4" y="1" width="12" height="2" fill="#e2e8f0" rx="1" />
          <rect width="8" height="32" fill="#f1f5f9" />
          <circle cx="4" cy="12" r="1.5" fill="#3b82f6" />
          <circle cx="4" cy="18" r="1.5" fill="#94a3b8" />
          <rect x="12" y="8" width="16" height="3" fill="#f1f5f9" rx="1" />
          <rect x="12" y="14" width="12" height="3" fill="#f1f5f9" rx="1" />
        </g>

        <g clipPath="url(#rightClip)">
          <rect x="16" width="32" height="32" fill="#020817" />
          <rect x="16" width="32" height="4" fill="#0f172a" />
          <rect x="20" y="1" width="12" height="2" fill="#1e293b" rx="1" />
          <rect x="16" width="8" height="32" fill="#0f172a" />
          <circle cx="20" cy="12" r="1.5" fill="#3b82f6" />
          <circle cx="20" cy="18" r="1.5" fill="#475569" />
          <rect x="28" y="8" width="16" height="3" fill="#1e293b" rx="1" />
          <rect x="28" y="14" width="12" height="3" fill="#1e293b" rx="1" />
        </g>

        <line
          x1="16"
          y1="0"
          x2="16"
          y2="32"
          stroke="currentColor"
          strokeWidth="0.5"
        />
      </svg>
    ),
  },
];

export default function Accessibility() {
  const [theme, setTheme] = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Choose how FlareKit looks on your device. Switch between light and
          dark themes, or sync with your system preferences.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          defaultValue={theme as Theme}
          onValueChange={(value) => {
            const theme = value == "system" ? null : (value as Theme);
            setTheme(theme);
          }}
          className="flex md:flex-row flex-col gap-4"
        >
          {themes.map(({ value, label, icon: Icon, svg }) => (
            <Label
              key={value}
              className={`aspect-square relative flex flex-col items-center gap-6 rounded-lg border-2 border-muted bg-popover p-6 hover:bg-accent hover:text-accent-foreground [&:has(:checked)]:border-primary ${theme === value && "border-primary"}`}
            >
              <RadioGroupItem value={value} className="sr-only" />
              {svg}
              <div className="flex items-center gap-2">
                <Icon className="size-4" />
                <span className="font-medium">{label}</span>
              </div>
            </Label>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
