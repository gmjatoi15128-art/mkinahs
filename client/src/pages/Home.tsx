import {
  ArrowRight,
  GraduationCap,
  HeartPulse,
  Stethoscope,
} from "lucide-react";
import { Link } from "wouter";
import { PublicLayout } from "@/components/PublicLayout";
import { asObject, asString, settingMap } from "@/lib/content";
import { trpc } from "@/lib/trpc";

const programIcons = [Stethoscope, HeartPulse, GraduationCap];

export default function Home() {
  const { data } = trpc.public.snapshot.useQuery();
  const settings = settingMap(data?.settings);
  const hero = asObject(settings.hero);
  const about = asObject(settings.homepage_about);
  const contact = asObject(settings.contact);
  const home = data?.pages?.find(page => page.slug === "home");
  const sections = asObject(home?.sections);
  const programs = data?.programs?.slice(0, 6) ?? [];
  const gallery = data?.galleryImages ?? [];
  const clinicalTraining = data?.clinicalTraining ?? [];
  const heroImage =
    asString(hero.imageUrl) ||
    asString(about.imageUrl) ||
    gallery[0]?.mediaUrl ||
    "";
  const whyChooseDescription = asString(sections.whyChooseDescription);
  const clinicalDescription = asString(sections.clinicalTrainingDescription);

  return (
    <PublicLayout settings={data?.settings} seo={data?.seo} title="Home">
      <main>
        <section className="hero-surface overflow-hidden text-white">
          {heroImage ? (
            <img
              src={heroImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-20"
            />
          ) : null}
          <div className="absolute inset-0 bg-navy/75" />
          <div className="container relative z-10 grid min-h-[620px] items-center gap-10 py-16 lg:grid-cols-2">
            <div>
              <p className="eyebrow text-teal-200">
                {asString(hero.eyebrow, "Nursing & Allied Health Education")}
              </p>
              <h1 className="academic-display mt-5 text-5xl leading-tight text-white sm:text-6xl">
                {asString(
                  hero.headline,
                  "MK Institute of Nursing and Allied Health Sciences"
                )}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
                {asString(
                  hero.description,
                  "Explore approved institute information, academic pathways, and admissions guidance."
                )}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/programs" className="btn-gold justify-center">
                  {asString(hero.primaryCtaLabel, "Explore Programs")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/admissions"
                  className="btn-ghost-light justify-center"
                >
                  {asString(hero.secondaryCtaLabel, "Admissions Information")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-sm">
                {heroImage ? (
                  <img
                    src={heroImage}
                    alt="MK Institute"
                    className="h-[410px] w-full rounded-[1.5rem] object-cover"
                  />
                ) : (
                  <div className="flex h-[410px] flex-col items-center justify-center rounded-[1.5rem] border border-white/15 bg-navy/30">
                    <HeartPulse className="h-16 w-16 text-gold-200" />
                    <p className="mt-5 text-sm text-slate-200">
                      Official institute information
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="public-section bg-paper">
          <div className="container grid items-center gap-10 lg:grid-cols-2">
            <div className="overflow-hidden rounded-[2rem] bg-teal-50">
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
              <h2 className="section-title">
                {asString(about.title, "Institute information")}
              </h2>
              <p className="section-copy">
                {asString(
                  about.description,
                  "Read the institute’s approved overview and academic information."
                )}
              </p>
              <Link href="/about" className="text-link mt-7">
                {asString(about.ctaLabel, "Discover MKINHS")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {programs.length ? (
          <section className="public-section bg-paper">
            <div className="container">
              <p className="eyebrow">Academic pathways</p>
              <h2 className="section-title">Published Programs</h2>
              <p className="section-copy">
                Explore programs that have been approved and published by the
                institute.
              </p>
              <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {programs.map((program, index) => {
                  const Icon = programIcons[index % programIcons.length];
                  return (
                    <article key={program.id} className="program-card">
                      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-50 text-teal-700">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-5 text-xl font-bold text-navy">
                        {program.name}
                      </h3>
                      {program.duration ? (
                        <p className="mt-2 text-sm text-slate-500">
                          {program.duration}
                        </p>
                      ) : null}
                      <Link
                        href={`/programs/${program.slug}`}
                        className="text-link mt-5"
                      >
                        View program <ArrowRight className="h-4 w-4" />
                      </Link>
                    </article>
                  );
                })}
              </div>
              <Link href="/programs" className="text-link mt-8">
                View all published programs <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        ) : null}

        {whyChooseDescription ? (
          <section className="public-section bg-paper">
            <div className="container rounded-[2rem] border border-teal-100 bg-teal-50/60 px-7 py-10 sm:px-10">
              <p className="eyebrow">Why MKINHS</p>
              <h2 className="section-title">Learn. Practice. Grow.</h2>
              <p className="section-copy max-w-3xl">{whyChooseDescription}</p>
            </div>
          </section>
        ) : null}

        {clinicalDescription || clinicalTraining.length ? (
          <section className="public-section bg-paper">
            <div className="container rounded-[2rem] border border-slate-200 bg-white px-7 py-10 shadow-sm sm:px-10">
              <p className="eyebrow">Clinical training</p>
              <h2 className="section-title">Learn Beyond the Classroom</h2>
              {clinicalDescription ? (
                <p className="section-copy max-w-3xl">{clinicalDescription}</p>
              ) : null}
              <Link href="/clinical-training" className="btn-primary mt-7">
                Clinical training details <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        ) : null}

        {data?.news?.length ? (
          <section className="public-section bg-paper">
            <div className="container">
              <p className="eyebrow">Stay informed</p>
              <h2 className="section-title">Latest Notices</h2>
              <div className="mt-7 grid gap-4 md:grid-cols-3">
                {data.news.slice(0, 3).map(news => (
                  <article key={news.id} className="news-card">
                    <h3 className="font-bold text-navy">{news.title}</h3>
                    {news.excerpt ? (
                      <p className="mt-3 text-sm text-slate-600">
                        {news.excerpt}
                      </p>
                    ) : null}
                    <Link
                      href={`/news/${news.slug}`}
                      className="text-link mt-5"
                    >
                      Read notice <ArrowRight className="h-4 w-4" />
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="public-section bg-paper">
          <div className="container rounded-[2rem] border border-slate-200 bg-white px-7 py-10 shadow-sm sm:px-10">
            <p className="eyebrow">Start your next chapter</p>
            <h2 className="section-title">
              Explore Your Healthcare Career Path
            </h2>
            <p className="section-copy">
              Review published programs and admissions information.
            </p>
            <Link href="/admissions" className="btn-primary mt-7">
              Admissions Information <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {asString(contact.address) ||
        asString(contact.phone) ||
        asString(contact.email) ? (
          <section className="public-section bg-paper">
            <div className="container">
              <p className="eyebrow">Contact</p>
              <h2 className="section-title">Get in Touch</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  ["Address", asString(contact.address)],
                  ["Phone", asString(contact.phone)],
                  ["Email", asString(contact.email)],
                ]
                  .filter(([, value]) => value)
                  .map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <p className="text-xs font-bold uppercase tracking-wider text-teal-700">
                        {label}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {value}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>
    </PublicLayout>
  );
}
