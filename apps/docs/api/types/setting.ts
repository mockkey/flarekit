import { z } from "zod";

export type Theme = "light" | "dark" | "system";

export const themeSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
});
