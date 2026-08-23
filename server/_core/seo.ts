import type { Request } from "express";
import { getPublicSnapshot } from "../db";

type SeoShape = { title: string; description: string; canonicalPath: string; indexable: boolean; ogType: "website" | "article"; image?: string; article?: { published?: Date | null; updated?: Date | null } };

const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const compact = (value: unknown, fallback = "") => typeof value === "string" && value.trim() ? value.replace(/\s+/g, " ").trim() : fallback;
const description = (value: unknown, fallback: string) => compact(value, fallback).slice(0, 200);

function currentOrigin(req: Request) {
  const configured = process.env.CANONICAL_ORIGIN?.trim().replace(/\/$/, "");
  if (configured) return configured;
  const protocol = String(req.headers["x-forwarded-proto"] || req.protocol).split(",")[0] || "https";
  return `${protocol}://${req.get("host")}`;
}

function staticMeta(path: string, siteName: string): SeoShape | null {
  const routes: Record<string, [string, string]> = {
    "/": [siteName, `Official website of ${siteName}, featuring programme, admissions, academic, and institutional information.`],
    "/about": [`About the Institute | ${siteName}`, `Explore the official institutional profile and published information from ${siteName}.`],
    "/programs": [`Programs | ${siteName}`, `Explore published programme information, duration, eligibility, and learning pathways at ${siteName}.`],
    "/admissions": [`Admissions Information | ${siteName}`, `Review the published admissions information and five-step admissions process at ${siteName}.`],
    "/faculty": [`Faculty | ${siteName}`, `View published faculty profiles and academic team information from ${siteName}.`],
    "/facilities": [`Campus & Facilities | ${siteName}`, `Explore published campus and learning-environment information from ${siteName}.`],
    "/clinical-training": [`Clinical Training | ${siteName}`, `Explore published clinical-learning and affiliation information from ${siteName}.`],
    "/student-life": [`Student Life | ${siteName}`, `Explore published community and student-life information from ${siteName}.`],
    "/gallery": [`Gallery | ${siteName}`, `Browse published campus and institute gallery images from ${siteName}.`],
    "/news": [`News & Notices | ${siteName}`, `Read officially published notices, updates, and announcements from ${siteName}.`],
    "/events": [`Events | ${siteName}`, `Review published events and calendar information from ${siteName}.`],
    "/downloads": [`Downloads | ${siteName}`, `Access official documents published by ${siteName}.`],
    "/contact": [`Contact | ${siteName}`, `Find published contact channels and campus-location information for ${siteName}.`],
  };
  const route = routes[path];
  return route ? { title: route[0], description: route[1], canonicalPath: path, indexable: true, ogType: "website" } : null;
}

