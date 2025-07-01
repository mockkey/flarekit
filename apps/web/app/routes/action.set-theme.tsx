import type { ActionFunctionArgs } from "react-router";
import { createThemeAction } from "remix-themes";
import { SettingService } from "server/services/setting-service";
import { z } from "zod";
import { serverAuth } from "~/features/auth/server/auth.server";
import { themeSessionResolver } from "../session.server";

export const themeSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).nullable(),
});

export const action = async (args: ActionFunctionArgs) => {
  const themeAction = createThemeAction(themeSessionResolver);
  const req = args.request.clone();
  const postData = await req.json();
  const parsed = themeSchema.safeParse(postData);
  if (parsed.data) {
    const auth = serverAuth();
    const Session = await auth.api.getSession({
      headers: req.headers,
    });
    if (Session) {
      const theme = parsed.data.theme;
      await SettingService.setTheme(Session.user.id, theme || "system");
      return themeAction(args);
    }
  }
  return false;
};
