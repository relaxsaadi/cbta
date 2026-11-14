import { Suspense } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";
import WhatsAppSticky from "@/components/WhatsAppSticky";
import LeadForm from "@/components/LeadForm";
import TrackedLink from "@/components/TrackedLink";
import SetHtmlLang from "@/components/SetHtmlLang";
import { faqPageJsonLd } from "@/lib/jsonld";
import {
  CONTACT_EMAIL,
  WHATSAPP_DISPLAY,
  breadcrumbJsonLd,
  courseJsonLd,
  whatsAppHref,
  type Crumb,
} from "@/lib/exact-match";

export type ExactSection = {
  id: string;
  title: string;
  paragraphs: string[];
  subsections?: { title: string; paragraphs: string[] }[];
  bullets?: string[];
};

export type ExactFaq = { q: string; a: string };

export type ExactLink = { href: string; label: string };

type Props = {
  lang: "fr" | "en";
  slug: string;
  eyebrow: string;
  h1: string;
  description: string;
  lead: string[];
  sections: ExactSection[];
  faqs: ExactFaq[];
  links: ExactLink[];
  crumbs: Crumb[];
  ctaTitle: string;
  ctaText: string;
  whatsappMessage: string;
};

const FUNCTION_LINKS = [
  ["7.1", "/dgr-7-1"],
  ["7.2", "/dgr-7-2"],
  ["7.3", "/dgr-7-3"],
  ["7.4", "/dgr-7-4"],
  ["7.5", "/dgr-7-5"],
  ["7.6", "/dgr-7-6"],
  ["7.7", "/dgr-7-7"],
  ["7.8", "/dgr-7-8"],
  ["7.9", "/dgr-7-9"],
  ["7.10", "/dgr-7-10"],
] as const;

export default function ExactMatchPage({
  lang,
  slug,
  eyebrow,
  h1,
  description,
  lead,
  sections,
  faqs,
  links,
  crumbs,
  ctaTitle,
  ctaText,
  whatsappMessage,
}: Props) {
  const en = lang === "en";
  const wa = whatsAppHref(whatsappMessage);

  return (
    <>
      {en ? <SetHtmlLang lang="en" /> : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd(crumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: faqPageJsonLd(faqs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: courseJsonLd({
            name: h1,
            description,
            slug,
            inLanguage: lang,
          }),
        }}
      />
      <WhatsAppSticky />
      <main className="bg-white text-gray-800">
        <section className="bg-gradient-to-br from-[#002A56] to-[#003D7A] text-white">
          <div className="container-x max-w-4xl py-14 md:py-20">
            <nav aria-label={en ? "Breadcrumb" : "Fil d'Ariane"} className="text-sm text-white/60 mb-6 flex flex-wrap items-center gap-2">
              {crumbs.map((crumb, index) => (
                <span key={crumb.path} className="inline-flex items-center gap-2">
                  {index > 0 ? <span aria-hidden>/</span> : null}
                  {index < crumbs.length - 1 ? (
                    <Link href={crumb.path || "/"} className="hover:text-white">
                      {crumb.name}
                    </Link>
                  ) : (
                    <span className="text-white/90">{crumb.name}</span>
                  )}
                </span>
              ))}
            </nav>
            <p className="text-sm uppercase tracking-wider text-[#F39C12] font-bold mb-3">{eyebrow}</p>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-5">{h1}</h1>
            <div className="space-y-4 text-lg text-white/90 leading-relaxed max-w-3xl">
              {lead.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#proposition" className="rounded-lg bg-white px-6 py-3 font-bold text-[#003087] no-underline">
                {en ? "Request a written proposal" : "Demander une proposition écrite"}
              </a>
              <TrackedLink
                track="whatsapp"
                location={slug}
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-[#25D366] px-6 py-3 font-bold text-white no-underline"
              >
                WhatsApp {WHATSAPP_DISPLAY}
              </TrackedLink>
            </div>
          </div>
        </section>

        {sections.map((section) => (
          <section key={section.id} id={section.id} className="border-b border-gray-100">
            <div className="container-x max-w-4xl py-12 md:py-14">
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#003D7A] mb-5">{section.title}</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              {section.bullets ? (
                <ul className="mt-5 space-y-2 list-disc pl-6 text-gray-700 leading-relaxed">
                  {section.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
              {section.subsections?.map((sub) => (
                <div key={sub.title} className="mt-8">
                  <h3 className="text-xl font-bold text-[#0f1c2e] mb-3">{sub.title}</h3>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    {sub.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        <section className="bg-[#f7f9fc]">
          <div className="container-x max-w-4xl py-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#003D7A] mb-6">
              {en ? "Functions 7.1 to 7.10" : "Fonctions 7.1 à 7.10"}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-5">
              {en
                ? "Each function below has its own page. The label is a starting point. The function kept for a participant is the one that matches the tasks actually performed."
                : "Chaque fonction ci-dessous a sa page. L'intitulé est un point de départ. La fonction retenue pour un participant est celle qui correspond aux tâches réellement exercées."}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {FUNCTION_LINKS.map(([code, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-center font-bold text-[#003D7A] no-underline hover:border-[#003D7A]"
                >
                  {code}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="faq">
          <div className="container-x max-w-4xl py-12 md:py-14">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#003D7A] mb-6">
              {en ? "FAQ" : "Questions fréquentes"}
            </h2>
            <div className="space-y-4">
              {faqs.map((item) => (
                <article key={item.q} className="rounded-xl border border-gray-200 bg-[#f7f9fc] p-5">
                  <h3 className="font-bold text-[#003D7A] mb-2">{item.q}</h3>
                  <p className="text-gray-700 leading-relaxed">{item.a}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="proposition" className="bg-[#003087] text-white">
          <div className="container-x max-w-3xl py-14">
            <h2 className="text-2xl md:text-3xl font-extrabold mb-3">{ctaTitle}</h2>
            <p className="text-white/85 leading-relaxed mb-6">{ctaText}</p>
            <p className="text-white/90 leading-relaxed mb-8">
              {en ? (
                <>
                  Contact us using the form on this page, email{" "}
                  <a className="underline font-semibold" href={`mailto:${CONTACT_EMAIL}`}>
                    {CONTACT_EMAIL}
                  </a>
                  , or WhatsApp {WHATSAPP_DISPLAY}.
                </>
              ) : (
                <>
                  Contactez-nous via le formulaire de cette page, l&apos;e-mail{" "}
                  <a className="underline font-semibold" href={`mailto:${CONTACT_EMAIL}`}>
                    {CONTACT_EMAIL}
                  </a>
                  , ou WhatsApp {WHATSAPP_DISPLAY}.
                </>
              )}
            </p>
            <Suspense fallback={null}>
              <LeadForm sourcePage={`/${slug}`} showPrices={false} />
            </Suspense>
          </div>
        </section>

        <nav aria-label={en ? "Related pages" : "Pages liées"} className="bg-gray-50">
          <div className="container-x max-w-4xl py-8">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#003D7A] mb-4">
              {en ? "Related pages" : "Pages liées"}
            </h2>
            <div className="flex flex-wrap gap-3">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-[#003087] no-underline hover:border-[#003087]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </main>
      <Footer />
    </>
  );
}
