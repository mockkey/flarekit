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
  AppearanceDBService,
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

let _dbService: DBService;

export const DbService = (d1: D1Database) => {
  if (_dbService) {
    return _dbService;
  }
  if (!_dbService) {
    const db = getDb(d1);
    _dbService = {
      files: new FileDbService(db),
      users: new UserDbService(db),
      storag: new StorageDbService(db),
      storageUsageLogs: new StorageUsageLogsDbService(db),
      appearances: new AppearanceDBService(db),
    };
    return _dbService;
  }
};

export type DBService = {
  files: FileDbService;
  users: UserDbService;
  storag: StorageDbService;
  storageUsageLogs: StorageUsageLogsDbService;
  appearances: AppearanceDBService;
};

export { sql, eq, and, inArray, isNull, desc, asc, count, sum, like, ne };
