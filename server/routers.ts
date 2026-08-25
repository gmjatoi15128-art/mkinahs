import { z } from "zod";
import {
  cmsModules,
  countCmsUsers,
  createCmsUser,
  findPublishedBySlug,
  getAdminOverview,
  getCmsPreviewRecord,
  getCmsUserByEmail,
  getDb,
  getPublicSnapshot,
  listCmsUsers,
  listModule,
  resetContentManagerPassword,
  setContentManagerActive,
  type CmsModule,
  updateModuleStatus,
  upsertSeoSetting,
  upsertSiteSetting,
} from "./db";
import { canAttemptLogin, clearCmsSession, clearLoginAttempts, hashCmsPassword, issueCmsSession, normalizeEmail, recordFailedLogin, verifyCmsPassword, verifyCmsSetupToken } from "./cmsAuth";
import { adminProcedure, publicProcedure, router, superAdminProcedure } from "./_core/trpc";
import { systemRouter } from "./_core/systemRouter";
import { storagePut } from "./storage";
import { clinicalTraining, downloads, events, facilities, faculty, galleryCategories, galleryImages, hospitalAffiliations, newsArticles, pages, programs, type User } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const moduleSchema = z.enum(cmsModules);
const previewTargetSchema = z.enum([...cmsModules, "pages"]);
const contentStatusSchema = z.enum(["draft", "published", "scheduled", "archived"]);
const recordSchema = z.object({
  id: z.number().int().positive().optional(),
  title: z.string().trim().min(2).max(250),
  slug: z.string().trim().min(2).max(250),
  description: z.string().trim().max(12000).optional().nullable(),
  status: contentStatusSchema.default("draft"),
  sortOrder: z.number().int().min(0).default(0),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

function asText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asArray(value: unknown) {
  return Array.isArray(value) ? value : null;
}

function publishDate(status: z.infer<typeof contentStatusSchema>) {
  return status === "published" ? new Date() : null;
}

const credentialsSchema = z.object({ email: z.string().trim().email().max(320), password: z.string().min(12).max(128) });
function safeUser(user: User | null | undefined): Omit<User, "passwordHash"> | null { if (!user) return null; const { passwordHash: _passwordHash, ...safe } = user; return safe; }

async function saveModuleRecord(module: CmsModule, record: z.infer<typeof recordSchema>) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const meta = record.metadata ?? {};
  const common = { status: record.status, sortOrder: record.sortOrder, publishedAt: publishDate(record.status) };

  if (module === "programs") {
    const values = { name: record.title, slug: record.slug, overview: record.description ?? null, category: asText(meta.category), duration: asText(meta.duration), eligibility: asText(meta.eligibility), curriculum: asArray(meta.curriculum), learningOutcomes: asArray(meta.learningOutcomes), clinicalTraining: asText(meta.clinicalTraining), careerDirection: asText(meta.careerDirection), faqs: asArray(meta.faqs), featuredImageUrl: asText(meta.featuredImageUrl), featuredImageKey: asText(meta.featuredImageKey), ...common };
    return record.id ? db.update(programs).set(values).where(eq(programs.id, record.id)) : db.insert(programs).values(values);
  }
  if (module === "faculty") {
    const values = { name: record.title, slug: record.slug, biography: record.description ?? null, designation: asText(meta.designation), qualification: asText(meta.qualification), specialization: asText(meta.specialization), experience: asText(meta.experience), photoUrl: asText(meta.photoUrl), photoKey: asText(meta.photoKey), ...common };
    return record.id ? db.update(faculty).set(values).where(eq(faculty.id, record.id)) : db.insert(faculty).values(values);
  }
  if (module === "facilities") {
    const values = { title: record.title, slug: record.slug, description: record.description ?? null, icon: asText(meta.icon), imageUrls: asArray(meta.imageUrls), ...common };
    return record.id ? db.update(facilities).set(values).where(eq(facilities.id, record.id)) : db.insert(facilities).values(values);
  }
  if (module === "clinicalTraining") {
    const sectionType = asText(meta.sectionType);
    if (!sectionType) throw new Error("Clinical training records require a section type");
    const values = { title: record.title, slug: record.slug, description: record.description ?? null, sectionType, imageUrl: asText(meta.imageUrl), ...common };
    return record.id ? db.update(clinicalTraining).set(values).where(eq(clinicalTraining.id, record.id)) : db.insert(clinicalTraining).values(values);
  }
  if (module === "hospitalAffiliations") {
    const values = { name: record.title, description: record.description ?? null, logoUrl: asText(meta.logoUrl), ...common };
    return record.id ? db.update(hospitalAffiliations).set(values).where(eq(hospitalAffiliations.id, record.id)) : db.insert(hospitalAffiliations).values(values);
  }
  if (module === "galleryCategories") {
    const values = { name: record.title, slug: record.slug, status: record.status, sortOrder: record.sortOrder };
    return record.id ? db.update(galleryCategories).set(values).where(eq(galleryCategories.id, record.id)) : db.insert(galleryCategories).values(values);
  }
  if (module === "galleryImages") {
    const mediaUrl = asText(meta.mediaUrl);
    const mediaKey = asText(meta.mediaKey);
    if (!mediaUrl || !mediaKey) throw new Error("Gallery images require S3 media metadata");
    const categoryId = typeof meta.categoryId === "number" ? meta.categoryId : null;
    const values = { caption: record.title, altText: asText(meta.altText) ?? record.title, categoryId, mediaUrl, mediaKey, ...common };
    return record.id ? db.update(galleryImages).set(values).where(eq(galleryImages.id, record.id)) : db.insert(galleryImages).values(values);
  }
  if (module === "newsArticles") {
    const category = asText(meta.category);
    if (!category) throw new Error("News articles require a category");
    const values = { title: record.title, slug: record.slug, excerpt: record.description ?? null, content: asText(meta.content), category, featuredImageUrl: asText(meta.featuredImageUrl), featuredImageKey: asText(meta.featuredImageKey), scheduledFor: null, seoTitle: asText(meta.seoTitle), seoDescription: asText(meta.seoDescription), ogImageUrl: asText(meta.ogImageUrl), canonicalUrl: asText(meta.canonicalUrl), indexable: meta.indexable !== false, ...common };
    return record.id ? db.update(newsArticles).set(values).where(eq(newsArticles.id, record.id)) : db.insert(newsArticles).values(values);
  }
  if (module === "events") {
    const eventStatus: "upcoming" | "completed" | "cancelled" = meta.eventStatus === "completed" || meta.eventStatus === "cancelled" ? meta.eventStatus : "upcoming";
    const values = { title: record.title, slug: record.slug, description: record.description ?? null, location: asText(meta.location), imageUrl: asText(meta.imageUrl), imageKey: asText(meta.imageKey), startsAt: asText(meta.startsAt) ? new Date(asText(meta.startsAt)!) : null, endsAt: asText(meta.endsAt) ? new Date(asText(meta.endsAt)!) : null, eventStatus, ...common };
    return record.id ? db.update(events).set(values).where(eq(events.id, record.id)) : db.insert(events).values(values);
  }
  const fileUrl = asText(meta.fileUrl);
  const fileKey = asText(meta.fileKey);
  const category = asText(meta.category);
  if (!fileUrl || !fileKey || !category) throw new Error("Downloads require a category and S3 file metadata");
  const values = { title: record.title, slug: record.slug, description: record.description ?? null, category, fileUrl, fileKey, ...common };
  return record.id ? db.update(downloads).set(values).where(eq(downloads.id, record.id)) : db.insert(downloads).values(values);
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => safeUser(opts.ctx.user)),
    setupStatus: publicProcedure.query(async () => ({ requiresSetup: (await countCmsUsers()) === 0 })),
    bootstrap: router({
      validate: publicProcedure.input(z.object({ setupToken: z.string().min(1).max(256) })).query(({ input }) => ({ valid: verifyCmsSetupToken(input.setupToken) })),
    }),
    setup: publicProcedure.input(credentialsSchema.extend({ name: z.string().trim().min(2).max(160), setupToken: z.string().min(1).max(256) })).mutation(async ({ input, ctx }) => {
      if (await countCmsUsers()) throw new Error("A CMS Super Admin account already exists");
      if (!verifyCmsSetupToken(input.setupToken)) throw new Error("Invalid CMS bootstrap token");
      const email = normalizeEmail(input.email);
      const user = await createCmsUser({ name: input.name, email, passwordHash: await hashCmsPassword(input.password), role: "super_admin" });
      if (!user) throw new Error("Unable to create the CMS Super Admin account");
      await issueCmsSession(ctx.res, ctx.req, user.id);
      return safeUser(user);
    }),
    login: publicProcedure.input(credentialsSchema).mutation(async ({ input, ctx }) => {
      const email = normalizeEmail(input.email);
      const attemptKey = `${ctx.req.ip ?? "unknown"}:${email}`;
      if (!canAttemptLogin(attemptKey)) throw new Error("Too many sign-in attempts. Please wait before trying again.");
      const user = await getCmsUserByEmail(email);
      if (!user || !user.isActive || !(await verifyCmsPassword(input.password, user.passwordHash))) {
        recordFailedLogin(attemptKey);
        throw new Error("Invalid email address or password");
      }
      clearLoginAttempts(attemptKey);
      await issueCmsSession(ctx.res, ctx.req, user.id);
      return safeUser(user);
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      clearCmsSession(ctx.res, ctx.req);
      return { success: true } as const;
    }),
  }),
  public: router({
    snapshot: publicProcedure.query(() => getPublicSnapshot()),
    detail: publicProcedure.input(z.object({ type: z.enum(["program", "faculty", "news", "event"]), slug: z.string().min(1) })).query(({ input }) => findPublishedBySlug(input.type, input.slug)),
  }),
  cms: router({
    overview: adminProcedure.query(() => getAdminOverview()),
    list: adminProcedure.input(z.object({ module: moduleSchema })).query(({ input }) => listModule(input.module)),
    preview: adminProcedure.input(z.object({ target: previewTargetSchema, id: z.number().int().positive() })).query(({ input }) => getCmsPreviewRecord(input.target, input.id)),
    save: adminProcedure.input(z.object({ module: moduleSchema, record: recordSchema })).mutation(({ input }) => saveModuleRecord(input.module, input.record)),
    setStatus: adminProcedure.input(z.object({ module: moduleSchema, id: z.number().int().positive(), status: contentStatusSchema })).mutation(({ input }) => updateModuleStatus(input.module, input.id, input.status)),
    savePage: adminProcedure.input(z.object({ id: z.number().int().positive().optional(), slug: z.string().min(1).max(160), title: z.string().min(2).max(250), sections: z.unknown(), status: contentStatusSchema, sortOrder: z.number().int().min(0), seoTitle: z.string().max(250).optional().nullable(), seoDescription: z.string().max(1000).optional().nullable(), ogImageUrl: z.string().max(1000).optional().nullable(), canonicalUrl: z.string().max(1000).optional().nullable(), indexable: z.boolean() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const values = { ...input, id: undefined, publishedAt: publishDate(input.status) };
      return input.id ? db.update(pages).set(values).where(eq(pages.id, input.id)) : db.insert(pages).values(values);
    }),
    uploadMedia: adminProcedure.input(z.object({ fileName: z.string().min(1).max(200), mimeType: z.string().min(3).max(120), dataBase64: z.string().min(4).max(16_000_000), scope: z.enum(["image", "document"]) })).mutation(async ({ input, ctx }) => {
      const bytes = Buffer.from(input.dataBase64, "base64");
      if (!bytes.length || bytes.length > 10_000_000) throw new Error("Uploads must be no larger than 10 MB");
      const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
      return storagePut(`cms/${ctx.user.id}/${input.scope}/${Date.now()}-${safeName}`, bytes, input.mimeType);
    }),
    settings: router({
      upsert: superAdminProcedure.input(z.object({ key: z.string().min(2).max(100), label: z.string().min(2).max(160), value: z.unknown(), description: z.string().max(1000).optional() })).mutation(({ input, ctx }) => upsertSiteSetting({ ...input, userId: ctx.user.id })),
    }),
    seo: router({
      upsert: superAdminProcedure.input(z.object({ path: z.string().min(1).max(250), title: z.string().max(250).optional(), description: z.string().max(1000).optional(), ogImageUrl: z.string().max(1000).optional(), canonicalUrl: z.string().max(1000).optional(), indexable: z.boolean() })).mutation(({ input }) => upsertSeoSetting(input)),
    }),
    accounts: router({
      list: superAdminProcedure.query(async () => (await listCmsUsers()).flatMap(account => { const safe = safeUser(account); return safe ? [safe] : []; })),
      createContentManager: superAdminProcedure.input(credentialsSchema.extend({ name: z.string().trim().min(2).max(160) })).mutation(async ({ input }) => {
        const email = normalizeEmail(input.email);
        if (await getCmsUserByEmail(email)) throw new Error("A CMS account with this email already exists");
        return safeUser(await createCmsUser({ name: input.name, email, passwordHash: await hashCmsPassword(input.password), role: "content_manager" }));
      }),
      setContentManagerActive: superAdminProcedure.input(z.object({ id: z.number().int().positive(), isActive: z.boolean() })).mutation(async ({ input }) => {
        const account = await setContentManagerActive(input.id, input.isActive);
        if (!account) throw new Error("Content Manager account not found");
        return safeUser(account);
      }),
      resetContentManagerPassword: superAdminProcedure.input(z.object({ id: z.number().int().positive(), password: z.string().min(12).max(128) })).mutation(async ({ input }) => {
        const account = await resetContentManagerPassword(input.id, await hashCmsPassword(input.password));
        if (!account) throw new Error("Content Manager account not found");
        return safeUser(account);
      }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
