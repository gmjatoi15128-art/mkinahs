import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return { user: null, req: { headers: {}, ip: "127.0.0.1" } as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("CMS bootstrap secret", () => {
  it("validates the supplied bootstrap secret and rejects a different token", async () => {
    const token = process.env.CMS_SETUP_TOKEN;
    expect(token).toBeTruthy();
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.auth.bootstrap.validate({ setupToken: token! })).resolves.toEqual({ valid: true });
    await expect(caller.auth.bootstrap.validate({ setupToken: `${token}-incorrect` })).resolves.toEqual({ valid: false });
  });

  it("locks the first-admin setup endpoint after a CMS account has been provisioned", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.auth.setup({
      name: "Blocked setup attempt",
      email: "blocked-setup@example.test",
      password: "A secure test password",
      setupToken: process.env.CMS_SETUP_TOKEN!,
    })).rejects.toThrow("A CMS Super Admin account already exists");
  });
});
