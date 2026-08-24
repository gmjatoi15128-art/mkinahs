import { describe, expect, it, vi, beforeEach } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({
  upsertSiteSetting: vi.fn(),
  listCmsUsers: vi.fn(),
  getCmsUserByEmail: vi.fn(),
  createCmsUser: vi.fn(),
  setContentManagerActive: vi.fn(),
  resetContentManagerPassword: vi.fn(),
}));

vi.mock("./db", async importOriginal => {
  const actual = await importOriginal<typeof import("./db")>();
  return { ...actual, ...mocks };
});

import { appRouter } from "./routers";

function createSuperAdminContext(): TrpcContext {
  return {
    user: {
      id: 91,
      openId: "super-admin-test",
      name: "Super Admin",
      email: "super.admin@example.invalid",
      loginMethod: "cms",
      role: "super_admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

const accountRow = {
  id: 32,
  openId: "cms-account-test",
  name: "Content Manager",
  email: "manager@example.invalid",
  loginMethod: "cms",
  role: "content_manager",
  passwordHash: "scrypt$never-return-this",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

describe("CMS Super Admin success paths", () => {
  beforeEach(() => vi.clearAllMocks());

  it("stores guided website settings with the authenticated administrator as owner", async () => {
    mocks.upsertSiteSetting.mockResolvedValue({ id: 7, key: "contact" });
    const caller = appRouter.createCaller(createSuperAdminContext());

    const result = await caller.cms.settings.upsert({ key: "contact", label: "Contact details", description: "Approved public contact information", value: { email: "office@example.invalid" } });

    expect(result).toEqual({ id: 7, key: "contact" });
    expect(mocks.upsertSiteSetting).toHaveBeenCalledWith({ key: "contact", label: "Contact details", description: "Approved public contact information", value: { email: "office@example.invalid" }, userId: 91 });
  });

  it("lists and creates Content Manager accounts without exposing password hashes", async () => {
    mocks.listCmsUsers.mockResolvedValue([accountRow]);
    mocks.getCmsUserByEmail.mockResolvedValue(null);
    mocks.createCmsUser.mockResolvedValue(accountRow);
    const caller = appRouter.createCaller(createSuperAdminContext());

    await expect(caller.cms.accounts.list()).resolves.toEqual([expect.not.objectContaining({ passwordHash: expect.anything() })]);
    await expect(caller.cms.accounts.createContentManager({ name: "Content Manager", email: "MANAGER@example.invalid", password: "A sufficiently secure test password" })).resolves.toEqual(expect.not.objectContaining({ passwordHash: expect.anything() }));
    expect(mocks.getCmsUserByEmail).toHaveBeenCalledWith("manager@example.invalid");
    expect(mocks.createCmsUser).toHaveBeenCalledWith(expect.objectContaining({ name: "Content Manager", email: "manager@example.invalid", role: "content_manager", passwordHash: expect.stringContaining(":") }));
  });

  it("updates publishing access and resets a Content Manager password without exposing the hash", async () => {
    const suspendedAccount = { ...accountRow, isActive: false };
    mocks.setContentManagerActive.mockResolvedValue(suspendedAccount);
    mocks.resetContentManagerPassword.mockResolvedValue(suspendedAccount);
    const caller = appRouter.createCaller(createSuperAdminContext());

    await expect(caller.cms.accounts.setContentManagerActive({ id: 32, isActive: false })).resolves.toEqual(expect.not.objectContaining({ passwordHash: expect.anything(), isActive: true }));
    await expect(caller.cms.accounts.resetContentManagerPassword({ id: 32, password: "A fresh temporary password" })).resolves.toEqual(expect.not.objectContaining({ passwordHash: expect.anything() }));
    expect(mocks.setContentManagerActive).toHaveBeenCalledWith(32, false);
    expect(mocks.resetContentManagerPassword).toHaveBeenCalledWith(32, expect.stringContaining(":"));
  });
});
