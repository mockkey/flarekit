// server/index.ts
import { Hono } from "hono";
import type { HonoEnv } from "load-context";
import api from "./api";
import rpc from "./routes";

const app = new Hono<HonoEnv>();

app.route("/rpc", rpc);

app.route("/admin/api", api);

export default app;
