import { Hono } from "hono";
import { AppError } from "server/lib/error";
import filesApi from "./files";
import storageApi from "./storage";
import trashApi from "./trash";
import uploadApi from "./upload";

const api = new Hono();

api.route("/file/upload", uploadApi);
api.route("/files/trash", trashApi);
api.route("/files", filesApi);
api.route("/storage", storageApi);

api.onError((err, c) => {
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

export default api;
