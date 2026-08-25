import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Router } from "wouter";
import { PublicMobileMenu } from "../client/src/components/PublicLayout";

describe("public institutional messaging", () => {
  const publicPages = readFileSync(new URL("../client/src/pages/PublicPages.tsx", import.meta.url), "utf8");
  const home = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");
  const layout = readFileSync(new URL("../client/src/components/PublicLayout.tsx", import.meta.url), "utf8");
  const publicCopy = `${publicPages}\n${home}\n${layout}`;

  it("does not reintroduce provisional empty-state language in public-facing components", () => {
    ["will appear here", "being developed", "will grow as", "to be announced", "when confirmed", "will be introduced", "will be shared"].forEach(phrase => expect(publicCopy.toLowerCase()).not.toContain(phrase));
    expect(publicCopy).toContain("Please contact the institute");
  });

  it("retains the final route-specific institutional guidance for key unavailable states", () => {
    expect(publicPages).toContain("Programme unavailable");
    expect(publicPages).toContain("Notice unavailable");
    expect(publicPages).toContain("Events calendar");
    expect(publicPages).toContain("For current programme availability, requirements, dates, fees, and prospectus guidance");
    expect(publicPages).toContain("Public contact details are not listed at this time");
    expect(home).toContain("Explore academic pathways, institute information, and admissions guidance.");
  });

  it("keeps an explicit Home destination in the shared public navigation", () => {
    expect(layout).toContain('["Home", "/"]');
    expect(layout).toContain("Mobile navigation");
    expect(layout).toContain("Primary navigation");
    const mobileMenuSource = layout.slice(layout.indexOf('aria-label="Mobile navigation"'), layout.indexOf('aria-label="Mobile navigation"') + 900);
    expect(mobileMenuSource).toContain("mainNavigation.map");
    expect(mobileMenuSource).toContain('href={href}');
  });

  it("renders Home in the opened mobile navigation menu with the homepage route", () => {
    const markup = renderToStaticMarkup(createElement(Router, { hook: () => ["/", () => undefined] }, createElement(PublicMobileMenu, { onNavigate: () => undefined })));
    expect(markup).toContain('aria-label="Mobile navigation"');
    expect(markup).toMatch(/<a[^>]*href="\/"[^>]*>Home/);
  });
});
