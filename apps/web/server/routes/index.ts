import { Hono } from "hono";
import { checkAuth } from "server/middleware/auth";
import { apiKeyServer } from "./api-key";
import { filesServer } from "./files";
import { subscriptionServer } from "./subscription";

const rpcServer = new Hono();

rpcServer.use(checkAuth);

rpcServer.route("/files", filesServer);
rpcServer.route("/subscription", subscriptionServer);
rpcServer.route("/api-key", apiKeyServer);

export default rpcServer;

export type AppType = typeof rpcServer;
