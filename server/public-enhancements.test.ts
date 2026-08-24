import { describe, expect, it } from "vitest";
import { filterDownloadsByCategory, hasApprovedContactAction, shouldShowAdmissionsBanner } from "../client/src/lib/publicEnhancements";

describe("selected public-site enhancements", () => {
  it("only enables public contact actions when an approved call or WhatsApp value exists", () => {
    expect(hasApprovedContactAction("", "")).toBe(false);
    expect(hasApprovedContactAction("  ", null)).toBe(false);
    expect(hasApprovedContactAction("+92 300 0000000", "")).toBe(true);
    expect(hasApprovedContactAction("", "923000000000")).toBe(true);
  });

  it("keeps admissions banners hidden unless enabled with both approved title and message", () => {
    expect(shouldShowAdmissionsBanner({ enabled: false, title: "Admissions", message: "Approved dates" })).toBe(false);
    expect(shouldShowAdmissionsBanner({ enabled: true, title: "", message: "Approved dates" })).toBe(false);
    expect(shouldShowAdmissionsBanner({ enabled: "true", title: "Admissions", message: "Approved dates" })).toBe(true);
  });

  it("filters published download rows by category and produces an empty result for a missing category", () => {
    const downloads = [{ id: 1, category: "Prospectus" }, { id: 2, category: "Forms" }, { id: 3, category: "Prospectus" }];
    expect(filterDownloadsByCategory(downloads, "all")).toHaveLength(3);
    expect(filterDownloadsByCategory(downloads, "Prospectus").map(document => document.id)).toEqual([1, 3]);
    expect(filterDownloadsByCategory(downloads, "Notices")).toEqual([]);
  });
});
