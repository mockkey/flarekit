import { Hono } from "hono";
import { AppError } from "server/lib/error";
import { checkAuth } from "server/middleware/auth";
import { apiKeyServer } from "./api-key";
import { S3Server } from "./file-manage/s3";
import { uploadServer } from "./file-manage/upload";
import { filesServer } from "./files";
import { subscriptionServer } from "./subscription";
import { trashServer } from "./trash";

const rpcServer = new Hono();

rpcServer.use(checkAuth);

rpcServer.route("/files/trash", trashServer);
rpcServer.route("/files", filesServer);
rpcServer.route("/subscription", subscriptionServer);
rpcServer.route("/api-key", apiKeyServer);
rpcServer.route("/upload", uploadServer);
rpcServer.route("/s3", S3Server);

rpcServer.onError((err, c) => {
  console.error("RPC Error:", err);
  if (err instanceof AppError) {
    return c.json(
      {
        success: false,
        error: err.message,
      },
      err.statusCode as 400 | 401 | 403 | 404 | 500,
    );
  }

  if (err instanceof Error) {
    return c.json(
      {
        success: false,
        error: "Internal Server Error",
        message: err.message,
      },
      500,
    );
  }

  return c.json(
    {
      success: false,
      error: "An unknown error occurred",
    },
    500,
  );
});

export default rpcServer;

export type AppType = typeof rpcServer;
