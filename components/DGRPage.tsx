"use client";

import { Suspense } from "react";
import Link from "next/link";
import { ArrowDown, MessageCircle, Check, ChevronLeft } from "lucide-react";
import type { Formation } from "@/lib/formations";
import { WHATSAPP_LINK } from "@/lib/formations";
import { trackWhatsApp } from "@/lib/tracking";
import LeadForm from "@/components/LeadForm";
import Footer from "@/components/Footer";
import WhatsAppSticky from "@/components/WhatsAppSticky";
import ScrollTracker from "@/components/ScrollTracker";
import DGRPageView from "@/components/DGRPageView";

const READINESS_REQUIREMENTS = [
  "Table de tâches propre à la fonction — aucune copie mécanique de la structure 7.1",
  "Matrice source / compétence propre à la fonction",
  "Blueprint de la fonction aligné sur son jeu de tâches courant",
  "Preuve Tier A courante directement liée à chaque affirmation réglementaire de production",
  "SOURCE GAP ou SOURCE CONFLICT explicite tant que la preuve manque ou se contredit",
  "Vérification FR et revue technique EN distincte lorsqu'elles sont requises",
  "Reviewer qualifié nommé et date de revue avant tout statut APPROVED",
];

export default function DGRPage({ formation }: { formation: Formation }) {
  return (
    <>
      <ScrollTracker />
      <DGRPageView formation={formation.code} />
      <main>
        <section className="relative bg-gradient-to-br from-[#003D7A] via-[#0a4a8a] to-[#002A56] text-white">
          <div className="container-x pt-12 pb-16 md:pt-20 md:pb-24">
            <Link href="/" className="inline-flex items-center gap-1 text-sm text-white/70 hover:text-white mb-8">
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Toutes les fonctions
            </Link>
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#F39C12]/20 border border-[#F39C12]/40 px-4 py-1.5 text-sm font-semibold text-[#F39C12] mb-5">
                {formation.code} · périmètre à confirmer par tâches et sources
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">
                {formation.title}
              </h1>
              <p className="text-lg text-white/85 leading-relaxed mb-8 max-w-2xl">
                Cette page présente un point d'entrée de cadrage. Elle ne constitue pas, à elle seule, une preuve de reconnaissance, d'approbation, de durée, de prix, de validité ou d'obligation réglementaire. Le contenu de production est gouverné fonction par fonction.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href="#formulaire" className="btn-primary">
                  <ArrowDown className="h-5 w-5" aria-hidden />
                  Demander le cadrage
                </a>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsApp(`dgr-${formation.slug}`)}
                  className="btn-whatsapp"
                >
                  <MessageCircle className="h-5 w-5" aria-hidden />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="section bg-white">
          <div className="container-x max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#003D7A] mb-5">
              Conditions avant utilisation en production
            </h2>
            <p className="text-gray-700 leading-relaxed mb-8">
              La fonction {formation.code} est dérivée de son propre jeu de tâches et de sources. Les rôles, durées, prix, modalités d'examen et autres propriétés commerciales ou réglementaires ne doivent pas être déduits d'un modèle générique ni d'un intitulé de poste.
            </p>
            <ul className="space-y-3">
              {READINESS_REQUIREMENTS.map((line) => (
                <li key={line} className="flex gap-3 items-start">
                  <span className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#F39C12]/20 text-[#F39C12] mt-0.5">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                  </span>
                  <span className="text-gray-700 leading-relaxed">{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section bg-gray-50">
          <div className="container-x max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#003D7A] mb-6">
              Pour déterminer si cette fonction vous concerne
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Décrivez les tâches réellement exercées : préparation, emballage, documentation, acceptation, manutention, chargement, exploitation, information passagers, sûreté ou autres activités pertinentes. La réponse doit ensuite être comparée à la table de tâches courante de la fonction et aux sources applicables.
            </p>
            <p className="text-sm text-gray-600 border-l-4 border-[#F39C12] pl-4">
              Un poste, un secteur ou une ancienne catégorie DGR ne suffit pas à confirmer automatiquement une fonction 7.x.
            </p>
          </div>
        </section>

        <section className="section bg-white">
          <div className="container-x max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#003D7A] mb-6 text-center">
              Questions de gouvernance
            </h2>
            <div className="space-y-3">
              {[
                {
                  q: "Le contenu affiché ici est-il déjà APPROVED ?",
                  a: "Pas par défaut. Un statut APPROVED exige le circuit de preuve et de revue complet, avec reviewer qualifié nommé et date de revue.",
                },
                {
                  q: "Que se passe-t-il si une preuve réglementaire manque ?",
                  a: "Le point reste SOURCE GAP. S'il existe une contradiction entre sources pertinentes, il reste SOURCE CONFLICT jusqu'à résolution.",
                },
                {
                  q: "La reconnaissance ou la validité est-elle universelle ?",
                  a: "Aucune reconnaissance ou durée universelle n'est revendiquée ici. Elle doit être vérifiée contre la source et l'exigence opérateur/autorité applicables au cas concerné.",
                },
              ].map((item) => (
                <details key={item.q} className="rounded-xl bg-white border border-gray-200 p-5 group">
                  <summary className="font-semibold cursor-pointer list-none flex items-center justify-between">
                    {item.q}
                    <span className="text-[#003D7A] group-open:rotate-180 transition-transform">▾</span>
                  </summary>
                  <p className="mt-3 text-gray-600">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <div id="formulaire">
          <Suspense fallback={null}>
            <LeadForm defaultFormation={formation.code} sourcePage={`/${formation.slug}`} />
          </Suspense>
        </div>
      </main>
      <Footer />
      <WhatsAppSticky />
    </>
  );
}
