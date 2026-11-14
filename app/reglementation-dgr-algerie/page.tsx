import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppSticky from "@/components/WhatsAppSticky";
import LeadForm from "@/components/LeadForm";

export const metadata: Metadata = {
  title: "Réglementation DGR Algérie — Méthode de Vérification des Sources",
  description:
    "Guide de vérification pour le cadre DGR en Algérie : distinguer les textes nationaux, les sources OACI/IATA, les exigences opérateur et les preuves nécessaires avant toute affirmation réglementaire.",
  alternates: { canonical: "/reglementation-dgr-algerie" },
  keywords: [
    "réglementation DGR Algérie",
    "ANAC marchandises dangereuses",
    "transport aérien marchandises dangereuses Algérie",
    "sources DGR Algérie",
    "CBTA Algérie",
  ],
  openGraph: {
    title: "Réglementation DGR Algérie — Vérifier les Sources",
    description:
      "Méthode conservatrice pour vérifier les textes nationaux, les sources OACI/IATA et les exigences opérateur avant toute conclusion DGR.",
    url: "https://dgr.kostacademy.com/reglementation-dgr-algerie",
  },
};

const SOURCE_LAYERS = [
  {
    title: "Textes nationaux algériens",
    text: "Identifier le texte officiel applicable, sa version, sa date d'effet et l'autorité compétente. Une référence à un décret ou arrêté ne doit pas être transformée en conclusion plus large que ce que le texte dit réellement.",
  },
  {
    title: "Sources OACI / IATA courantes",
    text: "Pour les affirmations réglementaires liées au DGR / CBTA, utiliser la version courante faisant autorité. Pour le programme 2026, une affirmation destinée à la banque de production doit être rattachée à la preuve Tier A requise de l'IATA DGR 67e édition 2026 lorsqu'elle relève de cette source.",
  },
  {
    title: "Exigences opérateur / compagnie",
    text: "Une politique interne d'opérateur ou de compagnie ne doit pas être présentée comme une règle universelle. Elle doit être identifiée séparément et datée.",
  },
  {
    title: "État de preuve",
    text: "Si la preuve manque : SOURCE GAP. Si deux sources pertinentes se contredisent : SOURCE CONFLICT. Aucun de ces états ne peut être promu en APPROVED.",
  },
];

export default function ReglementationPage() {
  return (
    <>
      <Navbar />
      <WhatsAppSticky />
      <main className="bg-white">
        <section className="bg-gradient-to-br from-[#002A56] to-[#003D7A] text-white">
          <div className="container-x max-w-4xl py-14 md:py-20">
            <nav className="text-sm text-white/40 mb-6 flex items-center gap-2">
              <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
              <span>/</span>
              <span className="text-white/70">Réglementation DGR</span>
            </nav>
            <span className="inline-block text-sm uppercase tracking-wider text-[#F39C12] font-bold mb-3">
              Cadre de vérification — pas une déclaration d'agrément
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4">
              Vérifier le cadre DGR applicable en Algérie
            </h1>
            <p className="text-white/80 text-lg max-w-3xl leading-relaxed">
              Cette page décrit la méthode de preuve à suivre avant d'affirmer qu'une obligation, une fonction, une validité, une reconnaissance ou une approbation s'applique. Elle ne revendique pas de statut ANAC/IATA pour KOST GROUP.
            </p>
          </div>
        </section>

        <section className="container-x max-w-4xl py-14">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#003D7A] mb-8">Quatre couches à vérifier</h2>
          <div className="grid md:grid-cols-2 gap-5">
            {SOURCE_LAYERS.map((source) => (
              <div key={source.title} className="rounded-xl border border-gray-200 bg-[#f7f9fc] p-6">
                <h3 className="font-extrabold text-[#003D7A] mb-2">{source.title}</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{source.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[#f7f9fc]">
          <div className="container-x max-w-4xl py-14">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#003D7A] mb-6">Règles pour les fonctions 7.1–7.10</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Chaque fonction est dérivée de sa propre table de tâches et de son propre jeu de sources. La structure ou le nombre de sous-tâches de la fonction 7.1 ne doit jamais être copié mécaniquement vers 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9 ou 7.10.
              </p>
              <p>
                Les sources françaises sont vérifiées dans leur circuit propre. La revue technique bilingue anglaise est une étape distincte lorsqu'elle est requise. Une traduction ou un miroir de statut ne remplace pas une revue bilingue réelle.
              </p>
              <p>
                Aucun item ou état de banque ne doit être présenté comme APPROVED sans reviewer qualifié nommé et date de revue. Les preuves de qualification du reviewer et la chaîne d'approbation doivent rester auditables.
              </p>
            </div>
          </div>
        </section>

        <section className="container-x max-w-4xl py-14">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#003D7A] mb-5">Ce qu'il faut éviter</h2>
          <ul className="space-y-3 text-gray-700 list-disc pl-6">
            <li>Présenter une référence réglementaire comme preuve d'une conclusion qu'elle ne formule pas directement.</li>
            <li>Présenter une exigence d'un opérateur comme une obligation universelle.</li>
            <li>Affirmer une durée, une reconnaissance, une sanction ou une approbation sans source actuelle et directement applicable.</li>
            <li>Utiliser un statut commercial ou marketing comme preuve réglementaire.</li>
          </ul>
        </section>

        <section id="contact" className="bg-[#002A56] text-white">
          <div className="container-x max-w-3xl py-14">
            <h2 className="text-2xl font-extrabold mb-3">Demander une analyse de périmètre</h2>
            <p className="text-white/75 mb-8">
              Indiquez les tâches réelles, l'activité concernée et les sources ou exigences déjà disponibles. Le périmètre sera traité comme une question à vérifier, pas comme une conclusion automatique.
            </p>
            <Suspense fallback={null}>
              <LeadForm sourcePage="/reglementation-dgr-algerie" />
            </Suspense>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
