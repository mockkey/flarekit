import {
  type LoaderFunctionArgs,
  createCookieSessionStorage,
} from "react-router";
import { createThemeSessionResolver } from "remix-themes";

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

export const getTheme = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { getTheme } = await themeSessionResolver(request);
    return getTheme();
  } catch {
    return "system";
  }
};
