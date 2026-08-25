import { Link, useLocation, useParams } from "wouter";
import { ArrowLeft, Eye, FileText, LockKeyhole } from "lucide-react";
import { PublicLayout, PageHero } from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";

const previewTargets = ["programs", "faculty", "facilities", "clinicalTraining", "hospitalAffiliations", "galleryCategories", "galleryImages", "newsArticles", "events", "downloads", "pages"] as const;
type PreviewTarget = (typeof previewTargets)[number];

const targetLabels: Record<PreviewTarget, string> = {
  programs: "Programme", faculty: "Faculty profile", facilities: "Facility", clinicalTraining: "Clinical learning item", hospitalAffiliations: "Affiliation", galleryCategories: "Gallery category", galleryImages: "Gallery image", newsArticles: "News or notice", events: "Event", downloads: "Download", pages: "Information page",
};

function text(...values: unknown[]) {
  return values.find(value => typeof value === "string" && value.trim()) as string | undefined;
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function CmsPreview() {
  const params = useParams<{ target: string; id: string }>();
  const [location] = useLocation();
  const target = previewTargets.includes(params.target as PreviewTarget) ? params.target as PreviewTarget : null;
  const id = Number(params.id);
  const enabled = Boolean(target && Number.isInteger(id) && id > 0);
  const preview = trpc.cms.preview.useQuery({ target: target ?? "pages", id: Number.isInteger(id) && id > 0 ? id : 1 }, { enabled });
  const snapshot = trpc.public.snapshot.useQuery();

  if (!target || !Number.isInteger(id) || id <= 0) return <PreviewNotice title="Preview unavailable" description="This preview address is not valid." />;
  if (preview.isLoading || snapshot.isLoading) return <div className="grid min-h-screen place-items-center bg-paper text-sm font-semibold text-slate-600">Loading secure preview…</div>;
  if (preview.error) return <PreviewNotice title="Preview access required" description="Sign in to the CMS with an authorized staff account to view saved drafts and unpublished content." />;
  if (!preview.data) return <PreviewNotice title="Preview unavailable" description="This saved record is no longer available. Return to the CMS library and select another item." />;

  const record = preview.data as Record<string, unknown>;
  const title = text(record.name, record.title, record.caption, "Untitled content")!;
  const description = text(record.overview, record.biography, record.excerpt, record.description, record.altText);
  const body = text(record.content);
  const imageUrl = text(record.featuredImageUrl, record.photoUrl, record.imageUrl, record.mediaUrl, record.logoUrl);
  const sections = asObject(record.sections);
  const blocks = Array.isArray(sections.blocks) ? sections.blocks.map(asObject) : [];
  const fields = [
    ["Category", text(record.category)], ["Designation", text(record.designation)], ["Qualification", text(record.qualification)], ["Duration", text(record.duration)], ["Eligibility", text(record.eligibility)], ["Location", text(record.location)], ["Status", text(record.eventStatus)], ["Date", record.startsAt ? new Date(record.startsAt as string).toLocaleString() : undefined],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));

  return <PublicLayout settings={snapshot.data?.settings} seo={[{ path: location, title: `Preview: ${title}`, description: "Protected CMS preview.", indexable: false }]} title={`Preview: ${title}`} description="Protected CMS preview">
    <aside className="border-b border-amber-300 bg-amber-50"><div className="container flex flex-col gap-3 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"><p className="flex items-center gap-2 font-bold text-amber-950"><LockKeyhole className="h-4 w-4" />Private CMS preview — this content is not public until you publish it.</p><Link href="/admin" className="inline-flex items-center gap-2 font-bold text-teal-900 hover:text-navy"><ArrowLeft className="h-4 w-4" />Return to CMS</Link></div></aside>
    <PageHero eyebrow={`${targetLabels[target]} preview`} title={title} description={description || "Review this saved item before publishing it to the public website."} />
    <main className="container grid gap-8 py-12 lg:grid-cols-[minmax(0,1fr)_280px]">
      <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
        {imageUrl ? <img src={imageUrl} alt={text(record.altText, title)!} className="mb-8 aspect-[16/8] w-full rounded-xl object-cover" /> : null}
        {body ? <div className="whitespace-pre-wrap text-base leading-8 text-slate-700">{body}</div> : null}
        {text(sections.description) ? <p className="text-lg leading-8 text-slate-700">{text(sections.description)}</p> : null}
        {blocks.length ? <div className="mt-8 grid gap-4 sm:grid-cols-2">{blocks.map((block, index) => <section key={`${text(block.title, "section")}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-5"><h2 className="font-bold text-navy">{text(block.title, `Highlight ${index + 1}`)}</h2>{text(block.description) ? <p className="mt-2 text-sm leading-6 text-slate-600">{text(block.description)}</p> : null}</section>)}</div> : null}
        {!body && !text(sections.description) && !blocks.length ? <p className="text-base leading-8 text-slate-700">{description || "This saved CMS item is ready for review. Add approved details in the CMS before publishing."}</p> : null}
      </article>
      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-2 text-navy"><Eye className="h-5 w-5" /><h2 className="font-bold">Preview status</h2></div><dl className="mt-5 grid gap-4 text-sm"><div><dt className="text-slate-500">Visibility</dt><dd className="mt-1 font-bold capitalize text-navy">{text(record.status, "draft")}</dd></div><div><dt className="text-slate-500">Content type</dt><dd className="mt-1 font-bold text-navy">{targetLabels[target]}</dd></div>{fields.map(([label, value]) => <div key={label}><dt className="text-slate-500">{label}</dt><dd className="mt-1 font-semibold text-navy">{value}</dd></div>)}</dl><p className="mt-6 rounded-xl bg-teal-50 p-4 text-xs leading-5 text-teal-950">Preview records are retrieved only through authenticated CMS access. Public pages continue to show published records only.</p></aside>
    </main>
  </PublicLayout>;
}

function PreviewNotice({ title, description }: { title: string; description: string }) {
  return <main className="grid min-h-screen place-items-center bg-paper px-5"><section className="max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"><FileText className="mx-auto h-8 w-8 text-teal-700" /><h1 className="mt-4 text-2xl font-extrabold text-navy">{title}</h1><p className="mt-3 leading-7 text-slate-600">{description}</p><Link href="/cms-login" className="btn-primary mt-6 inline-flex">CMS sign in</Link></section></main>;
}

export default CmsPreview;
