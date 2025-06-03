ALTER TABLE `storage_usage_logs` RENAME COLUMN "old_usage" TO "oldUsage";--> statement-breakpoint
ALTER TABLE `storage_usage_logs` RENAME COLUMN "new_usage" TO "newUsage";--> statement-breakpoint
ALTER TABLE `storage_usage_logs` RENAME COLUMN "created_at" TO "createdAt";