import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppSticky from "@/components/WhatsAppSticky";
import LeadForm from "@/components/LeadForm";

export const metadata: Metadata = {
  title: "Réglementation DGR Algérie — Décret 21-253 & ANAC",
  description:
    "Repères sur le contrôle des programmes de formation liés au transport aérien de marchandises dangereuses, à lire avec le texte officiel et les exigences applicables.",
  alternates: { canonical: "/reglementation-dgr-algerie" },
  keywords: [
    "décret 21-253 marchandises dangereuses",
    "obligation formation DGR ANAC",
    "inspecteur marchandises dangereuses Algérie",
    "réglementation transport aérien marchandises dangereuses Algérie",
    "ANAC contrôle DGR",
    "annexe 18 OACI marchandises dangereuses",
  ],
  openGraph: {
    title: "Réglementation DGR en Algérie — Décret 21-253 & ANAC",
    description:
      "Repères documentaires sur le contrôle ANAC prévu par le Décret exécutif n°21-253 ; le périmètre de chaque obligation doit être vérifié dans le texte complet et les règles applicables.",
    url: "https://dgr.kostacademy.com/reglementation-dgr-algerie",
  },
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dgr.kostacademy.com";

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Accueil", item: siteUrl },
    {
      "@type": "ListItem",
      position: 2,
      name: "Réglementation DGR Algérie",
      item: `${siteUrl}/reglementation-dgr-algerie`,
    },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Que prévoit le Décret 21-253 concernant les programmes de formation DGR ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "L'article 14 vise l'examen et l'évaluation, par l'ANAC, des procédures et programmes de formation des exploitants des services aériens pour le transport de marchandises dangereuses. Cet extrait ne suffit pas à conclure que chaque salarié d'un transitaire ou chaque agent cargo relève automatiquement d'une fonction 7.1. Le périmètre individuel doit être déterminé à partir des tâches, du texte complet, des règles de l'État et des exigences de l'exploitant.",
      },
    },
    {
      "@type": "Question",
      name: "Qu'est-ce qu'un « Inspecteur marchandises dangereuses » pour l'ANAC ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "C'est une fonction officiellement reconnue par l'État algérien : l'Annexe 2 du Décret 21-253 (modèle-type de la carte d'inspecteur de l'aviation civile) liste explicitement le rôle « Inspecteur marchandises dangereuses (Dangerous goods inspector) » parmi les habilitations que peut détenir un inspecteur ANAC.",
      },
    },
    {
      "@type": "Question",
      name: "Comment vérifier si un parcours CBTA est applicable ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Le CBTA est une approche fondée sur les compétences utilisée dans les cadres de formation aux marchandises dangereuses. Son application précise, les tâches concernées et les modalités d'évaluation doivent être vérifiées dans les éditions officielles en vigueur, les variations de l'État et les exigences de l'exploitant. Cette page ne constitue ni une décision juridique ni une validation de prestataire.",
      },
    },
  ],
};

