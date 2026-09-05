# Export and Backend Handoff

## What this project contains

This is a full-stack React and TypeScript application. The browser UI is in `client/`; the Express server and tRPC API are in `server/`; the Drizzle/MySQL schema is in `drizzle/schema.ts`; shared types are in `shared/`; and the S3 storage adapter is in `server/storage.ts`.

The public website reads published content through the server-side `public.snapshot` procedure. The CMS uses standalone credential authentication, signed HTTP-only sessions, role checks, and protected tRPC procedures. Super Admins manage CMS accounts, settings, SEO, and all content. Content Managers manage content but do not receive Super Admin settings, SEO, or account controls.

## How the backend works

| Concern | Current implementation | What it needs outside Manus |
|---|---|---|
| Web server | Express starts from `server/_core/index.ts` and exposes the tRPC API under `/api/trpc`. | A Node.js runtime that can run the built `dist/index.js` process and route HTTPS traffic to it. |
| Frontend | Vite builds the React client into static assets. | A static asset host or the same Node process serving the built assets. |
| Database | Drizzle ORM connects to MySQL/TiDB through `DATABASE_URL`. CMS records are database-backed. | A separate MySQL-compatible database, schema application, and a data export/import from the current database. |
| Authentication | CMS passwords are salted and hashed; sessions use `JWT_SECRET` and an HTTP-only cookie. | A strong new `JWT_SECRET`, the CMS user rows/password hashes, HTTPS, and the same cookie domain policy. Never copy secrets into source control. |
| File storage | `server/storage.ts` requests Manus Forge presigned S3 URLs and serves `/manus-storage/{key}` redirects. | An external S3-compatible bucket and a replacement storage adapter, or a compatible Forge endpoint. Existing media bytes must be copied separately; source export alone does not include them. |
| SEO and public discovery | Express generates route-aware HTML metadata, `robots.txt`, and `sitemap.xml`. | Set the public origin configuration and ensure the reverse proxy forwards the visitor host/protocol. |
| Analytics | The client uses the configured analytics endpoint and website ID when present. | Keep, replace, or disable analytics deliberately and update the client environment values. |

## What an export does and does not preserve

An application-code export preserves the source files, package manifest, lockfile, tests, schema definitions, and server/client implementation. It does **not** by itself move the live MySQL rows, CMS credentials, uploaded S3 objects, managed environment secrets, DNS, TLS certificates, or Manus-specific Forge storage service.

The CMS content is not reset by ordinary code releases because it is stored in MySQL. When moving providers, the database and media must be migrated as a coordinated operation. Keep the current Manus site running until the replacement has been restored and verified.

## Verified local commands

From the project root:

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
NODE_ENV=production PORT=3000 node dist/index.js
```

The server respects `PORT` and also searches for an available port during startup. In production, put a reverse proxy or managed HTTPS service in front of the Node process. Do not expose the database directly to the public internet.

## Required environment configuration

The following server-side values are required or conditionally required by the current implementation:

| Variable | Purpose | Export action |
|---|---|---|
| `DATABASE_URL` | MySQL/TiDB connection string for CMS and public content. | Create a new least-privilege database user and set the new connection string. |
| `JWT_SECRET` | Signs CMS sessions. | Generate a new high-entropy secret; existing sessions should be invalidated during cutover. |
| `CMS_SETUP_TOKEN` | Protects first Super Admin setup. | Set a one-time setup value, complete setup, then remove or rotate it according to the deployment policy. |
| `PUBLIC_SITE_URL` | Optional stable origin for canonical URLs, robots, and sitemap output. | Set it to the final HTTPS domain; otherwise forwarded host headers are used. |
| `BUILT_IN_FORGE_API_URL` and `BUILT_IN_FORGE_API_KEY` | Current Manus Forge presign service used by `server/storage.ts`. | Replace the storage adapter and use external S3 variables, or keep an equivalent compatible service. Do not publish this key. |
| `OWNER_OPEN_ID`, `OWNER_NAME` | Legacy owner identity values used by shared template paths. | Review whether they are still needed in the target deployment and set safe values if retained. |
| `VITE_ANALYTICS_ENDPOINT`, `VITE_ANALYTICS_WEBSITE_ID` | Optional client analytics configuration. | Keep only if the analytics destination is intended for the new domain. |

Some `VITE_*` values are embedded into the browser bundle. Only place public values there. Database URLs, JWT secrets, setup tokens, Forge/S3 keys, and password material must remain server-side.

## Recommended migration sequence

1. Export the repository through the Manus project code export or GitHub integration. Keep the private repository private.
2. Provision a MySQL-compatible database, an S3-compatible bucket, and a Node.js host. Configure HTTPS and a private network path from the server to the database.
3. Apply the schema from `drizzle/schema.ts` using the project’s migration process. Do not run a destructive migration against the current production database. Export and import the current CMS tables separately, preserving IDs, statuses, timestamps, SEO records, settings, and user password hashes.
4. Copy all objects referenced by `featuredImageKey`, `photoKey`, `mediaKey`, `fileKey`, and related CMS metadata into the new bucket. Update stored URLs or replace the storage adapter so `/manus-storage/...` resolves through the new service.
5. Set the server environment variables, create or verify the Super Admin account, and rotate session secrets. Do not send credentials through chat or commit them to Git.
6. Run `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm test`, and `pnpm build`. Start the production server and verify the homepage, public snapshot, robots file, sitemap, CMS login, draft preview, publish/unpublish flow, and media access.
7. Compare the replacement sitemap and canonical URLs with the final domain. Only after database, media, authentication, and CMS workflows pass should DNS be pointed to the replacement host.

## Practical recommendation

For this project, the simplest operational path is to keep hosting and the database on Manus unless there is a specific requirement for another provider. If the goal is code ownership or backup, export the repository and separately back up the database and S3 media. A code download alone is not a complete website migration.

If the goal is a third-party deployment, the main engineering work is **storage-provider replacement and data migration**, not rebuilding the React pages. The tRPC contracts and Drizzle data layer can remain, but the current Manus Forge presign calls in `server/storage.ts` are Manus-specific and must be replaced before external production use.
