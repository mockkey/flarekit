import { createId } from "@paralleldrive/cuid2";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "boolean" }).notNull(),
  image: text("image"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  stripeCustomerId: text("stripeCustomerId"),
});

export const appearance = sqliteTable("appearance", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  userId: text("userId")
    .notNull()
    .unique()
    .references(() => user.id),
  theme: text("theme"),
  language: text("language"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const session = sqliteTable("session", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  token: text("token").notNull().unique(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const account = sqliteTable("account", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  accessTokenExpiresAt: integer("accessTokenExpiresAt", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refreshTokenExpiresAt", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  idToken: text("idToken"),
  password: text("password"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }),
  updatedAt: integer("updatedAt", { mode: "timestamp" }),
});

export const subscription = sqliteTable("subscription", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  plan: text("plan").notNull(),
  referenceId: text("referenceId").notNull(),
  stripeCustomerId: text("stripeCustomerId"),
  stripeSubscriptionId: text("stripeSubscriptionId"),
  status: text("status").notNull(),
  periodStart: integer("periodStart", { mode: "timestamp" }),
  periodEnd: integer("periodEnd", { mode: "timestamp" }),
  cancelAtPeriodEnd: integer("cancelAtPeriodEnd", { mode: "boolean" }),
  seats: integer("seats"),
  trialStart: integer("trialStart", { mode: "timestamp" }),
  trialEnd: integer("trialEnd", { mode: "timestamp" }),
  createdAt: integer("createdAt", { mode: "timestamp" }),
  updatedAt: integer("updatedAt", { mode: "timestamp" }),
});

export const apikey = sqliteTable("apikey", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  name: text("name"),
  start: text("start"),
  prefix: text("prefix"),
  key: text("key").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  refillInterval: integer("refillInterval"),
  refillAmount: integer("refillAmount"),
  lastRefillAt: integer("lastRefillAt", { mode: "timestamp" }),
  enabled: integer("enabled", { mode: "boolean" }).notNull(),
  rateLimitEnabled: integer("rateLimitEnabled", { mode: "boolean" }).notNull(),
  rateLimitTimeWindow: integer("rateLimitTimeWindow"),
  rateLimitMax: integer("rateLimitMax"),
  requestCount: integer("requestCount").notNull(),
  remaining: integer("remaining"),
  lastRequest: integer("lastRequest", { mode: "timestamp" }),
  expiresAt: integer("expiresAt", { mode: "timestamp" }),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  permissions: text("permissions"),
  metadata: text("metadata"),
});

//file manager
export const file = sqliteTable("files", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  hash: text("hash"),
  name: text("name"),
  size: integer("size"),
  mime: text("mime"),
  storagePath: text("storagePath"),
  storageProvider: text("storageProvider")
    .notNull()
    .$default(() => "s3"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
});

export const fileThumbnail = sqliteTable("file_thumbnail", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  fileId: text("fileId")
    .notNull()
    .references(() => file.id),
  variant: text("variant").notNull(), // 'small', 'medium', 'small@2x'
  storagePath: text("storagePath").notNull(),
  mime: text("mime"),
  size: integer("size"),
  width: integer("width"),
  height: integer("height"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
});

export const userFiles = sqliteTable("user_files", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  fileId: text("fileId")
    .notNull()
    .references(() => file.id),
  parentId: text("parentId"),
  name: text("name"),
  isDir: integer("isDir", { mode: "boolean" }).default(false),
  deletedAt: integer("deletedAt", { mode: "timestamp" }),
  createdAt: integer("createdAt", { mode: "timestamp" }),
  isLatestVersion: integer("isLatestVersion", { mode: "boolean" }).default(
    true,
  ),
});

export const share = sqliteTable("share", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  userFileId: text("userFileId")
    .notNull()
    .references(() => userFiles.id),
  expiresAt: integer("deletedAt", { mode: "timestamp" }),
  createdAt: integer("createdAt", { mode: "timestamp" }),
});

export const usageLog = sqliteTable("usageLog", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  fileId: text("fileId")
    .notNull()
    .references(() => file.id),
  action: text("action"), // upload / delete / restore
  size: integer("size"),
  createdAt: integer("createdAt", { mode: "timestamp" }),
});

export const storageUsageLogs = sqliteTable("storage_usage_logs", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  fileId: text("fileId").notNull(),
  action: text("action").notNull(),
  oldUsage: integer("oldUsage"),
  newUsage: integer("newUsage"),
  size: integer("size").notNull(),
  metadata: text("metadata"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
});

export const userStorage = sqliteTable("userStorage", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  planId: text("planId"),
  storage: integer("storage").notNull(),
  usedStorage: integer("usedStorage").notNull().default(0),
  status: text("status").notNull().default("active"),
  orderId: text("orderId"),
  metadata: text("metadata"),
  updatedAt: integer("updatedAt", { mode: "timestamp" }),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
});

export type User = typeof user.$inferSelect;
export type Session = typeof session.$inferInsert;
export type Account = typeof account.$inferSelect;
export type Verification = typeof verification.$inferInsert;
export type Subscription = typeof subscription.$inferSelect;
export type Apikey = typeof apikey.$inferInsert;
export type File = typeof file.$inferSelect;
export type FileThumbnail = typeof fileThumbnail.$inferInsert;
export type UserFiles = typeof userFiles.$inferSelect;
export type Share = typeof share.$inferInsert;
export type UsageLog = typeof usageLog.$inferSelect;
export type StorageUsageLogs = typeof storageUsageLogs.$inferInsert;
export type UserStorage = typeof userStorage.$inferInsert;
