import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppSticky from "@/components/WhatsAppSticky";
import LeadForm from "@/components/LeadForm";

export const metadata: Metadata = {
  title: "Formation DGR / CBTA Pharmacie & Biomédical — Cadrage par Tâches",
  description:
    "Cadrage DGR / CBTA pour activités pharmaceutiques et biomédicales. Le périmètre est déterminé à partir des produits, tâches réelles, sources courantes et revue requise.",
  alternates: { canonical: "/formation-dgr-pharmacie" },
  keywords: [
    "formation DGR pharmacie",
    "DGR biomédical",
    "glace sèche transport aérien",
    "marchandises dangereuses pharmacie",
    "CBTA pharmacie",
  ],
  openGraph: {
    title: "Formation DGR / CBTA Pharmacie & Biomédical — KOST GROUP",
    description:
      "Analyse des tâches et produits avant détermination du périmètre DGR / CBTA. Les classifications, instructions et obligations doivent être confirmées contre les sources courantes applicables.",
    url: "https://dgr.kostacademy.com/formation-dgr-pharmacie",
  },
};

const CONTEXTES = [
  "Produits thermosensibles et réfrigérants",
  "Échantillons biologiques et diagnostiques",
  "Produits chimiques ou gaz utilisés en laboratoire",
  "Batteries et équipements médicaux",
  "Expéditions aériennes nécessitant une analyse DGR",
];

export default function Page() {
  return (
    <>
      <Navbar />
      <WhatsAppSticky />
      <main className="bg-white">
        <section className="bg-gradient-to-br from-[#003d1a] to-[#00875a] text-white">
          <div className="container-x max-w-5xl py-16 md:py-20 text-center">
            <div className="inline-flex rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-sm font-bold mb-5">
              DGR / CBTA · pharmacie & biomédical
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">
              Cadrer les besoins DGR à partir des produits et des tâches
            </h1>
            <p className="text-lg text-white/80 leading-relaxed max-w-3xl mx-auto">
              Les références UN, instructions d'emballage, classifications et fonctions DGR ne sont pas déduites automatiquement d'un secteur ou d'un poste. Elles doivent être vérifiées contre les sources courantes applicables avant d'être utilisées dans une formation ou une évaluation.
            </p>
          </div>
        </section>

        <section className="container-x max-w-5xl py-14">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#006b45] mb-4">Contextes à analyser</h2>
          <p className="text-gray-700 mb-8 max-w-3xl">
            Cette liste sert uniquement à recueillir le contexte opérationnel. Elle ne constitue ni une classification réglementaire définitive, ni une attribution de fonction 7.x.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CONTEXTES.map((item) => (
              <div key={item} className="rounded-xl border border-emerald-100 bg-emerald-50 p-5 text-gray-700 font-semibold">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[#f7f9fc]">
          <div className="container-x max-w-5xl py-14">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#006b45] mb-8">Garde-fous de contenu</h2>
            <div className="grid md:grid-cols-2 gap-5">
              {[
                ["Source courante requise", "Une classification, instruction d'emballage, quantité, exigence documentaire ou obligation doit être reliée à une source faisant autorité et à jour avant utilisation en production."],
                ["SOURCE GAP / CONFLICT", "Si la preuve manque, l'état reste SOURCE GAP. Si des sources se contredisent, l'état reste SOURCE CONFLICT jusqu'à résolution."],
                ["Fonction par tâches", "La fonction 7.1–7.10 est déterminée depuis les tâches réellement exercées et la table de tâches propre à la fonction, jamais depuis le seul intitulé de poste."],
                ["Revue qualifiée", "Aucun contenu de production ne reçoit un statut APPROVED sans reviewer qualifié nommé, date de revue, vérification FR et revue EN séparée lorsque requise."],
              ].map(([title, text]) => (
                <div key={title} className="bg-white rounded-xl border border-gray-100 p-6">
                  <h3 className="font-extrabold text-[#006b45] mb-2">{title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="container-x max-w-4xl py-14">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#006b45] mb-4">Demander un cadrage</h2>
          <p className="text-gray-700 mb-8">
            Indiquez les produits concernés, la préparation réalisée, les documents manipulés, le rôle dans l'expédition et le contexte opérateur. Nous pouvons ensuite déterminer quelles sources et quelles tâches doivent être examinées.
          </p>
          <div className="max-w-2xl">
            <Suspense fallback={null}>
              <LeadForm sourcePage="/formation-dgr-pharmacie" />
            </Suspense>
          </div>
        </section>

        <nav className="bg-[#f1f5f9] px-6 py-5 text-center">
          <div className="flex gap-4 justify-center flex-wrap text-sm">
            <Link href="/formation-dgr-transitaires" className="text-[#003087] no-underline">DGR Transitaires</Link>
            <Link href="/formation-dgr-petrole-gaz" className="text-[#003087] no-underline">DGR Pétrole & Gaz</Link>
            <Link href="/" className="text-[#003087] no-underline">Accueil</Link>
          </div>
        </nav>
      </main>
      <Footer />
    </>
  );
}
