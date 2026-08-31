"use client";

import { Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowDown,
  MessageCircle,
  Clock,
  Users,
  Award,
  Check,
  ChevronLeft,
} from "lucide-react";
import type { Formation } from "@/lib/formations";
import { WHATSAPP_LINK } from "@/lib/formations";
import { trackWhatsApp } from "@/lib/tracking";
import LeadForm from "@/components/LeadForm";
import Footer from "@/components/Footer";
import WhatsAppSticky from "@/components/WhatsAppSticky";
import ScrollTracker from "@/components/ScrollTracker";
import DGRPageView from "@/components/DGRPageView";

export default function DGRPage({ formation }: { formation: Formation }) {
  return (
    <>
      <ScrollTracker />
      <DGRPageView formation={formation.code} />
      <main>
        {/* Hero spécifique */}
        <section className="relative bg-gradient-to-br from-[#003D7A] via-[#0a4a8a] to-[#002A56] text-white">
          <div className="container-x pt-12 pb-16 md:pt-20 md:pb-24">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-sm text-white/70 hover:text-white mb-8"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Toutes les formations
            </Link>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-[#F39C12]/20 border border-[#F39C12]/40 px-4 py-1.5 text-sm font-semibold text-[#F39C12] mb-5">
                <Award className="h-4 w-4" aria-hidden />
                {formation.code}
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">
                {formation.title}
              </h1>
              <p className="text-lg text-white/85 leading-relaxed mb-8 max-w-2xl">
                {formation.description}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                <Stat
                  icon={Users}
                  label="Public"
                  value={formation.publicCible}
                />
                <Stat icon={Clock} label="Durée" value={formation.duree} />
                <Stat
                  icon={Award}
                  label="Prix EUR"
                  value={`${formation.prixEur.toLocaleString("fr-FR")} €`}
                />
                <Stat
                  icon={Award}
                  label="Prix USD"
                  value={`${formation.prixUsd.toLocaleString("fr-FR")} $`}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href="#formulaire" className="btn-primary">
                  <ArrowDown className="h-5 w-5" aria-hidden />
                  Recevoir le programme détaillé
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
            </motion.div>
          </div>
        </section>

        {/* Programme */}
        <section className="section bg-white">
          <div className="container-x max-w-4xl">
            <div className="grid md:grid-cols-2 gap-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#003D7A] mb-5">
                  Programme détaillé
                </h2>
                <ul className="space-y-3">
                  {formation.programme.map((line, i) => (
                    <li key={i} className="flex gap-3 items-start">
                      <span className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#F39C12]/20 text-[#F39C12] mt-0.5">
                        <Check
                          className="h-3.5 w-3.5"
                          strokeWidth={3}
                          aria-hidden
                        />
                      </span>
                      <span className="text-gray-700 leading-relaxed">
                        {line}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#003D7A] mb-5">
                  Pour qui c'est
                </h2>
                <ul className="space-y-3">
                  {formation.postes.map((line, i) => (
                    <li key={i} className="flex gap-3 items-start">
                      <span className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#003D7A]/10 text-[#003D7A] mt-0.5">
                        <Users className="h-3.5 w-3.5" aria-hidden />
                      </span>
                      <span className="text-gray-700 leading-relaxed">
                        {line}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Modalités */}
        <section className="section bg-gray-50">
          <div className="container-x max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#003D7A] mb-8 text-center">
              Modalités
            </h2>
            <div className="grid md:grid-cols-3 gap-5">
              <div className="card text-center">
                <div className="text-xs uppercase tracking-wider text-[#F39C12] font-bold mb-2">
                  Format
                </div>
                <div className="font-bold text-lg">Présentiel</div>
                <p className="text-sm text-gray-600 mt-2">
                  Sessions à Alger ou intra-entreprise dans votre pays (à partir de 6 participants)
                </p>
              </div>
              <div className="card text-center">
                <div className="text-xs uppercase tracking-wider text-[#F39C12] font-bold mb-2">
                  Lieu
                </div>
                <div className="font-bold text-lg">Alger ou sur site</div>
                <p className="text-sm text-gray-600 mt-2">
                  Bab Ezzouar, Algérie · Déplacement possible Maroc, Sénégal, Côte d'Ivoire et toute Afrique francophone
                </p>
              </div>
              <div className="card text-center">
                <div className="text-xs uppercase tracking-wider text-[#F39C12] font-bold mb-2">
                  Prochaines sessions
                </div>
                <div className="font-bold text-lg">Juillet – Décembre 2026</div>
                <p className="text-sm text-gray-600 mt-2">
                  Sessions toutes les 4–6 semaines à Alger
                </p>
                <Link
                  href="/planning"
                  className="inline-flex items-center gap-1 mt-3 text-sm font-bold text-[#003D7A] hover:text-[#F39C12] transition-colors"
                >
                  Voir le planning complet →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Inclus */}
        <section className="section bg-white">
          <div className="container-x max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#003D7A] mb-8 text-center">
              Ce qui est inclus
            </h2>
            <div className="card">
              <ul className="space-y-3">
                {[
                  "Formation présentielle avec formateur expérimenté",
                  "Manuel IATA DGR 2026 (67e édition)",
                  "Évaluation CBTA",
                  "Certificat DGR-CBTA numérique",
                  "Exercices pratiques et cas réels",
                  "Facturation officielle France ou Algérie",
                ].map((t) => (
                  <li key={t} className="flex gap-3 items-start">
                    <span className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#F39C12] text-white mt-0.5">
                      <Check
                        className="h-3.5 w-3.5"
                        strokeWidth={3}
                        aria-hidden
                      />
                    </span>
                    <span className="text-gray-700">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ courte */}
        <section className="section bg-gray-50">
          <div className="container-x max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#003D7A] mb-8 text-center">
              Questions sur la {formation.code}
            </h2>
            <div className="space-y-3">
              {[
                {
                  q: "Faut-il un prérequis pour cette formation ?",
                  a:
                    formation.category === "recurrent"
                      ? "Oui — il faut être titulaire d'une certification 7.x active arrivant à échéance."
                      : "Non, la formation initiale est ouverte à tout professionnel concerné par les marchandises dangereuses dans son activité.",
                },
                {
                  q: "Quelle est la durée de validité du certificat ?",
                  a: "24 mois. Un recyclage CBTA est obligatoire avant cette date.",
                },
                {
                  q: "Le certificat est-il reconnu hors Algérie ?",
                  a: "Le référentiel IATA DGR-CBTA est le standard de formation utilisé au niveau international. Nous vous recommandons de vérifier les exigences spécifiques de votre compagnie aérienne ou autorité.",
                },
              ].map((it, i) => (
                <details
                  key={i}
                  className="rounded-xl bg-white border border-gray-200 p-5 group"
                >
                  <summary className="font-semibold cursor-pointer list-none flex items-center justify-between">
                    {it.q}
                    <span className="text-[#003D7A] group-open:rotate-180 transition-transform">▾</span>
                  </summary>
                  <p className="mt-3 text-gray-600">{it.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <Suspense fallback={null}>
          <LeadForm
            defaultFormation={formation.code}
            sourcePage={`/${formation.slug}`}
          />
        </Suspense>
      </main>
      <Footer />
      <WhatsAppSticky />
    </>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm p-4">
      <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#F39C12] font-bold mb-1">
        <Icon className="h-3.5 w-3.5" aria-hidden />
        {label}
      </div>
      <div className="font-bold text-sm md:text-base leading-snug">{value}</div>
    </div>
  );
}
