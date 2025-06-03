PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user_files` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`fileId` text NOT NULL,
	`parentId` text,
	`name` text,
	`isDir` integer DEFAULT false,
	`deletedAt` integer,
	`createdAt` integer,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`fileId`) REFERENCES `files`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_user_files`("id", "userId", "fileId", "parentId", "name", "isDir", "deletedAt", "createdAt") SELECT "id", "userId", "fileId", "parentId", "name", "isDir", "deletedAt", "createdAt" FROM `user_files`;--> statement-breakpoint
DROP TABLE `user_files`;--> statement-breakpoint
ALTER TABLE `__new_user_files` RENAME TO `user_files`;--> statement-breakpoint
PRAGMA foreign_keys=ON;