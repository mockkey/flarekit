import { eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "../schema";

type Theme = "light" | "dark" | "system";

export class AppearanceDBService {
  constructor(private db: DrizzleD1Database<typeof schema>) {
    this.db = db;
  }
  async setTheme(userId: string, theme: Theme) {
    return this.db
      .insert(schema.appearance)
      .values({
        userId,
        theme,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: schema.appearance.userId,
        set: {
          theme,
          updatedAt: new Date(),
        },
      })
      .returning()
      .get();
  }

  async getTheme(userId: string) {
    return this.db
      .select()
      .from(schema.appearance)
      .where(eq(schema.appearance.userId, userId))
      .get();
  }
}
