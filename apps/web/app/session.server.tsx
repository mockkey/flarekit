import type { User } from "better-auth";
import {
  type LoaderFunctionArgs,
  createCookieSessionStorage,
} from "react-router";
import { createThemeSessionResolver } from "remix-themes";
import { serverAuth } from "./features/auth/server/auth.server";

export const themeSessionResolver = createThemeSessionResolver(
  createCookieSessionStorage({
    cookie: {
      name: "__remix-themes",
      // domain: 'remix.run',
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secrets: ["s3cr3t"],
      // secure: true,
    },
  }),
);

type ExtendedUser = User & {
  theme: string;
};

export const getTheme = async ({ request }: LoaderFunctionArgs) => {
  try {
    const auth = serverAuth();
    const data = await auth.api.getSession({
      headers: request.headers,
    });
    const user = data?.user as ExtendedUser;
    if (user) {
      return user.theme;
    }
    const { getTheme } = await themeSessionResolver(request);
    return getTheme();
  } catch {
    return "system";
  }
};
