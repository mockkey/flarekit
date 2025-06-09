// server/index.ts
import { Hono } from "hono";
import type { HonoEnv } from "load-context";
import api from "./api";
import rpc from "./routes";
import { viewerServer } from "./routes/viewer";

const app = new Hono<HonoEnv>();
app.route("/rpc", rpc);
app.route("/viewer", viewerServer);

app.route("/admin/api", api);

export default app;
