import type { Request } from "express";
import { describe, expect, it } from "vitest";
import { buildSeoHead } from "./_core/seo";

function requestFor(path: string): Request {
  return {
    originalUrl: path,
    protocol: "https",
    headers: {},
    get: (header: string) => header.toLowerCase() === "host" ? "example.test" : undefined,
  } as unknown as Request;
}

describe("crawler-visible route metadata", () => {
  it("creates route-specific indexable metadata for public pages", async () => {
    const result = await buildSeoHead(requestFor("/about"));
    expect(result.notFound).toBe(false);
    expect(result.tags).toContain("About the Institute | MK Institute of Nursing and Allied Health Sciences");
    expect(result.tags).toContain('rel="canonical" href="https://example.test/about"');
    expect(result.tags).toContain('meta name="robots" content="index, follow"');
    expect(result.tags).toContain('application/ld+json');
  });

  it("marks missing detail records as noindex metadata for a real 404 response", async () => {
    const result = await buildSeoHead(requestFor("/programs/missing-record"));
    expect(result.notFound).toBe(true);
    expect(result.tags).toContain('meta name="robots" content="noindex, follow"');
    expect(result.tags).toContain("Information centre | MK Institute of Nursing and Allied Health Sciences");
  });
});
