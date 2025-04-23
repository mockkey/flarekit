import { createThemeAction } from "remix-themes";
import { themeSessionResolver } from "../server.session";

export const action = createThemeAction(themeSessionResolver);
