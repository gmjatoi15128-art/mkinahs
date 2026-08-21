CREATE TABLE `clinical_training` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(250) NOT NULL,
	`slug` varchar(250) NOT NULL,
	`description` text,
	`sectionType` varchar(100) NOT NULL,
	`imageUrl` text,
	`clinical_training_status` enum('draft','published','scheduled','archived') NOT NULL DEFAULT 'draft',
	`sortOrder` int NOT NULL DEFAULT 0,
	`publishedAt` datetime,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clinical_training_id` PRIMARY KEY(`id`),
	CONSTRAINT `clinical_training_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `downloads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(250) NOT NULL,
	`slug` varchar(250) NOT NULL,
	`category` varchar(100) NOT NULL,
	`description` text,
	`fileUrl` text NOT NULL,
	`fileKey` text NOT NULL,
	`download_status` enum('draft','published','scheduled','archived') NOT NULL DEFAULT 'draft',
	`sortOrder` int NOT NULL DEFAULT 0,
	`publishedAt` datetime,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `downloads_id` PRIMARY KEY(`id`),
	CONSTRAINT `downloads_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(250) NOT NULL,
	`slug` varchar(250) NOT NULL,
	`location` varchar(250),
	`description` text,
	`imageUrl` text,
	`imageKey` text,
	`startsAt` datetime,
	`endsAt` datetime,
	`event_state` enum('upcoming','completed','cancelled') NOT NULL DEFAULT 'upcoming',
	`event_status` enum('draft','published','scheduled','archived') NOT NULL DEFAULT 'draft',
	`sortOrder` int NOT NULL DEFAULT 0,
	`publishedAt` datetime,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `events_id` PRIMARY KEY(`id`),
	CONSTRAINT `events_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `facilities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(250) NOT NULL,
	`slug` varchar(250) NOT NULL,
	`description` text,
	`icon` varchar(80),
	`imageUrls` json,
	`facility_status` enum('draft','published','scheduled','archived') NOT NULL DEFAULT 'draft',
	`sortOrder` int NOT NULL DEFAULT 0,
	`publishedAt` datetime,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `facilities_id` PRIMARY KEY(`id`),
	CONSTRAINT `facilities_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `faculty` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(250) NOT NULL,
	`slug` varchar(250) NOT NULL,
	`designation` varchar(160),
	`qualification` text,
	`specialization` varchar(160),
	`experience` varchar(120),
	`biography` text,
	`photoUrl` text,
	`photoKey` text,
	`faculty_status` enum('draft','published','scheduled','archived') NOT NULL DEFAULT 'draft',
	`sortOrder` int NOT NULL DEFAULT 0,
	`publishedAt` datetime,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `faculty_id` PRIMARY KEY(`id`),
	CONSTRAINT `faculty_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `gallery_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`slug` varchar(160) NOT NULL,
	`gallery_category_status` enum('draft','published','scheduled','archived') NOT NULL DEFAULT 'draft',
	`sortOrder` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gallery_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `gallery_categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `gallery_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`categoryId` int,
	`caption` varchar(250),
	`altText` varchar(250),
	`mediaUrl` text NOT NULL,
	`mediaKey` text NOT NULL,
	`gallery_image_status` enum('draft','published','scheduled','archived') NOT NULL DEFAULT 'draft',
	`sortOrder` int NOT NULL DEFAULT 0,
	`publishedAt` datetime,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gallery_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hospital_affiliations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(250) NOT NULL,
	`description` text,
	`logoUrl` text,
	`affiliation_status` enum('draft','published','scheduled','archived') NOT NULL DEFAULT 'draft',
	`sortOrder` int NOT NULL DEFAULT 0,
	`publishedAt` datetime,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hospital_affiliations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `news_articles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(250) NOT NULL,
	`slug` varchar(250) NOT NULL,
	`category` varchar(100) NOT NULL,
	`excerpt` text,
	`content` text,
	`featuredImageUrl` text,
	`featuredImageKey` text,
	`news_status` enum('draft','published','scheduled','archived') NOT NULL DEFAULT 'draft',
	`publishedAt` datetime,
	`scheduledFor` datetime,
	`sortOrder` int NOT NULL DEFAULT 0,
	`seoTitle` varchar(250),
	`seoDescription` text,
	`ogImageUrl` text,
	`canonicalUrl` text,
	`indexable` boolean NOT NULL DEFAULT true,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `news_articles_id` PRIMARY KEY(`id`),
	CONSTRAINT `news_articles_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `pages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(160) NOT NULL,
	`title` varchar(250) NOT NULL,
	`sections` json NOT NULL,
	`page_status` enum('draft','published','scheduled','archived') NOT NULL DEFAULT 'draft',
	`sortOrder` int NOT NULL DEFAULT 0,
	`seoTitle` varchar(250),
	`seoDescription` text,
	`ogImageUrl` text,
	`canonicalUrl` text,
	`indexable` boolean NOT NULL DEFAULT true,
	`publishedAt` datetime,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pages_id` PRIMARY KEY(`id`),
	CONSTRAINT `pages_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `programs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(250) NOT NULL,
	`slug` varchar(250) NOT NULL,
	`category` varchar(100),
	`duration` varchar(100),
	`eligibility` text,
	`overview` text,
	`curriculum` json,
	`learningOutcomes` json,
	`clinicalTraining` text,
	`careerDirection` text,
	`faqs` json,
	`featuredImageUrl` text,
	`featuredImageKey` text,
	`program_status` enum('draft','published','scheduled','archived') NOT NULL DEFAULT 'draft',
	`sortOrder` int NOT NULL DEFAULT 0,
	`publishedAt` datetime,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `programs_id` PRIMARY KEY(`id`),
	CONSTRAINT `programs_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `seo_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`path` varchar(250) NOT NULL,
	`title` varchar(250),
	`description` text,
	`ogImageUrl` text,
	`canonicalUrl` text,
	`indexable` boolean NOT NULL DEFAULT true,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `seo_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `seo_settings_path_unique` UNIQUE(`path`)
);
--> statement-breakpoint
CREATE TABLE `site_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(100) NOT NULL,
	`label` varchar(160) NOT NULL,
	`value` json NOT NULL,
	`description` text,
	`updatedBy` int,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `site_settings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','content_manager','super_admin') NOT NULL DEFAULT 'user';