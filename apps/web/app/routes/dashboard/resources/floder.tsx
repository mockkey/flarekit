import { Dashboard as FileDashboard } from "@flarekit/file-manager";
import type { Route } from "./+types/floder";

export default function Dashboard({ params }: Route.ComponentProps) {
  return <FileDashboard folderID={params.floder} rootPath="/resources" />;
}
