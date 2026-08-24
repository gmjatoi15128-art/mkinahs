import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { SignJWT, jwtVerify } from "jose";
import type { Request, Response } from "express";
import { ENV } from "./_core/env";
import { getSessionCookieOptions } from "./_core/cookies";
import { getCmsUserById } from "./db";

const scrypt = promisify(scryptCallback);
export const CMS_SESSION_COOKIE = "mk_cms_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 12;
const attempts = new Map<string, { count: number; resetAt: number }>();

function secret() {
  return new TextEncoder().encode(ENV.cookieSecret);
}

function readCookie(req: Request, key: string) {
  const pair = req.headers.cookie?.split(";").map(part => part.trim()).find(part => part.startsWith(`${key}=`));
  return pair ? decodeURIComponent(pair.slice(key.length + 1)) : undefined;
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function createCmsOpenId(email: string) {
  return `cms_${createHash("sha256").update(normalizeEmail(email)).digest("hex").slice(0, 56)}`;
}

export async function hashCmsPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, 64) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyCmsPassword(password: string, storedHash: string | null) {
  if (!storedHash) return false;
  const [salt, expected] = storedHash.split(":");
  if (!salt || !expected) return false;
  const actual = await scrypt(password, salt, 64) as Buffer;
  const expectedBuffer = Buffer.from(expected, "hex");
  return expectedBuffer.length === actual.length && timingSafeEqual(expectedBuffer, actual);
}

export function canAttemptLogin(key: string) {
  const entry = attempts.get(key);
  const now = Date.now();
  if (!entry || entry.resetAt < now) return true;
  return entry.count < 8;
}

export function recordFailedLogin(key: string) {
  const now = Date.now();
  const current = attempts.get(key);
  const next = !current || current.resetAt < now ? { count: 1, resetAt: now + 15 * 60 * 1000 } : { ...current, count: current.count + 1 };
  attempts.set(key, next);
}

export function clearLoginAttempts(key: string) {
  attempts.delete(key);
}

export function verifyCmsSetupToken(candidate: string) {
  const configured = ENV.cmsSetupToken;
  if (!configured || !candidate) return false;
  const expected = Buffer.from(configured);
  const actual = Buffer.from(candidate);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function issueCmsSession(res: Response, req: Request, userId: number) {
  const token = await new SignJWT({ purpose: "cms" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(secret());
  res.cookie(CMS_SESSION_COOKIE, token, { ...getSessionCookieOptions(req), maxAge: SESSION_DURATION_SECONDS * 1000 });
}

export function clearCmsSession(res: Response, req: Request) {
  res.clearCookie(CMS_SESSION_COOKIE, { ...getSessionCookieOptions(req), maxAge: -1 });
}

export async function getCmsSessionUser(req: Request) {
  const token = readCookie(req, CMS_SESSION_COOKIE);
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (payload.purpose !== "cms" || typeof payload.sub !== "string" || !/^\d+$/.test(payload.sub)) return null;
    const user = await getCmsUserById(Number(payload.sub));
    return user?.isActive && user.passwordHash ? user : null;
  } catch {
    return null;
  }
}
