CREATE TABLE `files` (
	`id` text PRIMARY KEY NOT NULL,
	`hash` text,
	`name` text,
	`size` integer,
	`mime` text,
	`storagePath` text,
	`storage_provider` text NOT NULL,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `share` (
	`id` text PRIMARY KEY NOT NULL,
	`userFileId` text NOT NULL,
	`deletedAt` integer,
	`created_at` integer,
	FOREIGN KEY (`userFileId`) REFERENCES `user_files`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `usageLog` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`action` text,
	`size` integer,
	`created_at` integer,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`userId`) REFERENCES `files`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_files` (
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
