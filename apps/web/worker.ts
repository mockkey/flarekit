import { createRequestHandler } from "react-router";
import app from "./server";

app.use(async (c) => {
  // @ts-expect-error - virtual module provided by React Router at build time
  const build = await import("virtual:react-router/server-build");
  const handler = createRequestHandler(build, import.meta.env.MODE);
  const result = await handler(c.req.raw);
  return result;
});

export default app;
