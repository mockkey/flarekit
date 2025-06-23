import { Dashboard as FileDashboard } from "@flarekit/file-manager";
import { useTheme } from "remix-themes";
import type { Route } from "./+types/floder";

export default function Dashboard({ params }: Route.ComponentProps) {
  const [theme] = useTheme();
  return (
    <FileDashboard
      folderID={params.floder}
      rootPath="/resources"
      theme={theme !== null ? theme : "auto"}
    />
  );
}
