import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppSticky from "@/components/WhatsAppSticky";
import LeadForm from "@/components/LeadForm";
import TrackedLink from "@/components/TrackedLink";

export const metadata: Metadata = {
  title: "Formation DGR / CBTA Transitaires — Cadrage par Tâches",
  description:
    "Cadrage DGR / CBTA pour transitaires et activités de fret aérien. La fonction 7.1 à 7.10 est déterminée à partir des tâches réellement exercées et des sources courantes applicables.",
  alternates: { canonical: "/formation-dgr-transitaires" },
  keywords: [
    "formation DGR transitaires",
    "marchandises dangereuses fret aérien",
    "CBTA transitaires",
    "DGR agents de fret",
    "formation DGR Algérie",
  ],
  openGraph: {
    title: "Formation DGR / CBTA Transitaires — KOST GROUP",
    description:
      "Analyse des tâches et sources avant détermination du périmètre DGR / CBTA pour transitaires et équipes fret.",
    url: "https://dgr.kostacademy.com/formation-dgr-transitaires",
  },
};

const TASK_CONTEXTS = [
  "Préparation ou organisation d'expéditions aériennes",
  "Classification, emballage, marquage, étiquetage ou documentation",
  "Réception, acceptation, manutention, stockage ou chargement",
  "Contrôle documentaire ou coordination avec un opérateur aérien",
];

const READINESS = [
  "La fonction n'est pas attribuée depuis le titre « transitaire » : les tâches réelles sont analysées d'abord.",
  "Chaque fonction 7.1–7.10 utilise sa propre table de tâches et son propre jeu de sources ; 7.1 n'est pas un modèle mécanique pour les autres fonctions.",
  "Une affirmation réglementaire de production exige une preuve courante faisant autorité ; sinon elle reste SOURCE GAP ou SOURCE CONFLICT.",
  "La vérification FR et la revue EN bilingue sont distinctes lorsqu'elles sont requises.",
  "Aucun statut APPROVED sans reviewer qualifié nommé et date de revue.",
];

export default function Page() {
  return (
    <>
      <Navbar />
      <WhatsAppSticky />
      <main className="bg-white">
        <section className="bg-gradient-to-br from-[#1a1a2e] to-[#003087] text-white">
          <div className="container-x max-w-5xl py-16 md:py-20 text-center">
            <p className="text-sm uppercase tracking-widest text-white/60 mb-3">Transitaires & fret aérien</p>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">
              Cadrage DGR / CBTA fondé sur les tâches
            </h1>
            <p className="text-lg text-white/80 leading-relaxed max-w-3xl mx-auto mb-8">
              Le fait d'être transitaire, agent fret ou commissionnaire ne suffit pas à déterminer automatiquement une fonction DGR. Le périmètre doit être établi à partir des activités réellement exercées et des sources courantes applicables.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a href="#analyse" className="rounded-lg bg-white px-6 py-3 font-bold text-[#003087] no-underline">
                Voir le cadrage
              </a>
              <TrackedLink
                track="whatsapp"
                location="formation-dgr-transitaires"
                href="https://wa.me/213542305383?text=Bonjour%2C%20je%20souhaite%20un%20cadrage%20DGR%20%2F%20CBTA%20pour%20des%20t%C3%A2ches%20de%20transit%20ou%20fret%20a%C3%A9rien"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-[#25D366] px-6 py-3 font-bold text-white no-underline"
              >
                WhatsApp
              </TrackedLink>
            </div>
          </div>
        </section>

        <section id="analyse" className="container-x max-w-5xl py-14">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#003087] mb-4">Tâches à documenter</h2>
          <p className="text-gray-700 max-w-3xl mb-8">
            Cette liste sert à recueillir le contexte opérationnel. Elle ne constitue pas, à elle seule, une attribution de fonction ni une conclusion réglementaire.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {TASK_CONTEXTS.map((task) => (
              <div key={task} className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-gray-700 font-semibold">
                {task}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[#f7f9fc]">
          <div className="container-x max-w-5xl py-14">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#003087] mb-8">Garde-fous avant utilisation en production</h2>
            <div className="space-y-4">
              {READINESS.map((item) => (
                <div key={item} className="rounded-xl border border-gray-200 bg-white p-5 text-gray-700 leading-relaxed">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container-x max-w-4xl py-14">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#003087] mb-4">Prix, durée, validité et reconnaissance</h2>
          <p className="text-gray-700 leading-relaxed">
            Aucune durée, périodicité, reconnaissance universelle, prix, taux de réussite, sanction ou modalité d'examen n'est affirmé par défaut sur cette page. Ces éléments doivent être confirmés dans la source réglementaire, l'exigence opérateur ou la proposition commerciale effectivement applicable.
          </p>
        </section>

        <section className="bg-[#003087] py-14 px-6 text-white">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-extrabold mb-3 text-center">Demander une analyse de périmètre</h2>
            <p className="text-white/80 mb-8 text-center">
              Décrivez les tâches des participants et le contexte de l'expédition. La fonction à examiner sera confirmée après analyse, pas déduite du poste.
            </p>
            <Suspense fallback={null}>
              <LeadForm sourcePage="/formation-dgr-transitaires" />
            </Suspense>
          </div>
        </section>

        <nav className="bg-gray-50 px-6 py-5 text-center">
          <div className="flex gap-4 justify-center flex-wrap text-sm">
            <Link href="/planning" className="text-[#003087] no-underline">Planning</Link>
            <Link href="/reglementation-dgr-algerie" className="text-[#003087] no-underline">Méthode de vérification réglementaire</Link>
            <Link href="/" className="text-[#003087] no-underline">Accueil</Link>
          </div>
        </nav>
      </main>
      <Footer />
    </>
  );
}