export default function ReglementationPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Navbar />
      <main className="bg-white">
        {/* Hero */}
        <section className="bg-gradient-to-br from-[#002A56] to-[#003D7A] text-white">
          <div className="container-x max-w-4xl py-14 md:py-20">
            <nav className="text-sm text-white/40 mb-6 flex items-center gap-2">
              <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
              <span>/</span>
              <span className="text-white/70">Réglementation DGR</span>
            </nav>
            <span className="inline-block text-sm uppercase tracking-wider text-[#F39C12] font-bold mb-3">
              Cadre légal — sources officielles
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4">
              Réglementation du transport de marchandises dangereuses en Algérie
            </h1>
            <p className="text-white/80 text-lg max-w-2xl leading-relaxed">
              Le Décret exécutif n°21-253 décrit notamment des missions de contrôle relatives aux programmes de formation des exploitants des services aériens pour le transport de marchandises dangereuses. Les extraits ci-dessous doivent être lus dans le texte complet ; ils ne déterminent pas à eux seuls les fonctions applicables à chaque salarié ou prestataire.
            </p>
          </div>
        </section>

        {/* Décret 21-253 */}
        <section className="container-x max-w-3xl py-14">
          <h2 className="text-2xl font-extrabold text-[#0f1c2e] mb-4">
            1. Le Décret exécutif n°21-253 du 6 juin 2021
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Publié au{" "}
            <a
              href="https://www.anac.dz/wp-content/uploads/2025/01/21-253.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#003D7A] underline font-semibold"
            >
              Journal Officiel n°46 du 13 juin 2021
            </a>
            , ce décret fixe les modalités de contrôle des services aéronautiques et de leurs
            prestataires par l'ANAC (Agence Nationale de l'Aviation Civile).
          </p>

          <div className="bg-[#f7f9fc] border-l-4 border-[#F39C12] rounded-r-xl p-6 my-6">
            <p className="text-xs font-bold text-[#003D7A] uppercase tracking-wide mb-2">
              Article 14 — Section 2, contrôle de l'exploitation technique
            </p>
            <p className="text-gray-800 italic leading-relaxed">
              « Les missions de contrôle de l'inspecteur de l'exploitation technique des aéronefs
              portent, notamment sur […] l'examen et l'évaluation des procédures et des
              programmes de formation des exploitants des services aériens{" "}
              <strong>pour le transport de marchandises dangereuses</strong>. »
            </p>
          </div>

          <div className="bg-[#f7f9fc] border-l-4 border-[#F39C12] rounded-r-xl p-6 my-6">
            <p className="text-xs font-bold text-[#003D7A] uppercase tracking-wide mb-2">
              Annexe 1 — Qualification des inspecteurs de l'aviation civile
            </p>
            <p className="text-gray-800 italic leading-relaxed">
              Parmi les compétences exigées de l'inspecteur en exploitation technique des
              aéronefs : «{" "}
              <strong>réglementation de transport aérien de marchandises dangereuses</strong>. »
            </p>
          </div>

          <div className="bg-[#f7f9fc] border-l-4 border-[#F39C12] rounded-r-xl p-6 my-6">
            <p className="text-xs font-bold text-[#003D7A] uppercase tracking-wide mb-2">
              Annexe 2 — Modèle-type de la carte d'inspecteur ANAC
            </p>
            <p className="text-gray-800 leading-relaxed">
              La carte officielle d'inspecteur de l'aviation civile liste, parmi les habilitations
              possibles : <strong>« Inspecteur marchandises dangereuses (Dangerous goods
              inspector) »</strong> — une fonction de contrôle formellement reconnue par l'État
              algérien.
            </p>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            Source primaire consultable intégralement :{" "}
            <a
              href="https://www.anac.dz/wp-content/uploads/2025/01/21-253.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              anac.dz — Décret exécutif n°21-253 (PDF)
            </a>
          </p>
        </section>

        {/* OACI / IATA */}
        <section className="bg-gray-50 py-14">
          <div className="container-x max-w-3xl">
            <h2 className="text-2xl font-extrabold text-[#0f1c2e] mb-4">
              2. Repères internationaux : formation fondée sur les compétences
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Le CBTA (Competency-Based Training and Assessment) est une approche fondée sur les compétences. Pour déterminer les tâches, objectifs et modalités applicables, il faut consulter les textes officiels actuels de l'OACI et de l'IATA, les variations de l'État et les exigences de l'exploitant. Toute référence réglementaire utilisée dans un programme doit être identifiée précisément et vérifiée dans son édition applicable.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Ne déduisez pas la portée ou la reconnaissance d'un document à partir de son seul intitulé. Vérifiez le contenu, le périmètre de tâches, le statut du prestataire et l'acceptation du document auprès de l'autorité et de l'exploitant concernés.
            </p>
          </div>
        </section>

        {/* Positionnement KOST */}
        <section className="container-x max-w-3xl py-14">
          <h2 className="text-2xl font-extrabold text-[#0f1c2e] mb-4">
            3. Offre de formation KOST GROUP
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            KOST GROUP propose des formations et un accompagnement sur les marchandises dangereuses en transport aérien. Le programme et son périmètre sont définis à partir des tâches réellement exercées et des sources applicables. Toute mention d'un référencement IATA doit être vérifiée directement dans le registre officiel et ne vaut pas, à elle seule, approbation ANAC ni acceptation automatique par un exploitant.
          </p>
          <p className="text-sm text-gray-500">
            Vérifiez notre statut directement sur le{" "}
            <a
              href="https://www.iata.org/en/training/cbta-center-registry/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              registre officiel IATA CBTA Center Registry
            </a>
            .
          </p>
        </section>

        {/* CTA / Formulaire */}
        <section id="contact" className="bg-[#0f1c2e] py-14">
          <div className="container-x max-w-xl text-center text-white mb-8">
            <h2 className="text-2xl font-extrabold mb-3">
              Votre formation DGR est-elle conforme ?
            </h2>
            <p className="text-white/70 leading-relaxed">
              Demandez un échange de cadrage sur vos tâches, vos sources et vos besoins de formation. Cette démarche ne constitue pas un audit juridique ou une validation de conformité.
            </p>
          </div>
          <div className="container-x max-w-xl">
            <Suspense fallback={null}>
              <LeadForm sourcePage="/reglementation-dgr-algerie" />
            </Suspense>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppSticky />
    </>
  );
}
