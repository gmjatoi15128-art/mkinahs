import { readFile, writeFile } from "node:fs/promises";

const cookie = (await readFile("/tmp/mk-cms-cookie.txt", "utf8")).trim();
const baseUrl = "http://127.0.0.1:3000/api/trpc";
const auditPrefix = "qa-launch-audit";

async function call(path, payload) {
  const response = await fetch(`${baseUrl}/${path}?batch=1`, { method: "POST", headers: { "content-type": "application/json", cookie }, body: JSON.stringify({ 0: { json: payload } }) });
  const body = await response.text();
  if (!response.ok || !body.includes("result")) throw new Error(`${path} failed: ${response.status}`);
  return body;
}

const drafts = [
  ["faculty", { title: "QA Launch Audit Faculty", slug: `${auditPrefix}-faculty`, description: "Temporary private audit record.", status: "draft", sortOrder: 999, metadata: { designation: "QA reviewer" } }],
  ["facilities", { title: "QA Launch Audit Facility", slug: `${auditPrefix}-facility`, description: "Temporary private audit record.", status: "draft", sortOrder: 999, metadata: {} }],
  ["clinicalTraining", { title: "QA Launch Audit Clinical Training", slug: `${auditPrefix}-clinical`, description: "Temporary private audit record.", status: "draft", sortOrder: 999, metadata: { sectionType: "qa-audit" } }],
  ["hospitalAffiliations", { title: "QA Launch Audit Affiliation", slug: `${auditPrefix}-affiliation`, description: "Temporary private audit record.", status: "draft", sortOrder: 999, metadata: {} }],
  ["galleryCategories", { title: "QA Launch Audit Gallery Category", slug: `${auditPrefix}-gallery-category`, description: "Temporary private audit record.", status: "draft", sortOrder: 999, metadata: {} }],
  ["galleryImages", { title: "QA Launch Audit Gallery Image", slug: `${auditPrefix}-gallery-image`, description: "Temporary private audit record.", status: "draft", sortOrder: 999, metadata: { mediaUrl: "https://example.invalid/qa-launch-audit.jpg", mediaKey: "qa/launch-audit.jpg", altText: "Temporary private audit image" } }],
  ["newsArticles", { title: "QA Launch Audit Notice", slug: `${auditPrefix}-notice`, description: "Temporary private audit record.", status: "draft", sortOrder: 999, metadata: { category: "QA", content: "Temporary private audit notice." } }],
  ["events", { title: "QA Launch Audit Event", slug: `${auditPrefix}-event`, description: "Temporary private audit record.", status: "draft", sortOrder: 999, metadata: { eventStatus: "upcoming", location: "QA only" } }],
  ["downloads", { title: "QA Launch Audit Download", slug: `${auditPrefix}-download`, description: "Temporary private audit record.", status: "draft", sortOrder: 999, metadata: { category: "QA", fileUrl: "https://example.invalid/qa-launch-audit.pdf", fileKey: "qa/launch-audit.pdf" } }],
];

const completed = [];
for (const [module, record] of drafts) {
  await call("cms.save", { module, record });
  completed.push(module);
}

await writeFile("/tmp/cms-workflow-audit.json", JSON.stringify({ completed }, null, 2));
console.log(`Saved controlled drafts for ${completed.length} CMS modules`);
