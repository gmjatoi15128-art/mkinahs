import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(role: "user" | "content_manager" | "super_admin"): TrpcContext {
  return {
    user: {
      id: 11,
      openId: `test-${role}`,
      name: "Test Administrator",
      email: "test@example.invalid",
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("CMS access controls", () => {
  it("blocks an ordinary authenticated user from the CMS overview", async () => {
    const caller = appRouter.createCaller(createContext("user"));
    await expect(caller.cms.overview()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.cms.preview({ target: "programs", id: 1 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("blocks a Content Manager from Super Admin-only website settings", async () => {
    const caller = appRouter.createCaller(createContext("content_manager"));
    await expect(caller.cms.settings.upsert({ key: "contact", label: "Contact", value: {} })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("blocks a Content Manager from CMS account management", async () => {
    const caller = appRouter.createCaller(createContext("content_manager"));
    await expect(caller.cms.accounts.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.cms.accounts.createContentManager({ name: "Blocked Account", email: "blocked@example.invalid", password: "A secure test password" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.cms.accounts.setContentManagerActive({ id: 99, isActive: false })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.cms.accounts.resetContentManagerPassword({ id: 99, password: "Another secure test password" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
