import {
  boolean,
  datetime,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const contentStatuses = ["draft", "published", "scheduled", "archived"] as const;
export const userRoles = ["user", "content_manager", "super_admin"] as const;

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  isActive: boolean("isActive").default(true).notNull(),
  role: mysqlEnum("role", userRoles).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const siteSettings = mysqlTable("site_settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  label: varchar("label", { length: 160 }).notNull(),
  value: json("value").notNull(),
  description: text("description"),
  updatedBy: int("updatedBy"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const pages = mysqlTable("pages", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  title: varchar("title", { length: 250 }).notNull(),
  sections: json("sections").notNull(),
  status: mysqlEnum("page_status", contentStatuses).default("draft").notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  seoTitle: varchar("seoTitle", { length: 250 }),
  seoDescription: text("seoDescription"),
  ogImageUrl: text("ogImageUrl"),
  canonicalUrl: text("canonicalUrl"),
  indexable: boolean("indexable").default(true).notNull(),
  publishedAt: datetime("publishedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const programs = mysqlTable("programs", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 250 }).notNull(),
  slug: varchar("slug", { length: 250 }).notNull().unique(),
  category: varchar("category", { length: 100 }),
  duration: varchar("duration", { length: 100 }),
  eligibility: text("eligibility"),
  overview: text("overview"),
  curriculum: json("curriculum"),
  learningOutcomes: json("learningOutcomes"),
  clinicalTraining: text("clinicalTraining"),
  careerDirection: text("careerDirection"),
  faqs: json("faqs"),
  featuredImageUrl: text("featuredImageUrl"),
  featuredImageKey: text("featuredImageKey"),
  status: mysqlEnum("program_status", contentStatuses).default("draft").notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  publishedAt: datetime("publishedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const faculty = mysqlTable("faculty", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 250 }).notNull(),
  slug: varchar("slug", { length: 250 }).notNull().unique(),
  designation: varchar("designation", { length: 160 }),
  qualification: text("qualification"),
  specialization: varchar("specialization", { length: 160 }),
  experience: varchar("experience", { length: 120 }),
  biography: text("biography"),
  photoUrl: text("photoUrl"),
  photoKey: text("photoKey"),
  status: mysqlEnum("faculty_status", contentStatuses).default("draft").notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  publishedAt: datetime("publishedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const facilities = mysqlTable("facilities", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 250 }).notNull(),
  slug: varchar("slug", { length: 250 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 80 }),
  imageUrls: json("imageUrls"),
  status: mysqlEnum("facility_status", contentStatuses).default("draft").notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  publishedAt: datetime("publishedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const clinicalTraining = mysqlTable("clinical_training", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 250 }).notNull(),
  slug: varchar("slug", { length: 250 }).notNull().unique(),
  description: text("description"),
  sectionType: varchar("sectionType", { length: 100 }).notNull(),
  imageUrl: text("imageUrl"),
  status: mysqlEnum("clinical_training_status", contentStatuses).default("draft").notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  publishedAt: datetime("publishedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const hospitalAffiliations = mysqlTable("hospital_affiliations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 250 }).notNull(),
  description: text("description"),
  logoUrl: text("logoUrl"),
  status: mysqlEnum("affiliation_status", contentStatuses).default("draft").notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  publishedAt: datetime("publishedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const galleryCategories = mysqlTable("gallery_categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  status: mysqlEnum("gallery_category_status", contentStatuses).default("draft").notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const galleryImages = mysqlTable("gallery_images", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("categoryId"),
  caption: varchar("caption", { length: 250 }),
  altText: varchar("altText", { length: 250 }),
  mediaUrl: text("mediaUrl").notNull(),
  mediaKey: text("mediaKey").notNull(),
  status: mysqlEnum("gallery_image_status", contentStatuses).default("draft").notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  publishedAt: datetime("publishedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const newsArticles = mysqlTable("news_articles", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 250 }).notNull(),
  slug: varchar("slug", { length: 250 }).notNull().unique(),
  category: varchar("category", { length: 100 }).notNull(),
  excerpt: text("excerpt"),
  content: text("content"),
  featuredImageUrl: text("featuredImageUrl"),
  featuredImageKey: text("featuredImageKey"),
  status: mysqlEnum("news_status", contentStatuses).default("draft").notNull(),
  publishedAt: datetime("publishedAt"),
  scheduledFor: datetime("scheduledFor"),
  sortOrder: int("sortOrder").default(0).notNull(),
  seoTitle: varchar("seoTitle", { length: 250 }),
  seoDescription: text("seoDescription"),
  ogImageUrl: text("ogImageUrl"),
  canonicalUrl: text("canonicalUrl"),
  indexable: boolean("indexable").default(true).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 250 }).notNull(),
  slug: varchar("slug", { length: 250 }).notNull().unique(),
  location: varchar("location", { length: 250 }),
  description: text("description"),
  imageUrl: text("imageUrl"),
  imageKey: text("imageKey"),
  startsAt: datetime("startsAt"),
  endsAt: datetime("endsAt"),
  eventStatus: mysqlEnum("event_state", ["upcoming", "completed", "cancelled"]).default("upcoming").notNull(),
  status: mysqlEnum("event_status", contentStatuses).default("draft").notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  publishedAt: datetime("publishedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const downloads = mysqlTable("downloads", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 250 }).notNull(),
  slug: varchar("slug", { length: 250 }).notNull().unique(),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description"),
  fileUrl: text("fileUrl").notNull(),
  fileKey: text("fileKey").notNull(),
  status: mysqlEnum("download_status", contentStatuses).default("draft").notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  publishedAt: datetime("publishedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const seoSettings = mysqlTable("seo_settings", {
  id: int("id").autoincrement().primaryKey(),
  path: varchar("path", { length: 250 }).notNull().unique(),
  title: varchar("title", { length: 250 }),
  description: text("description"),
  ogImageUrl: text("ogImageUrl"),
  canonicalUrl: text("canonicalUrl"),
  indexable: boolean("indexable").default(true).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
