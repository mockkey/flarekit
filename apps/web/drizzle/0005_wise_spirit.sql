PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_storage_usage_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`fileId` text NOT NULL,
	`action` text NOT NULL,
	`old_usage` integer,
	`new_usage` integer,
	`size` integer NOT NULL,
	`metadata` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`fileId`) REFERENCES `files`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_storage_usage_logs`("id", "userId", "fileId", "action", "old_usage", "new_usage", "size", "metadata", "created_at") SELECT "id", "userId", "fileId", "action", "old_usage", "new_usage", "size", "metadata", "created_at" FROM `storage_usage_logs`;--> statement-breakpoint
DROP TABLE `storage_usage_logs`;--> statement-breakpoint
ALTER TABLE `__new_storage_usage_logs` RENAME TO `storage_usage_logs`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_usageLog` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`fileId` text NOT NULL,
	`action` text,
	`size` integer,
	`createdAt` integer,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`fileId`) REFERENCES `files`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_usageLog`("id", "userId", "fileId", "action", "size", "createdAt") SELECT "id", "userId", "fileId", "action", "size", "createdAt" FROM `usageLog`;--> statement-breakpoint
DROP TABLE `usageLog`;--> statement-breakpoint
ALTER TABLE `__new_usageLog` RENAME TO `usageLog`;