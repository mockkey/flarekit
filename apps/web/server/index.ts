// server/index.ts
import { Hono } from "hono";
import type { HonoEnv } from "load-context";
import api from "./api";
import apidoc from "./docs/api/openapi";
import rpc from "./routes";
import { viewerServer } from "./routes/viewer";

const app = new Hono<HonoEnv>();
app.route("/doc", apidoc);
app.route("/viewer", viewerServer);
app.route("/api/v1", api);
app.route("/rpc", rpc);

export default app;
