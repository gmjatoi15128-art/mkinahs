import { Link } from "wouter";
import {
  ArrowRight,
  BookOpenCheck,
  GraduationCap,
  HeartPulse,
  Microscope,
  ShieldCheck,
  Stethoscope,
  UsersRound,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { asObject, asObjectArray, asString, settingMap } from "@/lib/content";
import { PublicLayout } from "@/components/PublicLayout";

const fallbackPrograms = [
  ["BS Nursing", "4 Years · 8 Semesters", Stethoscope],
  ["Health Technician", "18 Months", HeartPulse],
  ["Laboratory Technician", "1 Year", Microscope],
  ["OT Technician", "1 Year", ShieldCheck],
  ["Dispenser", "1 Year", BookOpenCheck],
  ["Dental Technician", "1 Year", UsersRound],
];

export default function Home() {
  const { data } = trpc.public.snapshot.useQuery();
  const settings = settingMap(data?.settings);
  const hero = asObject(settings.hero);
  const about = asObject(settings.homepage_about);
  const contact = asObject(settings.contact);
  const home = data?.pages?.find((page) => page.slug === "home");
  const sections = asObject(home?.sections);
  const programs = data?.programs?.length ? data.programs.slice(0, 6) : null;
  const gallery = data?.galleryImages ?? [];
  const heroImage = asString(hero.imageUrl) || asString(about.imageUrl) || gallery[0]?.mediaUrl || "";

  return (
    <PublicLayout settings={data?.settings} seo={data?.seo} title="Home">
      <main>
        <section className="relative overflow-hidden bg-[#062b33]">
          {heroImage ? (
            <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
          ) : null}
          <div className="absolute inset-0 bg-[#062b33]/90" />
          <div className="container relative z-10 grid min-h-[620px] items-center gap-10 py-16 lg:grid-cols-2">
            <div>
              <p className="eyebrow text-teal-200">
                {asString(hero.eyebrow, "Nursing & Allied Health Education")}
              </p>
              <h1 className="academic-display mt-5 text-5xl leading-tight text-white sm:text-6xl">
                {asString(hero.headline, "Begin Your Journey in Nursing")}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
                {asString(hero.description, "Build your knowledge, develop your skills, and prepare for a meaningful future in healthcare.")}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/programs" className="btn-gold justify-center">
                  {asString(hero.primaryCtaLabel, "Explore Programs")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/admissions" className="btn-ghost-light justify-center">
                  {asString(hero.secondaryCtaLabel, "Admissions Information")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="rounded-[2rem] border border-white/15 bg-white/5 p-4 backdrop-blur-sm">
                {heroImage ? (
                  <img src={heroImage} alt="MK Institute" className="h-[410px] w-full rounded-[1.5rem] object-cover" />
                ) : (
                  <div className="flex h-[410px] flex-col items-center justify-center rounded-[1.5rem] border border-white/10">
                    <HeartPulse className="h-16 w-16 text-gold-200" />
                    <p className="mt-5 text-sm text-slate-200">Nursing & Allied Health Education</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="public-section bg-paper">
          <div className="container grid items-center gap-10 lg:grid-cols-2">
            <div className="overflow-hidden rounded-[2rem] bg-slate-100">
              {about.imageUrl || gallery[1]?.mediaUrl ? (
                <img
                  src={asString(about.imageUrl, gallery[1]?.mediaUrl || "")}
                  alt="MK Institute"
                  className="aspect-[4/3] w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center">
                  <GraduationCap className="h-16 w-16 text-teal-700" />
                </div>
              )}
            </div>
            <div>
              <p className="eyebrow">About MKINHS</p>
              <h2 className="section-title mt-3">
                {asString(about.title, "Education for a Healthier Tomorrow")}
              </h2>
              <p className="section-copy">
                {asString(
                  about.description,
                  "MK Institute of Nursing and Allied Health Sciences is committed to quality healthcare education, practical learning, and professional development."
                )}
              </p>
              <Link href="/about" className="text-link mt-7">
                {asString(about.ctaLabel, "Discover MKINHS")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="public-section bg-slate-50">
          <div className="container">
            <p className="eyebrow">Academic pathways</p>
            <h2 className="section-title mt-3">Our Programs</h2>
            <p className="section-copy">Explore healthcare programs designed to develop knowledge, practical skills, and professional confidence.</p>
            <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(programs ?? fallbackPrograms).map((item, index) => {
                const fallback = fallbackPrograms[index];
                const program = programs ? item : null;
                const name = program ? asString(program.name, fallback[0] as string) : fallback[0] as string;
                const duration = program ? asString(program.duration, fallback[1] as string) : fallback[1] as string;
                const slug = program ? asString(program.slug, name.toLowerCase().replace(/\s+/g, "-")) : name.toLowerCase().replace(/\s+/g, "-");
                const Icon = program ? [Stethoscope, HeartPulse, Microscope, ShieldCheck, BookOpenCheck, UsersRound][index] : fallback[2];
                return (
                  <article key={slug} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-50 text-teal-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-xl font-bold text-navy">{name}</h3>
                    <p className="mt-2 text-sm text-slate-500">{duration}</p>
                    <Link href={`/programs/${slug}`} className="text-link mt-5">
                      View program <ArrowRight className="h-4 w-4" />
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="public-section bg-navy text-white">
          <div className="container grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="eyebrow text-teal-200">Why MKINHS</p>
              <h2 className="academic-display mt-3 text-4xl sm:text-5xl">Learn. Practice. Grow.</h2>
              <p className="mt-5 max-w-2xl text-slate-200 leading-8">
                {asString(sections.whyChooseDescription, "A focused learning environment combining academic knowledge, practical skills, and professional development.")}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Clinical Learning", Stethoscope],
                ["Professional Education", GraduationCap],
                ["Skills-Based Training", Microscope],
                ["Student Support", UsersRound],
              ].map(([title, Icon]) => (
                <div key={title as string} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <Icon className="h-6 w-6 text-gold-200" />
                  <h3 className="mt-4 font-bold">{title as string}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="public-section bg-paper">
          <div className="container">
            <p className="eyebrow">Clinical training</p>
            <h2 className="section-title mt-3">Learn Beyond the Classroom</h2>
            <p className="section-copy max-w-3xl">
              {asString(
                sections.clinicalTrainingDescription,
                "Build practical confidence through supervised learning and exposure to real healthcare environments."
              )}
            </p>
            <Link href="/clinical-training" className="btn-gold mt-7">
              Clinical training details <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="public-section bg-slate-50">
          <div className="container">
            <p className="eyebrow">Stay informed</p>
            <h2 className="section-title mt-3">Latest Notices</h2>
            <div className="mt-7 grid gap-4 md:grid-cols-3">
              {(data?.news ?? []).slice(0, 3).map((news) => (
                <article key={news.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h3 className="font-bold text-navy">{news.title}</h3>
                  <p className="mt-3 text-sm text-slate-600">{asString(news.excerpt, "")}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="public-section bg-[#062b33] text-white">
          <div className="container text-center">
            <p className="eyebrow text-teal-200">Start your next chapter</p>
            <h2 className="academic-display mt-3 text-4xl sm:text-5xl">Explore Your Healthcare Career Path</h2>
            <p className="mx-auto mt-5 max-w-2xl text-slate-200 leading-8">
              Learn about our programs and admissions information.
            </p>
            <Link href="/admissions" className="btn-gold mt-7">
              Admissions Information <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="public-section bg-paper">
          <div className="container">
            <p className="eyebrow">Contact</p>
            <h2 className="section-title mt-3">Get in Touch</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                ["Address", asString(contact.address)],
                ["Phone", asString(contact.phone)],
                ["Email", asString(contact.email)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-teal-700">{label}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{value || "Please contact the institute for details."}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
