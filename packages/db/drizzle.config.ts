import { type Config, defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/schema.ts",
  out: "./migrations",
  // driver: "d1-http",
  // verbose: true,
  // strict: true,
}) satisfies Config;
