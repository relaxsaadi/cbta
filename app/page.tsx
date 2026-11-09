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
        text: "La reconnaissance dépend des exigences de chaque autorité, opérateur et employeur. Le périmètre et les modalités de la formation doivent être vérifiés avant inscription.",
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
        text: "Pas nécessairement. Des sessions peuvent être organisées à Alger. Une formation intra-entreprise hors Algérie doit être étudiée pays par pays, sur devis et sous réserve des autorisations et conditions opérationnelles applicables.",
      },
    },
    {
      "@type": "Question",
      name: "Le certificat IATA DGR est-il valable combien de temps ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "La validité et les besoins de formation récurrente dépendent des fonctions exercées et des exigences applicables. Ces conditions doivent être vérifiées pour chaque parcours.",
      },
    },
    {
      "@type": "Question",
      name: "Peut-on commencer sans expérience préalable en marchandises dangereuses ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Les prérequis et le parcours de formation dépendent des tâches exercées et du programme concerné. Le niveau requis est vérifié avant inscription.",
      },
    },
    {
      "@type": "Question",
      name: "Quelle différence entre une formation matières dangereuses générale et la formation DGR IATA ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Une formation généraliste HSE ou ADR ne remplace pas les exigences propres au transport aérien. Le parcours DGR/CBTA doit correspondre aux tâches réellement exercées et aux règles applicables. La reconnaissance d'un certificat se vérifie séparément auprès de l'autorité ou de l'opérateur concerné.",
      },
    },
    {
      "@type": "Question",
      name: "KOST GROUP se déplace-t-il pour les formations intra-entreprise ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Une intervention intra-entreprise peut être envisagée selon le pays, les disponibilités et les autorisations applicables. Le périmètre, le nombre de participants et les modalités doivent être confirmés par une proposition écrite ; aucune couverture géographique universelle n'est garantie.",
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
