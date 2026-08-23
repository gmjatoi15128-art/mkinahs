import { and, asc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  clinicalTraining,
  downloads,
  events,
  facilities,
  faculty,
  galleryCategories,
  galleryImages,
  hospitalAffiliations,
  InsertUser,
  newsArticles,
  pages,
  programs,
  seoSettings,
  siteSettings,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

export const cmsModules = [
  "programs",
  "faculty",
  "facilities",
  "clinicalTraining",
  "hospitalAffiliations",
  "galleryCategories",
  "galleryImages",
  "newsArticles",
  "events",
  "downloads",
] as const;

export type CmsModule = (typeof cmsModules)[number];
export type ContentStatus = "draft" | "published" | "scheduled" | "archived";

export function publishedOnly<T extends { status: ContentStatus }>(records: T[]) {
  return records.filter(record => record.status === "published");
}

export function publishedDetail<T extends { status: ContentStatus }>(record: T | undefined) {
  return record?.status === "published" ? record : null;
}

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId, lastSignedIn: new Date() };
  const updateSet: Record<string, unknown> = { lastSignedIn: new Date() };
  (["name", "email", "loginMethod"] as const).forEach(field => {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  });
  if (user.openId === ENV.ownerOpenId) {
    values.role = "super_admin";
    updateSet.role = "super_admin";
  } else if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  }
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getPublicSnapshot() {
  const db = await getDb();
  if (!db) {
    return {
      settings: [], pages: [], programs: [], faculty: [], facilities: [], clinicalTraining: [],
      affiliations: [], galleryCategories: [], galleryImages: [], news: [], events: [], downloads: [], seo: [],
    };
  }

  const published = "published" as const;
  const [settings, publishedPages, publicPrograms, publicFaculty, publicFacilities, publicTraining, affiliations, categories, images, news, publishedEvents, publicDownloads, seo] = await Promise.all([
    db.select().from(siteSettings).orderBy(asc(siteSettings.label)),
    db.select().from(pages).where(eq(pages.status, published)).orderBy(asc(pages.sortOrder)),
    db.select().from(programs).where(eq(programs.status, published)).orderBy(asc(programs.sortOrder)),
    db.select().from(faculty).where(eq(faculty.status, published)).orderBy(asc(faculty.sortOrder)),
    db.select().from(facilities).where(eq(facilities.status, published)).orderBy(asc(facilities.sortOrder)),
    db.select().from(clinicalTraining).where(eq(clinicalTraining.status, published)).orderBy(asc(clinicalTraining.sortOrder)),
    db.select().from(hospitalAffiliations).where(eq(hospitalAffiliations.status, published)).orderBy(asc(hospitalAffiliations.sortOrder)),
    db.select().from(galleryCategories).where(eq(galleryCategories.status, published)).orderBy(asc(galleryCategories.sortOrder)),
    db.select().from(galleryImages).where(eq(galleryImages.status, published)).orderBy(asc(galleryImages.sortOrder)),
    db.select().from(newsArticles).where(eq(newsArticles.status, published)).orderBy(asc(newsArticles.sortOrder)),
    db.select().from(events).where(eq(events.status, published)).orderBy(asc(events.sortOrder)),
    db.select().from(downloads).where(eq(downloads.status, published)).orderBy(asc(downloads.sortOrder)),
    db.select().from(seoSettings),
  ]);
  return { settings, pages: publishedOnly(publishedPages), programs: publishedOnly(publicPrograms), faculty: publishedOnly(publicFaculty), facilities: publishedOnly(publicFacilities), clinicalTraining: publishedOnly(publicTraining), affiliations: publishedOnly(affiliations), galleryCategories: publishedOnly(categories), galleryImages: publishedOnly(images), news: publishedOnly(news), events: publishedOnly(publishedEvents), downloads: publishedOnly(publicDownloads), seo };
}

