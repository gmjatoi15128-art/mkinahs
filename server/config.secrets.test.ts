import { describe, expect, it } from "vitest";
import { safePublicQuery } from "./db";
import { buildSeoHead } from "./_core/seo";

describe("application configuration", () => {
  it("returns an empty fallback when one public CMS query fails", async () => {
    const records = await safePublicQuery(
      "programs",
      Promise.reject(new Error("simulated table failure")),
      [] as Array<{ status: "published" }>
    );
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
    expect(head.tags).toContain(
      "<title>Programs | MK Institute of Nursing and Allied Health Sciences</title>"
    );
    expect(head.tags).toContain('name="robots" content="index, follow"');
  });
});
