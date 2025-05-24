import handle from "hono-react-router-adapter/cloudflare-workers";
import { getLoadContext } from "./load-context";
import app from "./server";

export default handle(() => import("virtual:react-router/server-build"), app, {
  getLoadContext,
});
