CREATE TABLE `newsletterSubscribers` (
  `id` varchar(64) NOT NULL,
  `email` varchar(320) NOT NULL,
  `createdAt` timestamp DEFAULT (now()),
  CONSTRAINT `newsletterSubscribers_id` PRIMARY KEY(`id`),
  UNIQUE KEY `newsletterSubscribers_email_unique` (`email`)
);
