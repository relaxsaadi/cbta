"use client";

import { Suspense } from "react";
import Link from "next/link";
import { ArrowDown, MessageCircle, Check, ChevronLeft } from "lucide-react";
import type { Formation } from "@/lib/formations";
import { WHATSAPP_LINK, getFormationBySlug } from "@/lib/formations";
import { MENTION_FR, formatDa } from "@/lib/kost-facts";
import Accreditations from "@/components/Accreditations";
import RelatedTrainings from "@/components/RelatedTrainings";
import { faqPageJsonLd } from "@/lib/jsonld";
import { trackWhatsApp } from "@/lib/tracking";
import LeadForm from "@/components/LeadForm";
import Footer from "@/components/Footer";
import WhatsAppSticky from "@/components/WhatsAppSticky";
import ScrollTracker from "@/components/ScrollTracker";
import DGRPageView from "@/components/DGRPageView";

const HOW_WE_CONFIRM = [
  "Nous partons des tâches réellement exercées par chaque participant, pas de l'intitulé du poste.",
  "Nous comparons ces tâches au référentiel de compétences CBTA de la fonction.",
  "Nous vérifions l'édition courante du DGR IATA et les textes ANAC applicables, dont l'instruction technique 38-25.",
  "Nous confirmons par écrit la fonction, la durée, la modalité (Bab Ezzouar, intra ou classe virtuelle) et le prix.",
];

export default function DGRPage({ formation }: { formation: Formation }) {
  const recurrent = getFormationBySlug(`${formation.slug}-recurrent`);
  const fnCode = formation.slug.replace("dgr-", "").replace("-", ".");
  const faqs = [
    {
      q: `Combien coûte la formation DGR ${fnCode} ?`,
      a: `${formatDa(formation.prixDa)} HT par participant pour la formation ${formation.code} (${formation.duree}), TVA formation de 9 % en sus.${recurrent ? ` Le recyclage est à ${formatDa(recurrent.prixDa)} HT.` : ""} Le prix est confirmé dans la proposition écrite, avec la modalité et le nombre de participants.`,
    },
    {
      q: "KOST Academy est-elle agréée pour cette fonction ?",
      a: `Oui. KOST Academy est un ${MENTION_FR}. Les liens vers le registre IATA et la liste ANAC des écoles de formation figurent sur cette page, dans le bloc « Nos agréments ».`,
    },
    {
      q: "Comment savoir si cette fonction correspond à mon poste ?",
      a: "Décrivez les tâches de chaque participant : préparer, emballer, documenter, accepter, manutentionner, charger, informer les passagers ou contrôler. Nous les comparons au référentiel CBTA de la fonction. Un intitulé de poste ou une ancienne catégorie ne suffit pas à choisir la fonction.",
    },
  ];
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqPageJsonLd(faqs) }} />
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
                {formation.code} · {formation.duree}
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">
                {formation.title}
              </h1>
              <p className="text-lg text-white/85 leading-relaxed mb-4 max-w-2xl">
                {formation.description}
              </p>
              <p className="text-xl font-extrabold text-white mb-6">
                {formatDa(formation.prixDa)} HT par participant
                <span className="block text-sm font-normal text-white/75">
                  TVA formation 9 % en sus{recurrent ? ` · Recyclage : ${formatDa(recurrent.prixDa)} HT` : ""}
                </span>
              </p>
              <div className="mb-8">
                <Accreditations lang="fr" tone="dark" withHeading />
              </div>
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
              Comment nous confirmons la fonction {fnCode}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-8">
              La fonction {formation.code} couvre un ensemble de tâches précis. Avant l&apos;inscription, nous vérifions avec vous qu&apos;elle correspond au travail réel des participants.
            </p>
            <ul className="space-y-3">
              {HOW_WE_CONFIRM.map((line) => (
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
              Décrivez les tâches réellement exercées : préparation, emballage, documentation, acceptation, manutention, chargement, exploitation, information passagers, sûreté ou autres activités pertinentes. Nous comparons ensuite ces tâches au référentiel CBTA de la fonction et aux textes applicables.
            </p>
            <p className="text-sm text-gray-600 border-l-4 border-[#F39C12] pl-4">
              Un poste, un secteur ou une ancienne catégorie DGR ne suffit pas à confirmer automatiquement une fonction 7.x.
            </p>
          </div>
        </section>

        {(formation.slug === "dgr-7-1" || formation.slug === "dgr-7-3") && (
          <section id="recyclage" className="section bg-[#F8FAFC] border-y border-gray-100">
            <div className="container-x max-w-4xl">
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#003D7A] mb-5">
                Recyclage de la fonction {formation.slug === "dgr-7-1" ? "7.1" : "7.3"}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Le recyclage de la fonction {formation.slug === "dgr-7-1" ? "7.1" : "7.3"} a lieu à des intervalles ne dépassant pas 24 mois, selon le DGR IATA en vigueur.{recurrent ? ` Durée : ${recurrent.duree}. Prix : ${formatDa(recurrent.prixDa)} HT par participant, TVA formation 9 % en sus.` : ""} Voir aussi la page{" "}
                <Link href="/recyclage-dgr-24-mois" className="underline">recyclage DGR 24 mois</Link>.
              </p>
            </div>
          </section>
        )}

        <section className="section bg-white">
          <div className="container-x max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#003D7A] mb-6 text-center">
              Questions fréquentes
            </h2>
            <div className="space-y-3">
              {faqs.map((item) => (
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
        <RelatedTrainings path={`/${formation.slug}`} lang="fr" />
      </main>
      <Footer />
      <WhatsAppSticky />
    </>
  );
}