export async function buildSeoHead(req: Request) {
  const rawPath = req.originalUrl.split("?")[0].replace(/\/+$/, "") || "/";
  const snapshot = await getPublicSnapshot();
  const identity = snapshot.settings.find(setting => setting.key === "identity")?.value as Record<string, unknown> | undefined;
  const siteName = compact(identity?.name, "MK Institute of Nursing and Allied Health Sciences");
  const seoRecord = snapshot.seo.find(record => record.path === rawPath);
  let meta = staticMeta(rawPath, siteName);
  let notFound = false;

  const match = rawPath.match(/^\/(programs|faculty|news|events)\/([^/]+)$/);
  if (match) {
    const [, type, slug] = match;
    const record: any = type === "programs" ? snapshot.programs.find(item => item.slug === slug) : type === "faculty" ? snapshot.faculty.find(item => item.slug === slug) : type === "news" ? snapshot.news.find(item => item.slug === slug) : snapshot.events.find(item => item.slug === slug);
    if (!record) { meta = { title: `Information centre | ${siteName}`, description: `The requested information is not available from ${siteName}.`, canonicalPath: rawPath, indexable: false, ogType: "website" }; notFound = true; }
    else if (type === "programs") meta = { title: `${record.name} | ${siteName}`, description: description(record.overview, `Programme information from ${siteName}.`), canonicalPath: rawPath, indexable: true, ogType: "website", image: record.featuredImageUrl || undefined };
    else if (type === "faculty") meta = { title: `${record.name} | ${siteName}`, description: description(record.biography, `Faculty profile from ${siteName}.`), canonicalPath: rawPath, indexable: true, ogType: "website", image: record.photoUrl || undefined };
    else if (type === "news") meta = { title: compact(record.seoTitle, `${record.title} | ${siteName}`), description: description(record.seoDescription || record.excerpt, `Official notice from ${siteName}.`), canonicalPath: rawPath, indexable: record.indexable !== false, ogType: "article", image: record.ogImageUrl || record.featuredImageUrl || undefined, article: { published: record.publishedAt, updated: record.updatedAt } };
    else meta = { title: `${record.title} | ${siteName}`, description: description(record.description, `Event information from ${siteName}.`), canonicalPath: rawPath, indexable: true, ogType: "website", image: record.imageUrl || undefined, article: { published: record.publishedAt, updated: record.updatedAt } };
  }

  if (rawPath === "/admin" || rawPath.startsWith("/admin/")) meta = { title: `CMS | ${siteName}`, description: "Secure content management workspace.", canonicalPath: rawPath, indexable: false, ogType: "website" };
  if (!meta) { meta = { title: `Page not found | ${siteName}`, description: `The requested page is not available from ${siteName}.`, canonicalPath: rawPath, indexable: false, ogType: "website" }; notFound = true; }
  if (seoRecord) meta = { ...meta, title: compact(seoRecord.title, meta.title), description: description(seoRecord.description, meta.description), indexable: seoRecord.indexable, image: seoRecord.ogImageUrl || meta.image, canonicalPath: seoRecord.canonicalUrl || meta.canonicalPath };

  const origin = currentOrigin(req);
  const canonical = meta.canonicalPath.startsWith("http") ? meta.canonicalPath : `${origin}${meta.canonicalPath}`;
  const image = meta.image?.startsWith("/") ? `${origin}${meta.image}` : meta.image;
  const organization = { "@context": "https://schema.org", "@type": ["Organization", "EducationalOrganization"], name: siteName, url: origin };
  const structured: Array<Record<string, unknown>> = [organization];
  if (meta.ogType === "article") structured.push({ "@context": "https://schema.org", "@type": "Article", headline: meta.title.replace(` | ${siteName}`, ""), description: meta.description, mainEntityOfPage: canonical, datePublished: meta.article?.published?.toISOString(), dateModified: meta.article?.updated?.toISOString(), image });
  const jsonLd = structured.map(item => `<script type="application/ld+json">${JSON.stringify(item).replace(/</g, "\\u003c")}</script>`).join("\n");
  const tags = [
    `<title>${escapeHtml(meta.title)}</title>`, `<meta name="description" content="${escapeHtml(meta.description)}" />`, `<meta name="robots" content="${meta.indexable ? "index, follow" : "noindex, follow"}" />`,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`, `<meta property="og:type" content="${meta.ogType}" />`, `<meta property="og:site_name" content="${escapeHtml(siteName)}" />`, `<meta property="og:title" content="${escapeHtml(meta.title)}" />`, `<meta property="og:description" content="${escapeHtml(meta.description)}" />`, `<meta property="og:url" content="${escapeHtml(canonical)}" />`, `<meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}" />`, `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`, `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
    image ? `<meta property="og:image" content="${escapeHtml(image)}" />` : "", image ? `<meta name="twitter:image" content="${escapeHtml(image)}" />` : "", jsonLd,
  ].filter(Boolean).join("\n");
  return { tags, notFound };
}

export async function injectSeoHead(template: string, req: Request) {
  const head = await buildSeoHead(req);
  return { html: template.replace("<!--app-head-->", () => head.tags), notFound: head.notFound };
}
