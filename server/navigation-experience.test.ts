import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const dashboard = readFileSync(new URL("../client/src/components/DashboardLayout.tsx", import.meta.url), "utf8");
const admin = readFileSync(new URL("../client/src/pages/Admin.tsx", import.meta.url), "utf8");
const mobileNavigation = readFileSync(new URL("../client/src/components/PublicLayout.tsx", import.meta.url), "utf8");
const routeExperience = readFileSync(new URL("../client/src/components/PublicRouteExperience.tsx", import.meta.url), "utf8");
const publicPages = readFileSync(new URL("../client/src/pages/PublicPages.tsx", import.meta.url), "utf8");
const publicLayout = readFileSync(new URL("../client/src/components/PublicLayout.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../client/src/index.css", import.meta.url), "utf8");

describe("CMS and public navigation experience", () => {
  it("closes the supported mobile CMS drawer after selecting a navigation destination", () => {
    expect(dashboard).toContain("const { setOpenMobile } = useSidebar()");
    expect(dashboard).toContain("setOpenMobile(false); onNavigate?.(path);");
    expect(dashboard).toContain("isActive={item.path === activePath}");
    expect(admin).toContain('group: "Workspace"');
    expect(admin).toContain('group: "Content"');
  });

  it("keeps mobile public navigation client-side and provides accessible route feedback", () => {
    expect(mobileNavigation).toContain("<Link key={href} onClick={onNavigate} href={href}");
    expect(routeExperience).toContain("window.scrollTo({ top: 0, behavior: \"auto\" })");
    expect(routeExperience).toContain('aria-live="polite"');
    expect(routeExperience).toContain("public-route-progress");
  });

  it("shows a retryable, non-technical backend error state instead of silently rendering stale content", () => {
    expect(publicLayout).toContain("BackendErrorNotice");
    expect(publicLayout).toContain("The latest institute information could not be loaded");
    expect(publicPages).toContain("isError ? <BackendErrorNotice onRetry={() => void refetch()} />");
    expect(admin).toContain('title="CMS content is temporarily unavailable"');
  });

  it("uses real request state for public loading feedback and keeps common CMS actions explicit", () => {
    expect(publicPages).toContain("function PublicRouteLoading");
    expect(publicPages).toContain("isLoading ? <PublicRouteLoading");
    expect(publicPages).toContain('aria-busy="true"');
    expect(admin).toContain("Save private draft");
    expect(admin).toContain("Save & publish");
    expect(admin).toContain(">Edit</Button>");
    expect(styles).toContain("skeleton-sheen");
    expect(styles).toContain("prefers-reduced-motion: reduce");
  });
});