export async function findPublishedBySlug(type: "program" | "faculty" | "news" | "event", slug: string): Promise<any> {
  const db = await getDb();
  if (!db) return null;
  const published = "published" as const;
  if (type === "program") return publishedDetail((await db.select().from(programs).where(and(eq(programs.slug, slug), eq(programs.status, published))).limit(1))[0]);
  if (type === "faculty") return publishedDetail((await db.select().from(faculty).where(and(eq(faculty.slug, slug), eq(faculty.status, published))).limit(1))[0]);
  if (type === "news") return publishedDetail((await db.select().from(newsArticles).where(and(eq(newsArticles.slug, slug), eq(newsArticles.status, published))).limit(1))[0]);
  return publishedDetail((await db.select().from(events).where(and(eq(events.slug, slug), eq(events.status, published))).limit(1))[0]);
}

export async function listModule(module: CmsModule) {
  const db = await getDb();
  if (!db) return [];
  switch (module) {
    case "programs": return db.select().from(programs).orderBy(asc(programs.sortOrder));
    case "faculty": return db.select().from(faculty).orderBy(asc(faculty.sortOrder));
    case "facilities": return db.select().from(facilities).orderBy(asc(facilities.sortOrder));
    case "clinicalTraining": return db.select().from(clinicalTraining).orderBy(asc(clinicalTraining.sortOrder));
    case "hospitalAffiliations": return db.select().from(hospitalAffiliations).orderBy(asc(hospitalAffiliations.sortOrder));
    case "galleryCategories": return db.select().from(galleryCategories).orderBy(asc(galleryCategories.sortOrder));
    case "galleryImages": return db.select().from(galleryImages).orderBy(asc(galleryImages.sortOrder));
    case "newsArticles": return db.select().from(newsArticles).orderBy(asc(newsArticles.sortOrder));
    case "events": return db.select().from(events).orderBy(asc(events.sortOrder));
    case "downloads": return db.select().from(downloads).orderBy(asc(downloads.sortOrder));
  }
}

export async function getAdminOverview() {
  const db = await getDb();
  if (!db) return { settings: [], pages: [], seo: [], modules: Object.fromEntries(cmsModules.map(module => [module, []])) };
  const moduleResults = await Promise.all(cmsModules.map(listModule));
  return {
    settings: await db.select().from(siteSettings).orderBy(asc(siteSettings.label)),
    pages: await db.select().from(pages).orderBy(asc(pages.sortOrder)),
    seo: await db.select().from(seoSettings).orderBy(asc(seoSettings.path)),
    modules: Object.fromEntries(cmsModules.map((module, index) => [module, moduleResults[index]])),
  };
}

export async function updateModuleStatus(module: CmsModule, id: number, status: ContentStatus) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const values = { status, publishedAt: status === "published" ? new Date() : null };
  switch (module) {
    case "programs": return db.update(programs).set(values).where(eq(programs.id, id));
    case "faculty": return db.update(faculty).set(values).where(eq(faculty.id, id));
    case "facilities": return db.update(facilities).set(values).where(eq(facilities.id, id));
    case "clinicalTraining": return db.update(clinicalTraining).set(values).where(eq(clinicalTraining.id, id));
    case "hospitalAffiliations": return db.update(hospitalAffiliations).set(values).where(eq(hospitalAffiliations.id, id));
    case "galleryCategories": return db.update(galleryCategories).set(values).where(eq(galleryCategories.id, id));
    case "galleryImages": return db.update(galleryImages).set(values).where(eq(galleryImages.id, id));
    case "newsArticles": return db.update(newsArticles).set(values).where(eq(newsArticles.id, id));
    case "events": return db.update(events).set(values).where(eq(events.id, id));
    case "downloads": return db.update(downloads).set(values).where(eq(downloads.id, id));
  }
}

export async function upsertSiteSetting(input: { key: string; label: string; value: unknown; description?: string; userId: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(siteSettings).values({ ...input, description: input.description ?? null, updatedBy: input.userId }).onDuplicateKeyUpdate({
    set: { label: input.label, value: input.value, description: input.description ?? null, updatedBy: input.userId },
  });
}

export async function upsertSeoSetting(input: { path: string; title?: string; description?: string; ogImageUrl?: string; canonicalUrl?: string; indexable: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(seoSettings).values(input).onDuplicateKeyUpdate({ set: input });
}
