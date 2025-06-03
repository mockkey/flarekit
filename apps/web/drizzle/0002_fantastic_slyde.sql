ALTER TABLE `files` RENAME COLUMN "storage_provider" TO "storageProvider";--> statement-breakpoint
ALTER TABLE `share` RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE `usageLog` RENAME COLUMN "created_at" TO "createdAt";