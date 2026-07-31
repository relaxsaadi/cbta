import { Suspense } from "react";
import Hero from "@/components/Hero";
import CountriesBar from "@/components/CountriesBar";
import ProblemSection from "@/components/ProblemSection";
import USPSection from "@/components/USPSection";
import FormationsTable from "@/components/FormationsTable";
import PriceAnchor from "@/components/PriceAnchor";
import IncludedSection from "@/components/IncludedSection";
import Guarantee from "@/components/Guarantee";
import TrainerBio from "@/components/TrainerBio";
import Testimonials from "@/components/Testimonials";
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
        text: "Oui. Le certificat IATA CBTA est universel et reconnu par les 300+ compagnies aériennes membres de l'IATA, ainsi que par les autorités de l'aviation civile (DGAC) au Maroc, Sénégal, Tunisie, Côte d'Ivoire, Cameroun, Mali, Burkina Faso, Gabon, Algérie. Notre numéro CBTA Provider est vérifiable sur iata.org/cbta-center-registry.",
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
        text: "24 mois (2 ans) à compter de la date de réussite à l'examen IATA. Un recyclage CBTA (recurrent) est obligatoire avant cette échéance pour maintenir la qualification.",
      },
    },
    {
      "@type": "Question",
      name: "Peut-on commencer sans expérience préalable en marchandises dangereuses ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui pour les formations Initial (7.1, 7.3 Initial). La formation est conçue pour amener un participant sans prérequis au niveau d'expert opérationnel. Les sessions Recurrent supposent en revanche une certification active arrivant à échéance.",
      },
    },
    {
      "@type": "Question",
      name: "KOST GROUP se déplace-t-il pour les formations intra-entreprise ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui, à partir de 6 participants nous nous déplaçons dans tous les pays d'Afrique francophone. Nous prenons en charge le formateur, les supports, l'examen IATA officiel. Vous fournissez la salle et la logistique locale.",
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
        <CountriesBar />
        <ProblemSection />
        <USPSection />
        <FormationsTable />
        <PriceAnchor />
        <IncludedSection />
        <Guarantee />
        <TrainerBio />
        <Testimonials />
        <B2BSection />
        <FAQ />
        <Suspense fallback={null}>
          <LeadForm sourcePage="/" />
        </Suspense>
      </main>
      <Footer />
      <WhatsAppSticky />
    </>
  );
}
