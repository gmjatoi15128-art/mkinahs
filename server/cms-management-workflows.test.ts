import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const admin = readFileSync(new URL("../client/src/pages/Admin.tsx", import.meta.url), "utf8");
const workspaces = readFileSync(new URL("../client/src/components/CmsWorkspaces.tsx", import.meta.url), "utf8");
const routes = readFileSync(new URL("../client/src/App.tsx", import.meta.url), "utf8");

describe("CMS management workflow safeguards", () => {
  it("keeps guided settings non-destructive and exposes all configured homepage settings", () => {
    expect(workspaces).toContain("...objectValue(identityRecord?.value)");
    expect(workspaces).toContain("...objectValue(contactRecord?.value)");
    expect(workspaces).toContain('record("hero")');
    expect(workspaces).toContain('record("homepage_about")');
    expect(workspaces).toContain("Save homepage hero");
    expect(workspaces).toContain("Save about preview");
  });

  it("supports editing saved pages and renders additional CMS pages without route-specific code", () => {
    expect(workspaces).toContain("id: draft.id");
    expect(workspaces).toContain("Update page");
    expect(routes).toContain('<Route path="/:slug" component={CmsContentPage} />');
  });

  it("derives a valid server record slug for every guided content module", () => {
    expect(admin).toContain("const recordSlug = draft.slug.trim() || slugify(draft.title)");
    expect(admin).toContain("slug: recordSlug");
  });
});
