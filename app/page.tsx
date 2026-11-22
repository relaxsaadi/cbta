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
      name: "Comment vérifier le périmètre et l'acceptation d'une formation ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "L'acceptation dépend du programme suivi, des tâches réellement exercées, des règles de l'État et des exigences de l'exploitant concerné. Vérifiez le statut et le périmètre du prestataire dans les registres officiels, puis confirmez l'acceptation du document délivré auprès de l'autorité ou de l'exploitant concerné. Un référencement CBTA ne vaut pas approbation ANAC ni reconnaissance automatique par toutes les compagnies aériennes.",
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
      name: "Comment déterminer l'échéance de formation récurrente ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "La périodicité dépend des exigences applicables à la fonction et aux tâches, des règles de l'État et de l'exploitant, ainsi que de l'édition réglementaire en vigueur. Ne présumez pas d'une durée universelle : vérifiez l'échéance applicable avant de planifier le récurrent.",
      },
    },
    {
      "@type": "Question",
      name: "Peut-on commencer sans expérience préalable en marchandises dangereuses ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Les prérequis et le parcours initial dépendent des tâches confiées et du programme applicable. Le périmètre doit être établi à partir des activités réelles, puis confirmé avec l'employeur et, lorsque nécessaire, l'exploitant ou l'autorité compétente.",
      },
    },
    {
      "@type": "Question",
      name: "Quelle différence entre une formation matières dangereuses générale et la formation DGR IATA ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Les formations HSE ou ADR et les formations relatives au transport aérien répondent à des cadres différents. Pour le fret aérien, les compétences à couvrir se déterminent selon les tâches réellement exercées et les exigences actuelles de l'État et de l'exploitant. Un intitulé de poste ou le seul fait de travailler dans le fret ne suffit pas à attribuer automatiquement une fonction CBTA.",
      },
    },
    {
      "@type": "Question",
      name: "KOST GROUP se déplace-t-il pour les formations intra-entreprise ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Les modalités intra-entreprise, le lieu, les supports et les modalités d'évaluation sont définis dans le programme et le devis. Le statut de l'évaluation et les documents éventuellement délivrés sont précisés avant toute inscription.",
      },
    },
    {
      "@type": "Question",
      name: "Quels sont les délais d'inscription à la formation IATA DGR ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Les sessions ouvrent toutes les 4 à 6 semaines. Le délai conseillé entre inscription et formation est de 2 semaines pour valider le paiement et l'émission de la facture. Sessions urgentes possibles sur demande.",
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
