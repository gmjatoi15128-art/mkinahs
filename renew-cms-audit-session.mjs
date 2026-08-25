import { writeFile } from "node:fs/promises";
import { SignJWT } from "jose";

const secret = process.env.JWT_SECRET;
if (!secret) throw new Error("CMS session secret is not configured");

const token = await new SignJWT({ purpose: "cms" })
  .setProtectedHeader({ alg: "HS256", typ: "JWT" })
  .setSubject("420001")
  .setIssuedAt()
  .setExpirationTime("12h")
  .sign(new TextEncoder().encode(secret));

await writeFile("/tmp/mk-cms-cookie.txt", `mk_cms_session=${token}\n`, { mode: 0o600 });
console.log("Authorized CMS audit session renewed");
