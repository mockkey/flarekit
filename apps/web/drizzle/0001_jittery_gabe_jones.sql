CREATE TABLE `appearance` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`theme` text,
	`language` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `appearance_userId_unique` ON `appearance` (`userId`);--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `theme`;