import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { GROUP_LABELS, pagesInGroup, type PageGroup } from "@/lib/site-pages";
import Hero from "@/components/Hero";
import SessionAoutBanner from "@/components/SessionAoutBanner";
import CountriesBar from "@/components/CountriesBar";
import ProblemSection from "@/components/ProblemSection";
import USPSection from "@/components/USPSection";
import FormationsTable from "@/components/FormationsTable";
import PriceAnchor from "@/components/PriceAnchor";
import IncludedSection from "@/components/IncludedSection";
import Guarantee from "@/components/Guarantee";
import TrainerBio from "@/components/TrainerBio";
import B2BSection from "@/components/B2BSection";
import FAQ from "@/components/FAQ";
import LeadForm from "@/components/LeadForm";
import WhatsAppSticky from "@/components/WhatsAppSticky";
import Footer from "@/components/Footer";
import ScrollTracker from "@/components/ScrollTracker";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const INDEX_GROUPS: PageGroup[] = [
  "algerie-themes",
  "algerie-villes",
  "fonctions",
  "international",
  "english",
];

/** Server-rendered index of every training page (internal linking hub). */
function TrainingIndex() {
  return (
    <section id="toutes-les-formations" className="bg-white border-t border-gray-100">
      <div className="container-x py-14">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#003D7A] mb-8">
          Toutes nos formations DGR
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {INDEX_GROUPS.map((group) => (
            <div key={group}>
              <h3 className="font-bold text-[#0f1c2e] mb-3">{GROUP_LABELS[group].fr}</h3>
              <ul className="space-y-1.5 text-sm">
                {pagesInGroup(group).map((page) => (
                  <li key={page.path}>
                    <Link href={page.path} hrefLang={page.lang} className="text-[#003087] hover:underline">
                      {page.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <ScrollTracker />
      <main>
        <Hero />
        <SessionAoutBanner />
        <CountriesBar />
        <ProblemSection />
        <USPSection />
        <FormationsTable />
        <PriceAnchor />
        <IncludedSection />
        <Guarantee />
        <TrainerBio />
        <B2BSection />
        <TrainingIndex />
        <FAQ />
        <div id="contact">
          <Suspense fallback={null}>
            <LeadForm sourcePage="/" />
          </Suspense>
        </div>
      </main>
      <Footer />
      <WhatsAppSticky />
    </>
  );
}
