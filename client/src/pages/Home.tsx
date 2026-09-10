import { Link } from "wouter";
import {
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  ChevronRight,
  GraduationCap,
  HeartPulse,
  MapPinned,
  Microscope,
  ShieldCheck,
  Stethoscope,
  UsersRound,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import {
  asObject,
  asObjectArray,
  asString,
  dateLabel,
  settingMap,
} from "@/lib/content";
import { EmptyNotice, PublicLayout } from "@/components/PublicLayout";

const fallbackPrograms = [
  {
    name: "BS Nursing",
    slug: "bs-nursing",
    category: "Nursing",
    duration: "4 Years · 8 Semesters",
    eligibility: "See admissions",
    overview:
      "A structured nursing degree combining classroom learning, skills development, and supervised clinical exposure.",
  },
  {
    name: "Health Technician",
    slug: "health-technician",
    category: "Allied Health",
    duration: "18 Months",
    eligibility: "See admissions",
    overview:
      "Practical technical preparation for healthcare support roles across a range of clinical settings.",
  },
  {
    name: "Laboratory Technician",
    slug: "laboratory-technician",
    category: "Allied Health",
    duration: "1 Year",
    eligibility: "See admissions",
    overview:
      "Develop laboratory skills and knowledge for diagnostic and clinical laboratory environments.",
  },
  {
    name: "OT Technician",
    slug: "ot-technician",
    category: "Allied Health",
    duration: "1 Year",
    eligibility: "See admissions",
    overview:
      "Practical preparation for operating-theatre support, safety, procedures, and clinical teamwork.",
  },
  {
    name: "Dispenser",
    slug: "dispenser",
    category: "Allied Health",
    duration: "1 Year",
    eligibility: "See admissions",
    overview:
      "Training focused on safe dispensing practice, medicine handling, and healthcare support.",
  },
  {
    name: "Dental Technician",
    slug: "dental-technician",
    category: "Allied Health",
    duration: "1 Year",
    eligibility: "See admissions",
    overview:
      "Practical learning in dental laboratory techniques and support for oral-health services.",
  },
];

const programIcons = [
  Stethoscope,
  HeartPulse,
  Microscope,
  UsersRound,
  BookOpenCheck,
  ShieldCheck,
];

export default function Home() {
  const { data, isLoading } = trpc.public.snapshot.useQuery();

  const settings = settingMap(data?.settings);
  const hero = asObject(settings.hero);
  const about = asObject(settings.homepage_about);
  const contact = asObject(settings.contact);

  const homePage = data?.pages.find((page) => page.slug === "home");
  const homepageSections = asObject(homePage?.sections);
  const trustItems = asObjectArray(homepageSections.trustItems);
  const benefitItems = asObjectArray(homepageSections.benefitItems);

  const sections = data?.pages ?? [];
  const pageSection = (slug: string) =>
    asObject(sections.find((page) => page.slug === slug)?.sections);

  const clinical = pageSection("clinical-training");
  const gallery = data?.galleryImages ?? [];
  const latestNews = (data?.news ?? []).slice(0, 3);
  const upcomingEvents = (data?.events ?? [])
    .filter((event) => event.eventStatus === "upcoming")
    .slice(0, 3);

  const contactLines = [
    { label: "Address", value: asString(contact.address) },
    { label: "Phone", value: asString(contact.phone) },
    { label: "Email", value: asString(contact.email) },
  ].filter((item) => item.value);

  const heroImage =
    asString(hero.imageUrl) ||
    asString(about.imageUrl) ||
    gallery[0]?.mediaUrl ||
    "";

  const programs = data?.programs?.length
    ? data.programs.slice(0, 6)
    : fallbackPrograms;

  const fallbackTrust = [
    { title: "PNMC Approved", icon: ShieldCheck },
    { title: "Quality Education", icon: GraduationCap },
    { title: "Clinical Learning", icon: HeartPulse },
    { title: "Future Ready", icon: UsersRound },
  ];

  const fallbackBenefits = [
    {
      title: "Clinical Learning",
      description:
        "Build practical confidence through structured, supervised healthcare learning.",
      icon: Stethoscope,
    },
    {
      title: "Professional Education",
      description:
        "Develop academic knowledge alongside practical skills for healthcare careers.",
      icon: GraduationCap,
    },
    {
      title: "Skills-Based Training",
      description:
        "Connect classroom concepts with hands-on learning and professional practice.",
      icon: Microscope,
    },
    {
      title: "Student Support",
      description:
        "A learning environment designed to support academic and professional growth.",
      icon: UsersRound,
    },
  ];

  const renderedTrustItems = trustItems.length
    ? trustItems.slice(0, 4).map((item, index) => ({
        title: asString(item.title, fallbackTrust[index].title),
        icon: fallbackTrust[index].icon,
      }))
    : fallbackTrust;

  const renderedBenefitItems = benefitItems.length
    ? benefitItems.slice(0, 4).map((item, index) => ({
        title: asString(item.title, fallbackBenefits[index].title),
        description: asString(
          item.description,
          fallbackBenefits[index].description
        ),
        icon: fallbackBenefits[index].icon,
      }))
    : fallbackBenefits;

  return (
    <PublicLayout settings={data?.settings} seo={data?.seo} title="Home">
      <main>
        {/* HERO */}
        <section className="relative overflow-hidden bg-[#062b33]">
          <div className="absolute inset-0">
            {heroImage ? (
              <img
                src={heroImage}
                alt=""
                className="h-full w-full object-cover opacity-45"
              />
            ) : null}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,29,36,0.98)_0%,rgba(2,45,53,0.90)_48%,rgba(2,45,53,0.55)_100%)]" />
            <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-teal-400/10 blur-3xl" />
            <div className="absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-amber-300/10 blur-3xl" />
          </div>

          <div className="container relative z-10 grid min-h-[650px] items-center gap-10 py-14 sm:py-18 lg:grid-cols-[1.05fr_.95fr] lg:py-20">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-gold-300" />
                <p className="eyebrow text-teal-200">
                  {asString(
                    hero.eyebrow,
                    "Nursing & Allied Health Education"
                  )}
                </p>
              </div>

              <h1 className="academic-display mt-6 max-w-3xl text-balance text-5xl leading-[1.02] text-white sm:text-6xl lg:text-7xl">
                {asString(hero.headline, "Begin Your Journey in Nursing")}
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg sm:leading-8">
                {asString(
                  hero.description,
                  "Build your knowledge. Develop your skills. Prepare for a meaningful future in healthcare."
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

              <div className="mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
                {renderedTrustItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={`${item.title}-${index}`}
                      className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 backdrop-blur-sm"
                    >
                      <Icon className="h-5 w-5 text-gold-200" />
                      <p className="mt-2 text-xs font-bold leading-4 text-white">
                        {item.title}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute -inset-10 rounded-full bg-teal-300/10 blur-3xl" />

              {heroImage ? (
                <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 p-3 shadow-2xl backdrop-blur-sm">
                  <img
                    src={heroImage}
                    alt="MK Institute"
                    className="h-[430px] w-full rounded-[1.5rem] object-cover"
                  />
                  <div className="absolute inset-x-8 bottom-8 rounded-2xl border border-white/15 bg-navy/80 p-5 backdrop-blur-md">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-200">
                      MK Institute
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white">
                      Academic pathways, practical learning, and healthcare
                      education.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative rounded-[2rem] border border-white/15 bg-white/5 p-4 shadow-2xl backdrop-blur-sm">
                  <div className="flex min-h-[430px] flex-col items-center justify-center rounded-[1.5rem] border border-white/10 bg-white/5 p-8 text-center">
                    <div className="grid h-28 w-28 place-items-center rounded-full border border-gold-200/50 bg-white/5">
                      <HeartPulse className="h-12 w-12 text-gold-200" />
                    </div>
                    <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-teal-200">
                      Healthcare Education
                    </p>
                    <p className="mt-3 max-w-xs text-sm leading-6 text-slate-200">
                      Add a campus, skills-lab, or nursing image through the CMS
                      to make this panel image-led.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section className="public-section bg-paper">
          <div className="container grid items-center gap-10 lg:grid-cols-[.9fr_1.1fr]">
            <div className="order-2 lg:order-1">
              {about.imageUrl || gallery[1]?.mediaUrl ? (
                <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-100 shadow-sm">
                  <img
                    src={asString(
                      about.imageUrl,
                      gallery[1]?.mediaUrl || ""
                    )}
                    alt="MK Institute campus"
                    className="aspect-[4/3] w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-[2rem] bg-slate-100 p-8">
                  <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full border border-gold-300/70" />
                  <div className="absolute -bottom-20 -left-10 h-44 w-44 rounded-full border border-teal-200/70" />
                  <GraduationCap className="relative h-12 w-12 text-teal-700" />
                  <p className="relative mt-16 max-w-sm text-base leading-7 text-slate-600">
                    {asString(
                      about.description,
                      "Explore the institute’s official profile, academic direction, and published information."
                    )}
                  </p>
                </div>
              )}
            </div>

            <div className="order-1 lg:order-2">
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-gold-400" />
                <p className="eyebrow">About MKINHS</p>
              </div>

              <h2 className="section-title mt-3">
                {asString(about.title, "Education for a Healthier Tomorrow")}
              </h2>

              <p className="section-copy">
                {asString(
                  about.description,
                  "MK Institute of Nursing and Allied Health Sciences is committed to quality healthcare education, practical learning, and professional development."
                )}
              </p>

              <div className="mt-7 grid gap-4 sm:grid-cols-3">
                {[
                  ["01", "Academic", "Knowledge"],
                  ["02", "Clinical", "Learning"],
                  ["03", "Professional", "Growth"],
                ].map(([number, title, subtitle]) => (
                  <div
                    key={number}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <p className="text-xs font-extrabold tracking-[0.16em] text-teal-700">
                      {number}
                    </p>
                    <p className="mt-3 font-bold text-navy">{title}</p>
                    <p className="text-sm text-slate-500">{subtitle}</p>
                  </div>
                ))}
              </div>

              <Link href="/about" className="text-link mt-7">
                {asString(about.ctaLabel, "Discover MKINHS")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* PROGRAMS */}
        <section className="public-section bg-slate-50">
          <div className="container">
            <SectionIntro
              eyebrow="Academic pathways"
              title="Our Programs"
              description="Explore healthcare programs designed to develop knowledge, practical skills, and professional confidence."
              link={{ href: "/programs", label: "View all programs" }}
            />

            {isLoading ? (
              <LoadingGrid />
            ) : (
              <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {programs.map((program, index) => {
                  const Icon = programIcons[index % programIcons.length];

                  return (
                    <article
                      key={`${program.slug}-${index}`}
                      className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="relative bg-[linear-gradient(135deg,#e9fbf8_0%,#f9fbf8_100%)] p-6">
                        <div className="flex items-start justify-between gap-3">
                          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-teal-700 shadow-sm ring-1 ring-teal-100">
                            <Icon className="h-5 w-5" />
                          </div>

                          <span className="rounded-full bg-white px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-teal-800 ring-1 ring-slate-200">
                            {program.category || "Programme"}
                          </span>
                        </div>

                        <h3 className="mt-7 min-h-[56px] text-xl font-bold text-navy">
                          {program.name}
                        </h3>

                        <p className="mt-2 text-sm font-semibold text-teal-800">
                          {program.duration || "Duration not specified"}
                        </p>
                      </div>

                      <div className="p-6">
                        <p className="line-clamp-3 text-sm leading-6 text-slate-600">
                          {program.overview ||
                            "Programme information is available in the full programme profile."}
                        </p>

                        <Link
                          className="text-link mt-6"
                          href={`/programs/${program.slug}`}
                        >
                          View details
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* WHY MK */}
        <section className="public-section">
          <div className="container">
            <SectionIntro
              eyebrow="Why choose MKINHS"
              title="Building Better Healthcare Professionals"
              description="A learning environment that connects academic education with practical preparation for healthcare careers."
            />

            <div className="mt-9 grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
              <div className="rounded-[2rem] bg-navy p-7 sm:p-9">
                <p className="eyebrow text-teal-200">Our approach</p>
                <h3 className="mt-3 text-2xl font-bold leading-tight text-white sm:text-3xl">
                  Learn. Practice. Grow.
                </h3>
                <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">
                  Our aim is to help students strengthen knowledge, develop
                  practical skills, and prepare for professional healthcare
                  environments.
                </p>
                <Link href="/facilities" className="btn-gold mt-7">
                  Explore campus
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {renderedBenefitItems.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <article
                      key={`${item.title}-${index}`}
                      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                    >
                      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-5 text-lg font-bold text-navy">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {item.description}
                      </p>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* CLINICAL TRAINING */}
        <section className="overflow-hidden bg-[#063b40] text-white">
          <div className="container grid min-h-[430px] items-center gap-8 py-14 lg:grid-cols-[1fr_1fr]">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-gold-300" />
                <p className="eyebrow text-teal-200">Clinical training</p>
              </div>

              <h2 className="academic-display mt-4 max-w-xl text-4xl leading-tight text-white sm:text-5xl">
                Learn Beyond the Classroom
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-200 sm:text-base">
                {asString(
                  homepageSections.clinicalTrainingDescription,
                  asString(
                    clinical.description,
                    "Bu
