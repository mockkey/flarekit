PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_subscription` (
	`id` text PRIMARY KEY NOT NULL,
	`plan` text NOT NULL,
	`referenceId` text NOT NULL,
	`stripeCustomerId` text,
	`stripeSubscriptionId` text,
	`status` text NOT NULL,
	`periodStart` integer,
	`periodEnd` integer,
	`cancelAtPeriodEnd` integer,
	`seats` integer,
	`trialStart` integer,
	`trialEnd` integer,
	`createdAt` integer,
	`updatedAt` integer
);
--> statement-breakpoint
INSERT INTO `__new_subscription`("id", "plan", "referenceId", "stripeCustomerId", "stripeSubscriptionId", "status", "periodStart", "periodEnd", "cancelAtPeriodEnd", "seats", "trialStart", "trialEnd", "createdAt", "updatedAt") SELECT "id", "plan", "referenceId", "stripeCustomerId", "stripeSubscriptionId", "status", "periodStart", "periodEnd", "cancelAtPeriodEnd", "seats", "trialStart", "trialEnd", "createdAt", "updatedAt" FROM `subscription`;--> statement-breakpoint
DROP TABLE `subscription`;--> statement-breakpoint
ALTER TABLE `__new_subscription` RENAME TO `subscription`;--> statement-breakpoint
PRAGMA foreign_keys=ON;