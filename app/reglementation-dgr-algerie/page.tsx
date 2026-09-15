import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppSticky from "@/components/WhatsAppSticky";
import LeadForm from "@/components/LeadForm";

export const metadata: Metadata = {
  title: "Réglementation DGR Algérie — Décret 21-253, Contrôle ANAC",
  description:
    "Décret 21-253 : cadre réglementaire du transport de marchandises dangereuses en Algérie, contrôle ANAC, approche CBTA. Textes sourcés au Journal Officiel.",
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
      "Le cadre légal complet, sourcé au Journal Officiel : obligation de contrôle ANAC des formations marchandises dangereuses (Décret 21-253, Art. 14).",
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
      name: "Existe-t-il une obligation légale de formation DGR en Algérie ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui. Le Décret exécutif n°21-253 du 6 juin 2021 (Journal Officiel n°46) impose à l'ANAC, dans son article 14, « l'examen et l'évaluation des procédures et des programmes de formation des exploitants des services aériens pour le transport de marchandises dangereuses ». L'Annexe 1 du même décret exige que l'inspecteur en exploitation technique maîtrise la « réglementation de transport aérien de marchandises dangereuses ».",
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
      name: "Le format CBTA est-il obligatoire pour les formations DGR ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Le CBTA (Competency-Based Training and Assessment) est le format défini par l'OACI (Annexe 18, Décision DGP/27) et repris par la réglementation IATA DGR (section 1.5) comme standard international de référence pour la formation aux marchandises dangereuses. KOST GROUP est le premier centre CBTA Provider certifié IATA en Algérie.",
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
              Le Décret exécutif n°21-253 impose à l'ANAC une obligation légale de contrôle des
              formations DGR. Voici les textes exacts, sourcés au Journal Officiel — vérifiables
              par vous-même.
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
              2. L'exigence internationale : Annexe 18 OACI et standard IATA CBTA
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Le CBTA (Competency-Based Training and Assessment — formation et évaluation axées
              sur les compétences) est le format défini au niveau international par l'OACI
              (Décision DGP/27, s'inscrivant dans le cadre de l'Annexe 18 de la Convention relative
              à l'aviation civile internationale) et repris par la réglementation IATA DGR (section
              1.5) comme standard de référence pour la formation au transport aérien de
              marchandises dangereuses.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Concrètement : un certificat DGR délivré selon l'ancien modèle par catégories (1 à
              12) et un certificat CBTA ne couvrent pas la même reconnaissance internationale.
              Vérifiez toujours le format exact de la certification proposée par un centre de
              formation avant de vous engager.
            </p>
          </div>
        </section>

        {/* Positionnement KOST */}
        <section className="container-x max-w-3xl py-14">
          <h2 className="text-2xl font-extrabold text-[#0f1c2e] mb-4">
            3. KOST GROUP — Premier centre CBTA Provider certifié IATA en Algérie
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Face à cette double obligation — contrôle ANAC (Décret 21-253) et standard
            international CBTA (OACI/IATA) — KOST GROUP est le premier centre de formation en
            Algérie certifié IATA CBTA Provider, permettant à vos équipes d'obtenir une
            certification reconnue sans déplacement à l'étranger.
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
              Demandez un audit gratuit de vos obligations réglementaires — réponse sous 24h.
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
