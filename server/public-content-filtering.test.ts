import { describe, expect, it } from "vitest";
import { publishedDetail, publishedOnly } from "./db";

describe("public content visibility safeguards", () => {
  it("excludes draft, scheduled, and archived records from public snapshots", () => {
    const records = [
      { id: 1, status: "published" as const }, { id: 2, status: "draft" as const },
      { id: 3, status: "scheduled" as const }, { id: 4, status: "archived" as const },
    ];
    expect(publishedOnly(records)).toEqual([{ id: 1, status: "published" }]);
  });

  it("withholds non-published dynamic detail records at runtime", () => {
    expect(publishedDetail({ id: 1, status: "published" as const })).toEqual({ id: 1, status: "published" });
    expect(publishedDetail({ id: 2, status: "draft" as const })).toBeNull();
    expect(publishedDetail({ id: 3, status: "scheduled" as const })).toBeNull();
    expect(publishedDetail({ id: 4, status: "archived" as const })).toBeNull();
  });
});
