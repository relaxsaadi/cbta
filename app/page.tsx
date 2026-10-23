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
        text: "La reconnaissance d'une formation ou d'un certificat DGR dépend du programme, des exigences applicables et des organismes concernés. Vérifiez les conditions auprès de l'autorité et des exploitants pertinents ; aucune reconnaissance universelle n'est présumée.",
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
        text: "Les exigences de maintien des compétences et les éventuelles échéances doivent être vérifiées pour la fonction exercée, le programme suivi et les règles applicables. Une validité universelle de 24 mois ou un examen officiel IATA ne peuvent pas être présumés pour chaque parcours.",
      },
    },
    {
      "@type": "Question",
      name: "Peut-on commencer sans expérience préalable en marchandises dangereuses ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Cela dépend des prérequis du parcours et des tâches visées. Une évaluation préalable permet d'orienter le participant vers la formation initiale ou de maintien des compétences adaptée, sans garantir un niveau expert ni attribuer automatiquement une fonction 7.1 à 7.10.",
      },
    },
    {
      "@type": "Question",
      name: "Quelle différence entre une formation matières dangereuses générale et la formation DGR IATA ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Les formations généralistes HSE, stockage ou ADR et les formations DGR pour le fret aérien n'ont pas le même périmètre. Les besoins de formation DGR/CBTA sont déterminés à partir des tâches réellement exercées et des exigences applicables ; le seul intitulé de poste ne suffit pas pour sélectionner une fonction 7.1 à 7.10. Les conditions d'examen et la reconnaissance éventuelle d'un certificat doivent être vérifiées selon le parcours concerné.",
      },
    },
    {
      "@type": "Question",
      name: "KOST GROUP se déplace-t-il pour les formations intra-entreprise ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Les formations intra-entreprise sont étudiées selon le pays, les effectifs, les tâches visées et les conditions logistiques. Les modalités d'évaluation et les documents remis sont précisés dans la proposition ; aucun examen ou certificat IATA officiel n'est présumé.",
      },
    },
    {
      "@type": "Question",
      name: "Quels sont les délais d'inscription à la formation IATA DGR ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Les dates de session, les délais d'inscription et les éventuelles demandes urgentes sont confirmés lors de l'étude de votre dossier. Aucune périodicité fixe n'est garantie.",
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
