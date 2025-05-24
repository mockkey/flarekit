import type { User } from "better-auth";
import type { ActionFunctionArgs } from "react-router";
import { createThemeAction } from "remix-themes";
import { serverAuth } from "~/features/auth/server/auth.server";
import { themeSessionResolver } from "../session.server";

// export const themeAction = createThemeAction(themeSessionResolver);

type ExtendedUser = User & {
  theme: string;
};

export const action = async (args: ActionFunctionArgs) => {
  // const { themeSessionResolver } = await import("../session.server");
  const themeAction = createThemeAction(themeSessionResolver);
  const themeSet = [null, "dark", "light"];
  const req = args.request.clone();
  const postData = await req.json();
  const theme = postData.theme;
  if (themeSet.indexOf(theme) >= 0) {
    const auth = serverAuth();
    const data = await auth.api.getSession({
      headers: req.headers,
    });
    if (data) {
      await auth.api.updateUser({
        headers: req.headers,
        method: "POST",
        body: {
          theme: theme,
        } as ExtendedUser,
      });
    }
    if (data) {
      return themeAction(args);
    }
  }
  return false;
};
