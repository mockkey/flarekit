import { createRequestHandler } from "react-router";
import { setThumbnailFileId } from "server/routes/viewer";
import app from "./server";

app.use(async (c) => {
  // @ts-expect-error - virtual module provided by React Router at build time
  const build = await import("virtual:react-router/server-build");
  const handler = createRequestHandler(build, import.meta.env.MODE);
  const result = await handler(c.req.raw);
  return result;
});

export default {
  fetch: app.fetch,
  queue: async (batch: MessageBatch) => {
    switch (batch.queue) {
      case "thumbnails":
        await thumbnailHandler(batch);
        break;
      default:
        console.log("default");
        break;
    }
  },
};

const thumbnailHandler = async (batch: MessageBatch) => {
  for (const message of batch.messages) {
    const body = message.body as { fileId: string; userId: string };
    const { fileId, userId } = body;
    await setThumbnailFileId(fileId);
  }
};
