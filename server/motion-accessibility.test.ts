import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("institutional motion accessibility", () => {
  const styles = readFileSync(new URL("../client/src/index.css", import.meta.url), "utf8");

  it("keeps the refined motion hooks and a reduced-motion fallback together", () => {
    expect(styles).toContain("hero-atmosphere");
    expect(styles).toContain("hero-copy-reveal");
    expect(styles).toContain("press-ticker-track:hover");
    expect(styles).toContain("@media (prefers-reduced-motion: reduce)");
    expect(styles).toContain("animation-duration: .01ms !important");
  });
});
