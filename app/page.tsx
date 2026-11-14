import { Suspense } from "react";
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
