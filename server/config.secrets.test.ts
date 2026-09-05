import { describe, expect, it } from "vitest";
import { safePublicQuery } from "./db";
import { buildSeoHead } from "./_core/seo";

describe("application configuration", () => {
  it("serves the configured application title from the lightweight homepage endpoint", async () => {
    const port = process.env.PORT ?? "3000";
    const response = await fetch(`http://127.0.0.1:${port}/`);
    const html = await response.text();

    expect(response.ok).toBe(true);
    expect(html).toContain("MK Institute of Nursing and Allied Health Sciences");
  });

  it("returns an empty fallback when one public CMS query fails", async () => {
    const records = await safePublicQuery("programs", Promise.reject(new Error("simulated table failure")), [] as Array<{ status: "published" }>);

    expect(records).toEqual([]);
  });

  it("still renders crawler metadata from a partial public snapshot", async () => {
    const request = {
      originalUrl: "/programs",
      protocol: "https",
      headers: { "x-forwarded-host": "example.edu" },
      get: () => "example.edu",
    } as unknown as Request;
    const head = await buildSeoHead(request, {
      settings: [],
      pages: [],
      programs: [],
      faculty: [],
      facilities: [],
      clinicalTraining: [],
      affiliations: [],
      galleryCategories: [],
      galleryImages: [],
      news: [],
      events: [],
      downloads: [],
      seo: [],
    });

    expect(head.notFound).toBe(false);
    expect(head.tags).toContain("<title>Programs | MK Institute of Nursing and Allied Health Sciences</title>");
    expect(head.tags).toContain('name="robots" content="index, follow"');
  });

  it("resolves the public snapshot endpoint without a database query error", async () => {
    const port = process.env.PORT ?? "3000";
    const response = await fetch(
      `http://127.0.0.1:${port}/api/trpc/public.snapshot?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%2C%22meta%22%3A%7B%22values%22%3A%5B%22undefined%22%5D%7D%7D%7D`,
    );
    const body = await response.text();

    expect(response.ok).toBe(true);
    expect(body).toContain('"result"');
    expect(body).not.toContain('Failed query');
  });
});
