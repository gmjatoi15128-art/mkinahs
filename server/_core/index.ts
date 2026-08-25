import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { getPublicSnapshot } from "../db";

function xmlEscape(value: string) {
  return value.replace(/[<>&'\"]/g, character => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", "\"": "&quot;" })[character] || character);
}

function publicBaseUrl(req: express.Request) {
  const configured = process.env.PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (configured) return configured;
  const protocol = String(req.headers["x-forwarded-proto"] || req.protocol).split(",")[0] || "https";
  const visitorHost = String(req.headers["x-forwarded-host"] || req.get("host")).split(",")[0].trim();
  return `${protocol}://${visitorHost}`;
}

function isoDate(value: Date | null | undefined) {
  return value ? value.toISOString() : undefined;
}

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  app.set("trust proxy", 1);
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  app.get("/robots.txt", (req, res) => {
    res.type("text/plain").send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /cms-login\nDisallow: /cms-setup\nDisallow: /cms-preview/\nDisallow: /api/\nSitemap: ${publicBaseUrl(req)}/sitemap.xml\n`);
  });
  app.get("/sitemap.xml", async (req, res) => {
    const snapshot = await getPublicSnapshot();
    const baseUrl = publicBaseUrl(req);
    const staticPaths = ["", "/about", "/programs", "/admissions", "/faculty", "/facilities", "/clinical-training", "/student-life", "/gallery", "/news", "/events", "/downloads", "/contact"];
    const staticUrls = staticPaths.map(path => ({ path, lastModified: undefined }));
    const dynamicUrls = [
      ...snapshot.programs.map(item => ({ path: `/programs/${item.slug}`, lastModified: isoDate(item.updatedAt) })),
      ...snapshot.faculty.map(item => ({ path: `/faculty/${item.slug}`, lastModified: isoDate(item.updatedAt) })),
      ...snapshot.news.map(item => ({ path: `/news/${item.slug}`, lastModified: isoDate(item.updatedAt) || isoDate(item.publishedAt) })),
      ...snapshot.events.map(item => ({ path: `/events/${item.slug}`, lastModified: isoDate(item.updatedAt) || isoDate(item.publishedAt) })),
      ...snapshot.pages.filter(item => !["about", "student-life"].includes(item.slug)).map(item => ({ path: `/${item.slug}`, lastModified: isoDate(item.updatedAt) || isoDate(item.publishedAt) })),
    ];
    const urls = [...staticUrls, ...dynamicUrls].map(({ path, lastModified }) => `<url><loc>${xmlEscape(`${baseUrl}${path}`)}</loc>${lastModified ? `<lastmod>${lastModified}</lastmod>` : ""}</url>`).join("");
    res.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
  });
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
