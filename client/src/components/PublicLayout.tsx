import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, BookOpen, CalendarDays, ChevronRight, FileText, Globe2, Images, Mail, MapPin, Menu, Newspaper, Phone, Stethoscope, UsersRound, X } from "lucide-react";
import { asObject, asString, settingMap, type SettingsRow } from "@/lib/content";
import { hasApprovedContactAction, selectPressReleases, shouldShowAdmissionsBanner, type PressReleaseRecord } from "@/lib/publicEnhancements";
import { trpc } from "@/lib/trpc";

const logoFallback = "/manus-storage/mk-institute-logo_f730d5c4.png";
const mainNavigation = [["About", "/about"], ["Programs", "/programs"], ["Admissions", "/admissions"], ["Campus", "/facilities"], ["Clinical Training", "/clinical-training"], ["News & Events", "/news"], ["Gallery", "/gallery"], ["Contact", "/contact"]] as const;
type SeoRecord = { path: string; title?: string | null; description?: string | null; ogImageUrl?: string | null; canonicalUrl?: string | null; indexable?: boolean };
type PublicLayoutProps = { children: React.ReactNode; settings?: SettingsRow[]; seo?: SeoRecord[]; pressReleases?: PressReleaseRecord[]; title?: string; description?: string; breadcrumbs?: string[] };

function ContactAction({ href, label, icon: Icon }: { href: string; label: string; icon: typeof Phone }) {
  return <a href={href} className="inline-flex items-center gap-1.5 transition-colors hover:text-gold-200"><Icon className="h-3.5 w-3.5" />{label}</a>;
}

function SeoHead({ name, title, description, breadcrumbs, seo }: { name: string; title?: string; description?: string; breadcrumbs?: string[]; seo?: SeoRecord }) {
  useEffect(() => {
    const fullTitle = seo?.title || (title ? `${title} | ${name}` : name);
    const fullDescription = seo?.description || description || `Official information from ${name}.`;
    const pageUrl = new URL(window.location.href);
    pageUrl.hash = "";
    pageUrl.search = "";
    document.title = fullTitle;
    const ensureMeta = (selector: string, attributes: Record<string, string>) => document.querySelector(selector) || document.head.appendChild(Object.assign(document.createElement("meta"), attributes));
    const descriptionMeta = ensureMeta('meta[name="description"]', { name: "description" });
    descriptionMeta.setAttribute("content", fullDescription);
    const robots = ensureMeta('meta[name="robots"]', { name: "robots" });
    robots.setAttribute("content", seo?.indexable === false ? "noindex, nofollow" : "index, follow");
    const canonical = document.querySelector('link[rel="canonical"]') || document.head.appendChild(Object.assign(document.createElement("link"), { rel: "canonical" }));
    canonical.setAttribute("href", seo?.canonicalUrl || pageUrl.toString());
    const ogTitle = ensureMeta('meta[property="og:title"]', { property: "og:title" });
    ogTitle.setAttribute("content", fullTitle);
    const ogDescription = ensureMeta('meta[property="og:description"]', { property: "og:description" });
    ogDescription.setAttribute("content", fullDescription);
    const ogUrl = ensureMeta('meta[property="og:url"]', { property: "og:url" });
    ogUrl.setAttribute("content", seo?.canonicalUrl || pageUrl.toString());
    const ogImage = document.querySelector('meta[property="og:image"]') || document.head.appendChild(Object.assign(document.createElement("meta"), { property: "og:image" }));
    if (seo?.ogImageUrl) ogImage.setAttribute("content", seo.ogImageUrl); else ogImage.remove();
  }, [name, title, description, seo]);

  const origin = typeof window === "undefined" ? undefined : window.location.origin;
  const organization = { "@context": "https://schema.org", "@type": ["Organization", "EducationalOrganization"], name, url: origin };
  const breadcrumb = breadcrumbs?.length ? { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: breadcrumbs.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item, item: origin ? `${origin}${index === 0 ? "/" : window.location.pathname}` : undefined })) } : null;
  return <>{<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />}{breadcrumb ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} /> : null}</>;
}

