import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppSticky from "@/components/WhatsAppSticky";
import LeadForm from "@/components/LeadForm";

export const metadata: Metadata = {
  title: "Formation DGR / CBTA pour Entreprises — KOST GROUP",
  description:
    "Accompagnement DGR / CBTA pour entreprises : analyse des tâches, périmètre fonction par fonction, traçabilité des sources et proposition de formation adaptée.",
  alternates: { canonical: "/entreprises" },
  keywords: [
    "formation DGR entreprises Algérie",
    "formation marchandises dangereuses entreprise",
    "formation DGR intra entreprise",
    "CBTA entreprise",
    "formation fret aérien entreprise",
  ],
  openGraph: {
    title: "Formation DGR / CBTA pour Entreprises — KOST GROUP",
    description:
      "Analyse des tâches et définition du périmètre DGR / CBTA avant proposition de formation. Aucune fonction n'est attribuée automatiquement selon l'intitulé du poste.",
    url: "https://dgr.kostacademy.com/entreprises",
  },
};

const SECTEURS = [
  "Aviation & cargo",
  "Logistique & transit",
  "Industrie & énergie",
  "Pharmacie & santé",
  "Institutionnel",
  "Autres activités manipulant ou expédiant des marchandises dangereuses",
];

const ETAPES = [
  {
    num: "01",
    titre: "Analyse des tâches",
    desc: "Nous partons des tâches réellement exercées par les personnes concernées. Un intitulé de poste ne suffit pas à déterminer une fonction DGR.",
  },
  {
    num: "02",
    titre: "Détermination du périmètre",
    desc: "La fonction 7.1 à 7.10 applicable est étudiée à partir de sa propre table de tâches et de son propre jeu de sources ; la structure de 7.1 n'est pas copiée sur les autres fonctions.",
  },
  {
    num: "03",
    titre: "Vérification des sources",
    desc: "Les affirmations réglementaires exigent une preuve courante faisant autorité. Les écarts ou contradictions restent explicitement SOURCE GAP / SOURCE CONFLICT jusqu'à résolution.",
  },
  {
    num: "04",
    titre: "Proposition et revue",
    desc: "La proposition précise le périmètre à former. Une approbation de contenu de production exige le circuit de revue requis, dont un reviewer qualifié nommé et daté.",
  },
];

export default function EntreprisesPage() {
  return (
    <>
      <Navbar />
      <WhatsAppSticky />
      <main className="bg-white">
        <section className="bg-gradient-to-br from-[#002A56] to-[#003D7A] text-white">
          <div className="container-x max-w-5xl py-16 md:py-20">
            <nav className="text-sm text-white/40 mb-6 flex items-center gap-2">
              <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
              <span>/</span>
              <span className="text-white/70">Entreprises</span>
            </nav>
            <div className="inline-flex rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-sm font-bold text-[#F39C12] mb-5">
              DGR / CBTA · analyse des tâches avant proposition
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">
              Formation DGR / CBTA pour entreprises
            </h1>
            <p className="text-lg text-white/80 leading-relaxed max-w-3xl">
              Le périmètre de formation est défini à partir des activités réelles, des sources applicables et du circuit de revue requis. Cette page ne revendique ni exclusivité, ni approbation universelle ANAC/IATA, ni reconnaissance automatique par les compagnies aériennes.
            </p>
          </div>
        </section>

        <section className="container-x max-w-5xl py-14">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#003D7A] mb-6">Secteurs accompagnés</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SECTEURS.map((secteur) => (
              <div key={secteur} className="rounded-xl border border-gray-200 bg-[#f7f9fc] p-5 text-gray-700 font-semibold">
                {secteur}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[#f7f9fc]">
          <div className="container-x max-w-5xl py-14">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#003D7A] mb-8">Méthode de cadrage</h2>
            <div className="grid md:grid-cols-2 gap-5">
              {ETAPES.map((etape) => (
                <div key={etape.num} className="bg-white rounded-xl border border-gray-100 p-6">
                  <div className="text-[#F39C12] font-black text-lg mb-2">{etape.num}</div>
                  <h3 className="font-extrabold text-[#003D7A] mb-2">{etape.titre}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{etape.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container-x max-w-5xl py-14">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#003D7A] mb-4">Demander une proposition</h2>
          <p className="text-gray-700 mb-8 max-w-3xl">
            Indiquez les tâches des participants, le contexte opérationnel, la langue souhaitée et les contraintes d'organisation. La fonction DGR concernée sera confirmée après analyse, pas déduite automatiquement du poste.
          </p>
          <div id="formulaire" className="max-w-2xl">
            <Suspense fallback={null}>
              <LeadForm />
            </Suspense>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
