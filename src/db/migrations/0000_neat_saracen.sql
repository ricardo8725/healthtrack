CREATE TABLE `user_profile` (
	`id` text PRIMARY KEY NOT NULL,
	`height_cm` real NOT NULL,
	`date_of_birth` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `weight_entry` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`date` text NOT NULL,
	`weight_kg` real NOT NULL,
	`bmi` real NOT NULL,
	`bmi_category` text NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user_profile`(`id`) ON UPDATE no action ON DELETE no action
);
