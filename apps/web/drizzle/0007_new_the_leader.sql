PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_storage_usage_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`fileId` text NOT NULL,
	`action` text NOT NULL,
	`oldUsage` integer,
	`newUsage` integer,
	`size` integer NOT NULL,
	`metadata` text,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_storage_usage_logs`("id", "userId", "fileId", "action", "oldUsage", "newUsage", "size", "metadata", "createdAt") SELECT "id", "userId", "fileId", "action", "oldUsage", "newUsage", "size", "metadata", "createdAt" FROM `storage_usage_logs`;--> statement-breakpoint
DROP TABLE `storage_usage_logs`;--> statement-breakpoint
ALTER TABLE `__new_storage_usage_logs` RENAME TO `storage_usage_logs`;--> statement-breakpoint
PRAGMA foreign_keys=ON;