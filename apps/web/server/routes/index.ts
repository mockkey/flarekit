import { Hono } from "hono";
import { checkAuth } from "server/middleware/auth";
import { apiKeyServer } from "./api-key";
import { S3Server } from "./file-manage/s3";
import { uploadServer } from "./file-manage/upload";
import { filesServer } from "./files";
import { subscriptionServer } from "./subscription";

const rpcServer = new Hono();

rpcServer.use(checkAuth);

rpcServer.route("/files", filesServer);
rpcServer.route("/subscription", subscriptionServer);
rpcServer.route("/api-key", apiKeyServer);
rpcServer.route("/upload", uploadServer);
rpcServer.route("/s3", S3Server);

export default rpcServer;

export type AppType = typeof rpcServer;
