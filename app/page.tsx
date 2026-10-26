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

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Est-ce reconnu dans mon pays (Maroc, Sénégal, Tunisie, Côte d'Ivoire) ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "La reconnaissance d'une attestation ou d'une formation DGR/CBTA dépend du parcours suivi, de l'organisme émetteur et des exigences de l'autorité, du transporteur ou de l'employeur concerné. Demandez les justificatifs actuels du programme proposé avant inscription. Aucune reconnaissance universelle n'est présumée.",
      },
    },
    {
      "@type": "Question",
      name: "Comment payer depuis l'Afrique ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Plusieurs options : virement bancaire EUR ou USD vers notre compte STRATEGIX (entité française), ou virement local en Algérie. Nous émettons une facture officielle conforme aux exigences comptables de votre pays. Paiements échelonnés possibles pour les groupes.",
      },
    },
    {
      "@type": "Question",
      name: "Faut-il venir en Algérie pour la formation IATA DGR ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Pas nécessairement. Nous organisons des sessions à Alger, mais aussi des formations intra-entreprise (nous nous déplaçons dans votre pays) à partir de 6 participants. Demandez le devis intra dans le formulaire.",
      },
    },
    {
      "@type": "Question",
      name: "Le certificat IATA DGR est-il valable combien de temps ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "La périodicité de formation et les modalités de maintien de compétence dépendent des tâches exercées, du programme suivi et des exigences applicables. Confirmez toute durée de validité auprès de l'émetteur du document concerné.",
      },
    },
    {
      "@type": "Question",
      name: "Peut-on commencer sans expérience préalable en marchandises dangereuses ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Une formation initiale peut être envisagée selon les tâches exercées, le niveau de départ et les prérequis du programme. La fonction CBTA appropriée et les modalités d'évaluation se définissent après une analyse des tâches, sans promesse automatique de niveau expert.",
      },
    },
    {
      "@type": "Question",
      name: "Quelle différence entre une formation matières dangereuses générale et la formation DGR IATA ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Les formations généralistes en matières dangereuses (HSE, stockage, transport routier) et les parcours DGR pour le transport aérien ne couvrent pas nécessairement les mêmes tâches ni les mêmes règles. Pour le fret aérien, les fonctions et exigences applicables se déterminent à partir des activités réellement exercées. Aucune exclusivité ou reconnaissance universelle de certificat n'est présumée.",
      },
    },
    {
      "@type": "Question",
      name: "KOST GROUP se déplace-t-il pour les formations intra-entreprise ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Les formations intra-entreprise sont étudiées selon les tâches, le nombre de participants, le pays, les sources applicables et les disponibilités. Les modalités d'évaluation et tout document éventuellement délivré sont précisés dans la proposition validée.",
      },
    },
    {
      "@type": "Question",
      name: "Quels sont les délais d'inscription à la formation IATA DGR ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Les dates et délais d'inscription sont précisés dans le calendrier ou devis à jour. Les disponibilités et éventuelles sessions spécifiques doivent être confirmées avant engagement.",
      },
    },
    {
      "@type": "Question",
      name: "La formation IATA DGR est en français ou en anglais ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Les deux. Sessions standards en français. Nous proposons aussi des sessions en anglais sur demande, notamment pour les compagnies aériennes opérant en environnement bilingue.",
      },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
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
