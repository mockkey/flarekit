import { Dashboard as FileDashboard } from "@flarekit/file-manager";
import { useTheme } from "remix-themes";

export default function Dashboard() {
  const [theme] = useTheme();
  return <FileDashboard theme={theme !== null ? theme : "auto"} />;
}
