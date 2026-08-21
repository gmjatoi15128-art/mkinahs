import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { ArrowRight, ChevronRight, Globe2, Mail, MapPin, Menu, Phone, Stethoscope, X } from "lucide-react";
import { asObject, asString, settingMap, type SettingsRow } from "@/lib/content";

const logoFallback = "/manus-storage/mk-institute-logo_f730d5c4.png";

const mainNavigation = [
  ["About", "/about"], ["Programs", "/programs"], ["Admissions", "/admissions"],
  ["Campus", "/facilities"], ["Clinical Training", "/clinical-training"], ["News & Events", "/news"],
  ["Gallery", "/gallery"], ["Contact", "/contact"],
] as const;

type SeoRecord = { path: string; title?: string | null; description?: string | null; ogImageUrl?: string | null; canonicalUrl?: string | null; indexable?: boolean };
type PublicLayoutProps = { children: React.ReactNode; settings?: SettingsRow[]; seo?: SeoRecord[]; title?: string; description?: string; breadcrumbs?: string[] };

function ContactAction({ href, label, icon: Icon, disabled }: { href?: string; label: string; icon: typeof Phone; disabled?: boolean }) {
  if (!href || disabled) return <span className="inline-flex items-center gap-1.5 text-slate-400" aria-disabled="true"><Icon className="h-3.5 w-3.5" />{label}</span>;
  return <a href={href} className="inline-flex items-center gap-1.5 transition-colors hover:text-gold-200"><Icon className="h-3.5 w-3.5" />{label}</a>;
}

function SeoHead({ name, title, description, breadcrumbs, seo }: { name: string; title?: string; description?: string; breadcrumbs?: string[]; seo?: SeoRecord }) {
  useEffect(() => {
    const fullTitle = seo?.title || (title ? `${title} | ${name}` : name);
    document.title = fullTitle;
    const meta = document.querySelector('meta[name="description"]') || document.head.appendChild(Object.assign(document.createElement("meta"), { name: "description" }));
    meta.setAttribute("content", seo?.description || description || `Information from ${name}.`);
    const robots = document.querySelector('meta[name="robots"]') || document.head.appendChild(Object.assign(document.createElement("meta"), { name: "robots" }));
    robots.setAttribute("content", seo?.indexable === false ? "noindex, nofollow" : "index, follow");
    const canonical = document.querySelector('link[rel="canonical"]') || document.head.appendChild(Object.assign(document.createElement("link"), { rel: "canonical" }));
    canonical.setAttribute("href", seo?.canonicalUrl || window.location.href);
    const ogImage = document.querySelector('meta[property="og:image"]') || document.head.appendChild(Object.assign(document.createElement("meta"), { property: "og:image" }));
    if (seo?.ogImageUrl) ogImage.setAttribute("content", seo.ogImageUrl); else ogImage.remove();
  }, [name, title, description, seo]);

  const organization = { "@context": "https://schema.org", "@type": ["Organization", "EducationalOrganization"], name };
  const breadcrumb = breadcrumbs && breadcrumbs.length > 0 ? { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: breadcrumbs.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item })) } : null;
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
    {breadcrumb ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} /> : null}
  </>;
}

