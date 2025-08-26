import { env } from "cloudflare:workers";
import { DbService } from "@flarekit/db";
import type { Theme } from "server/types/setting";

const dbService = DbService(env.DB);

export class SettingService {
  static async setTheme(userId: string, theme: Theme) {
    return dbService?.appearances.setTheme(userId, theme);
  }

  static async getTheme(userId: string) {
    return dbService?.appearances.getTheme(userId);
  }
}
