import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("public institutional messaging", () => {
  const publicPages = readFileSync(new URL("../client/src/pages/PublicPages.tsx", import.meta.url), "utf8");
  const home = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");
  const layout = readFileSync(new URL("../client/src/components/PublicLayout.tsx", import.meta.url), "utf8");
  const publicCopy = `${publicPages}\n${home}\n${layout}`;

  it("does not reintroduce provisional empty-state language in public-facing components", () => {
    ["will appear here", "being developed", "will grow as", "to be announced", "when confirmed", "will be introduced", "will be shared"].forEach(phrase => expect(publicCopy.toLowerCase()).not.toContain(phrase));
    expect(publicCopy).toContain("Please contact the institute");
  });
});
