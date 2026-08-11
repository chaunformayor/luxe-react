CREATE TABLE `blogPosts` (
	`id` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`excerpt` text,
	`body` text NOT NULL,
	`coverImageUrl` text,
	`category` varchar(100),
	`status` enum('draft','published') DEFAULT 'draft',
	`publishedAt` timestamp,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `blogPosts_id` PRIMARY KEY(`id`)
);
