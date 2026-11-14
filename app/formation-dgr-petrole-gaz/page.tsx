import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppSticky from "@/components/WhatsAppSticky";
import LeadForm from "@/components/LeadForm";
import TrackedLink from "@/components/TrackedLink";

export const metadata: Metadata = {
  title: "Formation DGR / CBTA Pétrole & Gaz — Cadrage par Tâches",
  description:
    "Cadrage DGR / CBTA pour activités pétrole, gaz et énergie. Produits, tâches et fonctions sont vérifiés contre les sources courantes applicables avant toute conclusion réglementaire.",
  alternates: { canonical: "/formation-dgr-petrole-gaz" },
  keywords: [
    "formation DGR pétrole gaz",
    "marchandises dangereuses énergie",
    "DGR hydrocarbures",
    "CBTA pétrole gaz",
    "transport aérien marchandises dangereuses",
  ],
  openGraph: {
    title: "Formation DGR / CBTA Pétrole & Gaz — KOST GROUP",
    description:
      "Analyse des produits et tâches avant détermination du périmètre DGR / CBTA pour les activités pétrole, gaz et énergie.",
    url: "https://dgr.kostacademy.com/formation-dgr-petrole-gaz",
  },
};

const CONTEXTS = [
  "Produits, substances ou équipements destinés à une expédition aérienne",
  "Préparation, emballage, marquage, étiquetage ou documentation",
  "Réception, acceptation, manutention, stockage ou chargement",
  "Coordination logistique, opérations aériennes ou contrôle documentaire",
];

const CHECKS = [
  "Identifier précisément le produit ou l'article concerné avant toute classification ou conclusion DGR.",
  "Relier toute classification, instruction, quantité, exigence documentaire ou restriction à une source courante faisant autorité.",
  "Déterminer la fonction 7.1–7.10 à partir des tâches réellement exercées et de la table de tâches propre à cette fonction, jamais du secteur ou du poste seul.",
  "Conserver SOURCE GAP lorsque la preuve manque et SOURCE CONFLICT lorsque des sources pertinentes se contredisent.",
  "Exiger la vérification FR, la revue EN séparée lorsqu'elle s'applique et un reviewer qualifié nommé avec date avant APPROVED.",
];

export default function Page() {
  return (
    <>
      <Navbar />
      <WhatsAppSticky />
      <main className="bg-white">
        <section className="bg-gradient-to-br from-[#1c1c1c] via-[#3d1a00] to-[#7c3800] text-white">
          <div className="container-x max-w-5xl py-16 md:py-20 text-center">
            <p className="text-sm uppercase tracking-widest text-white/60 mb-3">Pétrole, gaz & énergie</p>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">
              Cadrer le besoin DGR / CBTA à partir des produits et des tâches
            </h1>
            <p className="text-lg text-white/80 leading-relaxed max-w-3xl mx-auto mb-8">
              Le secteur d'activité, un nom de société ou un intitulé de poste ne suffit pas à déterminer une classe, une obligation ou une fonction DGR. Le périmètre doit être établi à partir du produit réellement expédié, des tâches exercées et des sources applicables.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a href="#cadrage" className="rounded-lg bg-white px-6 py-3 font-bold text-[#7c3800] no-underline">
                Voir la méthode
              </a>
              <TrackedLink
                track="whatsapp"
                location="formation-dgr-petrole-gaz"
                href="https://wa.me/213542305383?text=Bonjour%2C%20je%20souhaite%20un%20cadrage%20DGR%20%2F%20CBTA%20pour%20des%20activit%C3%A9s%20p%C3%A9trole%2C%20gaz%20ou%20%C3%A9nergie"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-[#25D366] px-6 py-3 font-bold text-white no-underline"
              >
                WhatsApp
              </TrackedLink>
            </div>
          </div>
        </section>

        <section id="cadrage" className="container-x max-w-5xl py-14">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#7c3800] mb-4">Contexte à documenter</h2>
          <p className="text-gray-700 max-w-3xl mb-8">
            Ces éléments servent à préparer l'analyse. Ils ne constituent pas une classification définitive et n'attribuent pas automatiquement une fonction 7.x.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {CONTEXTS.map((item) => (
              <div key={item} className="rounded-xl border border-orange-100 bg-orange-50 p-5 text-gray-700 font-semibold">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[#fff8f0]">
          <div className="container-x max-w-5xl py-14">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#7c3800] mb-8">Contrôles avant utilisation en production</h2>
            <div className="space-y-4">
              {CHECKS.map((item) => (
                <div key={item} className="rounded-xl border border-orange-100 bg-white p-5 text-gray-700 leading-relaxed">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container-x max-w-4xl py-14">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#7c3800] mb-4">Pas de mapping commercial automatique</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Cette page ne présente aucune entreprise comme cliente, ne revendique aucun statut IATA/ANAC, et ne relie pas automatiquement des rôles tels que logistique, supply-chain, opérations ou manutention à une fonction DGR précise.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Les prix, durées, lieux, modalités d'examen, validités et éventuelles exigences opérateur sont confirmés seulement dans une proposition ou une source actuelle effectivement applicable au cas concerné.
          </p>
        </section>

        <section className="bg-[#7c3800] py-14 px-6 text-white">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-extrabold mb-3 text-center">Demander une analyse de périmètre</h2>
            <p className="text-white/80 mb-8 text-center">
              Indiquez les produits ou équipements concernés, les tâches des participants et le contexte d'expédition. Le périmètre sera ensuite comparé aux sources et tables de tâches applicables.
            </p>
            <Suspense fallback={null}>
              <LeadForm sourcePage="/formation-dgr-petrole-gaz" />
            </Suspense>
          </div>
        </section>

        <nav className="bg-gray-50 px-6 py-5 text-center">
          <div className="flex gap-4 justify-center flex-wrap text-sm">
            <Link href="/formation-dgr-pharmacie" className="text-[#7c3800] no-underline">Pharmacie & biomédical</Link>
            <Link href="/reglementation-dgr-algerie" className="text-[#7c3800] no-underline">Méthode de vérification réglementaire</Link>
            <Link href="/" className="text-[#7c3800] no-underline">Accueil</Link>
          </div>
        </nav>
      </main>
      <Footer />
    </>
  );
}