function PressReleaseTicker({ records = [] }: { records?: PressReleaseRecord[] }) {
  const releases = selectPressReleases(records); if (!releases.length) return null; const loop = releases.length > 1 ? [...releases, ...releases] : releases;
  return <aside aria-label="Latest press releases" className="border-b border-slate-200 bg-white"><div className="container flex min-h-11 items-center gap-3"><span className="shrink-0 rounded-full bg-navy px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white">Press releases</span><div className="min-w-0 overflow-hidden"><div className="press-ticker-track">{loop.map((release, index) => <Link key={`${release.id}-${index}`} href={`/news/${release.slug}`} className="press-ticker-item"><span className="text-teal-700">{release.category || "Notice"}</span><span className="mx-2 text-slate-300">•</span>{release.title}</Link>)}</div></div><Link href="/news" className="ml-auto hidden shrink-0 text-xs font-bold text-teal-800 hover:text-teal-950 sm:block">All notices</Link></div></aside>;
}

export function PublicLayout({ children, settings, seo: seoRecords, pressReleases, title, description, breadcrumbs }: PublicLayoutProps) {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const { data: tickerSnapshot } = trpc.public.snapshot.useQuery();
  const settingValues = settingMap(settings);
  const identity = asObject(settingValues.identity);
  const contact = asObject(settingValues.contact);
  const name = asString(identity.name, "MK Institute of Nursing and Allied Health Sciences");
  const logoUrl = asString(identity.logoUrl, logoFallback);
  const phone = asString(contact.phone);
  const email = asString(contact.email);
  const whatsapp = asString(contact.whatsapp);
  const locationText = asString(contact.locationLabel) || asString(contact.address);
  const socialLinks = asObject(contact.socialLinks);
  const admissionsBanner = asObject(settingValues.admissions_banner);
  const bannerEnabled = admissionsBanner.enabled === true || asString(admissionsBanner.enabled).toLowerCase() === "true";
  const bannerEyebrow = asString(admissionsBanner.eyebrow, "Admissions update");
  const bannerTitle = asString(admissionsBanner.title);
  const bannerMessage = asString(admissionsBanner.message);
  const bannerCtaLabel = asString(admissionsBanner.ctaLabel);
  const bannerCtaUrl = asString(admissionsBanner.ctaUrl, "/admissions");
  const showAdmissionsBanner = shouldShowAdmissionsBanner({ enabled: bannerEnabled, title: bannerTitle, message: bannerMessage });
  const hasApprovedContactActions = hasApprovedContactAction(phone, whatsapp);
  const hasContactBar = Boolean(phone || email || whatsapp || locationText || Object.keys(socialLinks).length);
  const seo = seoRecords?.find(record => record.path === location.split("#")[0]);

  return <div className="site-shell min-h-screen bg-paper text-slate-900 pb-16 lg:pb-0">
    <SeoHead name={name} title={title} description={description} breadcrumbs={breadcrumbs} seo={seo} />
    <header className="site-header sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl">
      {hasContactBar ? <div className="hidden bg-navy text-slate-200 lg:block"><div className="container flex h-9 items-center justify-between text-xs"><div className="flex items-center gap-5">{phone ? <ContactAction href={`tel:${phone}`} label={phone} icon={Phone} /> : null}{email ? <ContactAction href={`mailto:${email}`} label={email} icon={Mail} /> : null}{whatsapp ? <ContactAction href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`} label="WhatsApp" icon={Stethoscope} /> : null}{Object.entries(socialLinks).filter((entry): entry is [string, string] => typeof entry[1] === "string" && Boolean(entry[1])).map(([label, href]) => <a key={label} href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 transition-colors hover:text-gold-200"><Globe2 className="h-3.5 w-3.5" />{label}</a>)}</div>{locationText ? <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-teal-300" />{locationText}</span> : null}</div></div> : null}
      <div className="container flex h-[76px] items-center justify-between gap-4"><Link href="/" className="brand-lockup flex min-w-0 items-center gap-3" aria-label={`${name} home`}><img src={logoUrl} alt="MK Institute logo" className="brand-mark h-12 w-12 rounded-full object-contain shadow-sm" /><span className="brand-wordmark max-w-[220px] text-sm font-extrabold leading-tight tracking-tight text-navy sm:max-w-sm">{name}</span></Link><nav className="hidden items-center gap-5 xl:flex" aria-label="Primary navigation">{mainNavigation.map(([label, href]) => <Link key={href} href={href} className={`nav-link ${location === href ? "nav-link-active" : ""}`}>{label}</Link>)}</nav><div className="hidden lg:block"><Link href="/admissions" className="btn-primary">Admissions Information <ArrowRight className="h-4 w-4" /></Link></div><button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle menu" className="menu-trigger grid h-11 w-11 place-items-center rounded-xl border border-slate-200 text-navy transition hover:border-teal-600 hover:bg-teal-50 lg:hidden">{open ? <X /> : <Menu />}</button></div>
      {open ? <div className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden"><nav className="container flex flex-col gap-1" aria-label="Mobile navigation">{mainNavigation.map(([label, href]) => <Link key={href} onClick={() => setOpen(false)} href={href} className="flex min-h-12 items-center justify-between rounded-lg px-3 font-semibold text-slate-700 hover:bg-slate-50 hover:text-navy">{label}<ChevronRight className="h-4 w-4" /></Link>)}<Link onClick={() => setOpen(false)} href="/admissions" className="btn-primary mt-3 justify-center">Admissions Information</Link></nav></div> : null}
    </header>
    <PressReleaseTicker records={pressReleases || tickerSnapshot?.news} />
    {showAdmissionsBanner ? <section className="border-b border-amber-200 bg-amber-50"><div className="container flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between"><div><p className="eyebrow text-amber-800">{bannerEyebrow}</p><h2 className="mt-1 text-lg font-extrabold text-navy">{bannerTitle}</h2><p className="mt-1 max-w-3xl text-sm leading-6 text-slate-700">{bannerMessage}</p></div>{bannerCtaLabel ? <a href={bannerCtaUrl} className="btn-primary shrink-0">{bannerCtaLabel}<ArrowRight className="h-4 w-4" /></a> : null}</div></section> : null}
    {children}
    <footer className="mt-16 bg-navy text-slate-200"><div className="container grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]"><div><div className="flex items-center gap-3"><img src={logoUrl} alt="MK Institute logo" className="h-12 w-12 rounded-full object-contain" /><p className="font-bold leading-tight text-white">{name}</p></div><p className="mt-5 max-w-sm text-sm leading-6 text-slate-300">Official information, academic pathways, and admissions guidance are available through the institute’s digital information centre.</p></div><div><h2 className="footer-heading">Explore</h2><div className="mt-4 grid gap-2 text-sm">{mainNavigation.slice(0, 6).map(([label, href]) => <Link key={href} href={href} className="footer-link">{label}</Link>)}<Link href="/downloads" className="footer-link">Downloads</Link></div></div><div><h2 className="footer-heading">Contact</h2><div className="mt-4 grid gap-3 text-sm text-slate-300">{phone ? <a className="footer-link" href={`tel:${phone}`}>{phone}</a> : null}{email ? <a className="footer-link" href={`mailto:${email}`}>{email}</a> : null}<Link href="/contact" className="footer-link">Visit the contact centre</Link></div></div></div><div className="border-t border-white/10"><div className="container flex flex-col justify-between gap-2 py-5 text-xs text-slate-400 sm:flex-row"><span>© {new Date().getFullYear()} {name}</span><span>Privacy Policy · Terms & Conditions</span></div></div></footer>
    {hasApprovedContactActions ? <aside aria-label="Quick contact actions" className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-2 lg:flex">{phone ? <a href={`tel:${phone}`} className="flex items-center gap-2 rounded-full bg-navy px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-teal-800"><Phone className="h-4 w-4" />Call</a> : null}{whatsapp ? <a href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`} className="flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-800"><Stethoscope className="h-4 w-4" />WhatsApp</a> : null}</aside> : null}
    <div className={`fixed inset-x-0 bottom-0 z-50 grid border-t border-slate-200 bg-white p-2 shadow-[0_-8px_30px_rgba(15,23,42,0.09)] lg:hidden ${phone && whatsapp ? "grid-cols-3" : hasApprovedContactActions ? "grid-cols-2" : "grid-cols-1"}`}>{phone ? <a href={`tel:${phone}`} className="mobile-action"><Phone className="h-4 w-4" />Call</a> : null}{whatsapp ? <a href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`} className="mobile-action"><Stethoscope className="h-4 w-4" />WhatsApp</a> : null}<Link href="/admissions" className="mobile-action bg-navy text-white">Admissions</Link></div>
  </div>;
}

export function PageHero({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return <section className="page-hero"><div className="page-hero__content container relative z-10 max-w-4xl"><p className="eyebrow text-teal-200">{eyebrow || "MK Institute"}</p><h1 className="academic-display mt-4 text-balance text-4xl text-white sm:text-5xl">{title}</h1>{description ? <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">{description}</p> : null}</div></section>;
}

const directoryProfiles = {
  Programs: { icon: BookOpen, label: "Academic directory", items: ["Browse published programme profiles", "Use category and keyword search", "Review listed study information"] },
  Faculty: { icon: UsersRound, label: "Academic directory", items: ["Search published faculty profiles", "Review listed specialisations", "Open individual academic profiles"] },
  "News & Notices": { icon: Newspaper, label: "Official updates", items: ["Read published notices", "Follow institute updates", "Open complete articles"] },
  Events: { icon: CalendarDays, label: "Calendar centre", items: ["Review upcoming entries", "Check listed dates and locations", "Open complete event notices"] },
  Gallery: { icon: Images, label: "Visual archive", items: ["Browse approved image categories", "Open the full-screen viewer", "Read image captions"] },
  Downloads: { icon: FileText, label: "Document archive", items: ["Browse published documents", "Review document categories", "Download approved resources"] },
} as const;

export function DirectoryRail({ title }: { title: keyof typeof directoryProfiles }) {
  const profile = directoryProfiles[title];
  const Icon = profile.icon;
  return <section className="directory-rail"><div className="container"><div className="directory-rail__inner"><div className="directory-rail__mark"><Icon className="h-5 w-5" /></div><div><p className="eyebrow">{profile.label}</p><p className="mt-1 text-sm text-slate-600">A focused route for verified institute information.</p></div><div className="directory-rail__steps">{profile.items.map((item, index) => <span key={item}><strong>{String(index + 1).padStart(2, "0")}</strong>{item}</span>)}</div></div></div></section>;
}

export function EmptyNotice({ title = "Information centre", description = "Verified information will be added to this section as it becomes available." }: { title?: string; description?: string }) {
  const label = title.toLowerCase();
  const variant = label.includes("programme") || label.includes("program") ? "academic" : label.includes("faculty") ? "faculty" : label.includes("gallery") ? "gallery" : label.includes("notice") || label.includes("article") ? "news" : label.includes("event") ? "events" : label.includes("document") || label.includes("download") ? "documents" : "general";
  const Icon = variant === "academic" ? BookOpen : variant === "faculty" ? UsersRound : variant === "gallery" ? Images : variant === "news" ? Newspaper : variant === "events" ? CalendarDays : variant === "documents" ? FileText : Stethoscope;
  return <div className={`institutional-notice institutional-notice--${variant}`}><Icon className="mx-auto h-6 w-6" /><h3 className="mt-3 font-bold text-navy">{title}</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">{description}</p></div>;
}
