import { Hono } from "hono";
import type { HonoEnv } from "load-context";
import { validatePermissions } from "~/config/permissions";
import { serverAuth } from "~/features/auth/server/auth.server";

export const apiKeyServer = new Hono<HonoEnv>();

apiKeyServer.post("create", async (c) => {
  const auth = serverAuth();
  const user = c.get("user");
  if (user) {
    const jsonData = await c.req.json();
    const jsonObj = JSON.parse(jsonData);
    const reqPermissions = jsonObj.permissions;
    const reqName = jsonObj.name || "test";
    const reqExpiresIn = jsonObj.expiresIn || null;
    const validationResult = validatePermissions(reqPermissions);
    if (!validationResult.valid) {
      console.error(validationResult.error);
      if (validationResult.invalidPermissions) {
        console.error(
          "Invalid permissions:",
          validationResult.invalidPermissions,
        );
      }
      console.error("Invalid permissions");
    }
    const validatedPermissions = validationResult.permissions;

    // @ts-ignore
    const token = await auth.api.createApiKey({
      body: {
        name: reqName,
        expiresIn: reqExpiresIn,
        prefix: "fk_",
        remaining: 10000,
        refillAmount: 10000,
        refillInterval: 60 * 60 * 24 * 7, // 7 days
        rateLimitTimeWindow: 1000 * 60 * 60 * 24, // everyday
        rateLimitMax: 10000, // every day, they can use up to 100 requests
        rateLimitEnabled: true,
        userId: user.id, // the user id to create the API key for
        permissions: validatedPermissions,
      },
    });
    return c.json(token);
  }
});
