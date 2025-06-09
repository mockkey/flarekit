import {
  and,
  asc,
  count,
  desc,
  eq,
  inArray,
  isNull,
  like,
  ne,
  sql,
  sum,
} from "drizzle-orm";
import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";

import * as schema from "./schema";
import {
  FileDbService,
  StorageDbService,
  StorageUsageLogsDbService,
  UserDbService,
} from "./services";

declare global {
  interface D1Database {}
}

export function getDb(d1: D1Database): DrizzleD1Database<typeof schema> {
  return drizzle(d1, { schema });
}

export const dbService = (d1: D1Database) => {
  const db = getDb(d1);
  return {
    files: new FileDbService(db),
    users: new UserDbService(db),
    storags: new StorageDbService(db),
    storageUsageLogs: new StorageUsageLogsDbService(db),
    db: db,
  } as const;
};

export type DBService = {
  files: FileDbService;
  users: UserDbService;
  storag: StorageDbService;
  storageUsageLogs: StorageUsageLogsDbService;
};

export { sql, eq, and, inArray, isNull, desc, asc, count, sum, like, ne };