export function PublicLayout({ children, settings, seo: seoRecords, title, description, breadcrumbs }: PublicLayoutProps) {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const map = settingMap(settings);
  const identity = asObject(map.identity);
  const contact = asObject(map.contact);
  const name = asString(identity.name, "MK Institute of Nursing and Allied Health Sciences");
  const logoUrl = asString(identity.logoUrl, logoFallback);
  const phone = asString(contact.phone);
  const email = asString(contact.email);
  const whatsapp = asString(contact.whatsapp);
  const locationText = asString(contact.locationLabel) || asString(contact.address);
  const socialLinks = asObject(contact.socialLinks);
  const seo = seoRecords?.find(record => record.path === location.split("#")[0]);

  return <div className="min-h-screen bg-paper text-slate-900 pb-16 lg:pb-0">
    <SeoHead name={name} title={title} description={description} breadcrumbs={breadcrumbs} seo={seo} />
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl">
      <div className="hidden bg-navy text-slate-200 lg:block">
        <div className="container flex h-9 items-center justify-between text-xs">
          <div className="flex items-center gap-5">
            <ContactAction href={phone ? `tel:${phone}` : undefined} label={phone || "Phone details pending"} icon={Phone} />
            <ContactAction href={email ? `mailto:${email}` : undefined} label={email || "Email details pending"} icon={Mail} />
            {whatsapp ? <ContactAction href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`} label="WhatsApp" icon={Stethoscope} /> : null}
            {Object.entries(socialLinks).filter((entry): entry is [string, string] => typeof entry[1] === "string" && Boolean(entry[1])).map(([label, href]) => <a key={label} href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 transition-colors hover:text-gold-200"><Globe2 className="h-3.5 w-3.5" />{label}</a>)}
          </div>
          {locationText ? <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-teal-300" />{locationText}</span> : null}
        </div>
      </div>
      <div className="container flex h-[76px] items-center justify-between gap-4">
        <Link href="/" className="flex min-w-0 items-center gap-3" aria-label={`${name} home`}>
          <img src={logoUrl} alt="MK Institute logo" className="h-12 w-12 rounded-full object-contain shadow-sm" />
          <span className="max-w-[220px] text-sm font-extrabold leading-tight tracking-tight text-navy sm:max-w-sm">{name}</span>
        </Link>
        <nav className="hidden items-center gap-5 xl:flex" aria-label="Primary navigation">
          {mainNavigation.map(([label, href]) => <Link key={href} href={href} className={`nav-link ${location === href ? "nav-link-active" : ""}`}>{label}</Link>)}
        </nav>
        <div className="hidden lg:block"><Link href="/admissions" className="btn-primary">Admissions Information <ArrowRight className="h-4 w-4" /></Link></div>
        <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle menu" className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 text-navy transition hover:border-teal-600 hover:bg-teal-50 lg:hidden">{open ? <X /> : <Menu />}</button>
      </div>
      {open ? <div className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden">
        <nav className="container flex flex-col gap-1" aria-label="Mobile navigation">
          {mainNavigation.map(([label, href]) => <Link key={href} onClick={() => setOpen(false)} href={href} className="flex min-h-12 items-center justify-between rounded-lg px-3 font-semibold text-slate-700 hover:bg-slate-50 hover:text-navy">{label}<ChevronRight className="h-4 w-4" /></Link>)}
          <Link onClick={() => setOpen(false)} href="/admissions" className="btn-primary mt-3 justify-center">Admissions Information</Link>
        </nav>
      </div> : null}
    </header>
    {children}
    <footer className="mt-16 bg-navy text-slate-200">
      <div className="container grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3"><img src={logoUrl} alt="MK Institute logo" className="h-12 w-12 rounded-full object-contain" /><p className="font-bold leading-tight text-white">{name}</p></div>
          <p className="mt-5 max-w-sm text-sm leading-6 text-slate-300">Institutional information, programmes, and admissions guidance are published here by the administration.</p>
        </div>
        <div><h2 className="footer-heading">Explore</h2><div className="mt-4 grid gap-2 text-sm">{mainNavigation.slice(0, 6).map(([label, href]) => <Link key={href} href={href} className="footer-link">{label}</Link>)}<Link href="/downloads" className="footer-link">Downloads</Link></div></div>
        <div><h2 className="footer-heading">Contact</h2><div className="mt-4 grid gap-3 text-sm text-slate-300">{phone ? <a className="footer-link" href={`tel:${phone}`}>{phone}</a> : null}{email ? <a className="footer-link" href={`mailto:${email}`}>{email}</a> : null}{!phone && !email ? <p>Contact details will be published by the administration.</p> : null}<Link href="/contact" className="footer-link">View contact information</Link></div></div>
      </div>
      <div className="border-t border-white/10"><div className="container flex flex-col justify-between gap-2 py-5 text-xs text-slate-400 sm:flex-row"><span>© {new Date().getFullYear()} {name}</span><span>Privacy Policy · Terms & Conditions</span></div></div>
    </footer>
    <div className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-3 border-t border-slate-200 bg-white p-2 shadow-[0_-8px_30px_rgba(15,23,42,0.09)] lg:hidden">
      {phone ? <a href={`tel:${phone}`} className="mobile-action"><Phone className="h-4 w-4" />Call</a> : <span className="mobile-action text-slate-400" aria-disabled="true"><Phone className="h-4 w-4" />Call</span>}
      {whatsapp ? <a href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`} className="mobile-action"><Stethoscope className="h-4 w-4" />WhatsApp</a> : <span className="mobile-action text-slate-400" aria-disabled="true"><Stethoscope className="h-4 w-4" />WhatsApp</span>}
      <Link href="/admissions" className="mobile-action bg-navy text-white">Admissions</Link>
    </div>
  </div>;
}

export function PageHero({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return <section className="page-hero"><div className="container relative z-10 max-w-4xl"><p className="eyebrow text-teal-200">{eyebrow || "MK Institute"}</p><h1 className="mt-4 text-balance text-4xl font-extrabold tracking-tight text-white sm:text-5xl">{title}</h1>{description ? <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">{description}</p> : null}</div></section>;
}

export function EmptyNotice({ title = "Information will be updated", description = "This section will appear when the administration publishes confirmed content." }: { title?: string; description?: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-7 text-center shadow-sm"><Stethoscope className="mx-auto h-6 w-6 text-teal-700" /><h3 className="mt-3 font-bold text-navy">{title}</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">{description}</p></div>;
}
