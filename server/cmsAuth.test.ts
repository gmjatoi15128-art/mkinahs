import { describe, expect, it } from "vitest";
import { canAttemptLogin, clearLoginAttempts, createCmsOpenId, hashCmsPassword, normalizeEmail, recordFailedLogin, verifyCmsPassword } from "./cmsAuth";

describe("standalone CMS credentials", () => {
  it("normalizes email addresses into stable non-secret CMS identifiers", () => {
    expect(normalizeEmail("  Admin@Example.test ")).toBe("admin@example.test");
    expect(createCmsOpenId("Admin@Example.test")).toBe(createCmsOpenId("admin@example.test"));
    expect(createCmsOpenId("admin@example.test")).not.toContain("admin@example.test");
  });

  it("hashes passwords with a salt and verifies only the original password", async () => {
    const hash = await hashCmsPassword("A secure standalone CMS password");
    expect(hash).toContain(":");
    expect(await verifyCmsPassword("A secure standalone CMS password", hash)).toBe(true);
    expect(await verifyCmsPassword("incorrect password", hash)).toBe(false);
  });

  it("limits repeated failed sign-in attempts for an account and source pair", () => {
    const key = "test-source:admin@example.test";
    clearLoginAttempts(key);
    expect(canAttemptLogin(key)).toBe(true);
    for (let index = 0; index < 8; index += 1) recordFailedLogin(key);
    expect(canAttemptLogin(key)).toBe(false);
    clearLoginAttempts(key);
    expect(canAttemptLogin(key)).toBe(true);
  });
});
