"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Clock, Users, ChevronDown, MessageCircle } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/lib/formations";
import { trackWhatsApp } from "@/lib/tracking";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
  }),
};

type Session = {
  id: string;
  badge: string;
  badgeColor: string;
  name: string;
  dates: string;
  days: string;
  hours: string;
  duration: string;
  price: string;
  audience: string;
  seatsLabel: string;
  slug?: string;
  urgent?: boolean;
};

const BADGE_TO_SLUG: Record<string, string> = {
  "DGR 7.1 — Initial": "dgr-7-1",
  "DGR 7.1 — Recurrent": "dgr-7-1-recurrent",
  "DGR 7.2": "dgr-7-2",
  "DGR 7.3 — Initial": "dgr-7-3",
  "DGR 7.3 — Recurrent": "dgr-7-3-recurrent",
  "DGR 7.4": "dgr-7-4",
  "DGR 7.5": "dgr-7-5",
  "DGR 7.6": "dgr-7-6",
  "DGR 7.7": "dgr-7-7",
  "DGR 7.8": "dgr-7-8",
  "DGR 7.9": "dgr-7-9",
  "DGR 7.10": "dgr-7-10",
};

type Month = {
  id: string;
  name: string;
  icon: string;
  sessions: Session[];
  closed?: boolean;
};

const MONTHS: Month[] = [
  {
    id: "planning",
    name: "Planning à confirmer",
    icon: "📅",
    sessions: [
      {
        id: "scope-review",
        badge: "Cadrage du programme",
        badgeColor: "bg-blue-500/15 text-blue-300 border border-blue-500/20",
        name: "Analyse des tâches, des sources et du périmètre de formation",
        dates: "Aucune date publiée",
        days: "À confirmer",
        hours: "À confirmer",
        duration: "À confirmer",
        price: "Sur devis",
        audience: "Selon les tâches réellement exercées et les exigences applicables",
        seatsLabel: "Aucune session confirmée",
      },
    ],
  },
];
function waLink(session: Session, month: string) {
  const text = encodeURIComponent(
    `Bonjour, je souhaite réserver la formation ${session.badge} — ${session.dates} (${month}). Merci de me confirmer les disponibilités.`
  );
  return `https://wa.me/${WHATSAPP_NUMBER.replace("+", "")}?text=${text}`;
}

function SessionCard({ session, month }: { session: Session; month: string }) {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all duration-200 hover:-translate-y-0.5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        {BADGE_TO_SLUG[session.badge] ? (
          <Link
            href={`/${BADGE_TO_SLUG[session.badge]}`}
            className={`text-xs font-bold px-3 py-1 rounded-full ${session.badgeColor} hover:opacity-80 transition-opacity`}
          >
            {session.badge} →
          </Link>
        ) : (
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${session.badgeColor}`}>
            {session.badge}
          </span>
        )}
        <span className="text-xs font-semibold text-white/50 bg-white/[0.06] px-2 py-1 rounded-full whitespace-nowrap">
          {session.seatsLabel}
        </span>
      </div>

      <p className="text-sm font-semibold text-white leading-snug">{session.name}</p>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 text-xs text-white/50">
          <Calendar size={12} className="shrink-0" />
          <strong className="text-white/80">{session.dates}</strong>
          <span className="text-white/30">·</span>
          <span>{session.days}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/50">
          <Clock size={12} className="shrink-0" />
          <strong className="text-white/80">{session.hours}</strong>
          <span className="text-white/30">·</span>
          <span>Modalité à confirmer</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/50">
          <Users size={12} className="shrink-0" />
          <span>{session.audience}</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/[0.07]">
        <span className="text-sm font-bold text-white/70">
          {session.duration} · <span className="text-white">{session.price}</span>
        </span>
        <a
          href={waLink(session, month)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 bg-green-500 hover:bg-green-400 text-black text-xs font-black px-4 py-2 rounded-full transition-all duration-150 hover:scale-105 whitespace-nowrap"
        >
          <MessageCircle size={12} />
          Demander des informations
        </a>
      </div>
    </div>
  );
}

function MonthBlock({ month }: { month: Month }) {
  const [open, setOpen] = useState(!month.closed);

  return (
    <div className={`border rounded-2xl overflow-hidden transition-colors duration-200 ${open ? "border-white/15" : "border-white/[0.07]"} bg-white/[0.02]`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white/[0.03] hover:bg-white/[0.05] transition-colors duration-150"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{month.icon}</span>
          <span className="text-base font-bold text-white">{month.name}</span>
        </div>
        <div className="flex items-center gap-2">
          {month.closed ? (
            <span className="text-xs font-semibold text-white/30 bg-white/[0.05] px-3 py-1 rounded-full">
              Fermé
            </span>
          ) : (
            <span className="text-xs font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-3 py-1 rounded-full">
              {month.sessions.length} session{month.sessions.length > 1 ? "s" : ""}
            </span>
          )}
          <ChevronDown
            size={18}
            className={`text-white/40 transition-transform duration-250 ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {open && (
        <div className="p-4">
          {month.closed ? (
            <div className="text-center py-8 text-white/30">
              <p className="text-3xl mb-2">😴</p>
              <p className="text-sm">Aucune session en Août · Reprise en Septembre 2026</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {month.sessions.map((s) => (
                <SessionCard key={s.id} session={s} month={month.name} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PlanningPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#002A56] via-[#003D7A] to-[#001a38] text-white">
      {/* HERO */}
      <section className="max-w-5xl mx-auto px-4 pt-10 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-wider">
          Formation DGR / CBTA — périmètre à confirmer
        </div>

        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-tight">
          Planning des formations{" "}
          <span className="text-yellow-400">DGR / CBTA</span>
        </h1>
        <p className="text-white/60 text-lg max-w-xl mx-auto mb-8 leading-relaxed">
          Formation selon périmètre et exigences applicables · Validité à confirmer<br />
          Dimanche – Jeudi · 08h30 – 16h30
        </p>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto mb-8">
          {[
            { num: "7.1–7.10", label: "Fonctions étudiées séparément" },
            { num: "Selon tâches", label: "Périmètre de formation" },
            { num: "À confirmer", label: "Dates et disponibilités" },
            { num: "Sur devis", label: "Durée et tarification" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="bg-white/[0.05] border border-white/10 rounded-xl p-4 text-center"
            >
              <div className="text-2xl font-black text-yellow-400">{s.num}</div>
              <div className="text-xs text-white/40 font-medium mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* PRICE ANCHOR */}
        <div className="inline-flex flex-wrap items-center justify-center gap-3 bg-green-500/[0.08] border border-green-500/20 rounded-xl px-5 py-3 mb-2">
          <span className="text-sm text-white/60">Programme, durée et tarification à confirmer pour chaque fonction.</span>
          <span className="text-green-400 text-lg">→</span>
          <span className="text-green-400 font-bold text-base">KOST GROUP : tarif à confirmer sur devis</span>
          <span className="bg-green-500 text-black text-xs font-black px-3 py-1 rounded-full uppercase">Devis personnalisé</span>
        </div>
      </section>

      {/* VALUE INCLUDED */}
      <section className="max-w-3xl mx-auto px-4 mb-10">
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
          <div className="bg-yellow-400/[0.08] border-b border-yellow-400/15 px-5 py-3 text-xs font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-2">
            Ce que vous obtenez avec chaque formation
          </div>
          {[
            { icon: "📘", label: "Références documentaires et accès aux sources applicables", val: "Valeur : 180 €" },
            { icon: "🏆", label: "Évaluation et document délivré selon conditions confirmées", val: "À confirmer" },
            { icon: "👨‍🏫", label: "Intervenants et qualifications communiqués avant la session", val: "Inclus" },
            { icon: "🍽️", label: "Hébergement & restauration (si déplacement)", val: "Inclus" },
            { icon: "📄", label: "Facturation selon l'entité contractante et le devis", val: "Inclus" },
            { icon: "🔄", label: "Formation récurrente si applicable selon les exigences en vigueur", val: "Inclus" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between px-5 py-3 border-t border-white/[0.05] gap-3">
              <span className="text-sm text-white/60 flex items-center gap-2">
                <span>{item.icon}</span>
                {item.label}
              </span>
              <span className="text-sm font-bold text-green-400 whitespace-nowrap">{item.val}</span>
            </div>
          ))}
          <div className="flex items-center justify-between px-5 py-4 bg-yellow-400/[0.06] border-t border-yellow-400/15">
            <span className="text-sm font-bold text-yellow-400">Conditions de l'offre</span>
            <span className="text-lg font-black text-yellow-400">Proposition sur devis</span>
          </div>
        </div>
      </section>

      {/* INTRO STATIQUE — texte indexable par Google */}
      <section className="max-w-3xl mx-auto px-4 pb-10 text-white/60 text-sm leading-relaxed">
        <p className="mb-4">
          KOST GROUP propose des formations DGR/CBTA dont le périmètre doit être confirmé à partir des tâches réellement exercées, des sources courantes applicables et du circuit de revue. Les modalités de session, de délivrance, de reconnaissance et d'évaluation sont à confirmer dans une proposition écrite.
        </p>
        <p className="mb-6">
          Chaque fonction CBTA 7.1 à 7.10 doit être examinée séparément à partir de sa propre table de tâches, des sources applicables et des activités réellement exercées. Le périmètre, les modalités intra-entreprise et le nombre minimal de participants sont confirmés dans une proposition écrite.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 not-italic">
          {[
            { label: "DGR 7.1 Initial", href: "/dgr-7-1", price: "Sur devis" },
            { label: "DGR 7.1 Recurrent", href: "/dgr-7-1-recurrent", price: "Sur devis" },
            { label: "DGR 7.2", href: "/dgr-7-2", price: "Sur devis" },
            { label: "DGR 7.3 Initial", href: "/dgr-7-3", price: "Sur devis" },
            { label: "DGR 7.3 Recurrent", href: "/dgr-7-3-recurrent", price: "Sur devis" },
            { label: "DGR 7.4", href: "/dgr-7-4", price: "Sur devis" },
            { label: "DGR 7.5", href: "/dgr-7-5", price: "Sur devis" },
            { label: "DGR 7.6", href: "/dgr-7-6", price: "Sur devis" },
            { label: "DGR 7.7", href: "/dgr-7-7", price: "Sur devis" },
            { label: "DGR 7.8", href: "/dgr-7-8", price: "Sur devis" },
            { label: "DGR 7.9", href: "/dgr-7-9", price: "Sur devis" },
            { label: "DGR 7.10", href: "/dgr-7-10", price: "Sur devis" },
          ].map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="flex items-center justify-between bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 rounded-xl px-3 py-2 transition-colors group"
            >
              <span className="text-xs font-bold text-white group-hover:text-yellow-400 transition-colors">{f.label}</span>
              <span className="text-xs text-white/40 font-medium">{f.price}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* PLANNING */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-black text-center mb-2">📅 Planning — dates à confirmer</h2>
        <p className="text-center text-white/40 text-sm mb-8">Contactez-nous pour confirmer les disponibilités et le périmètre du programme</p>

        <div className="flex flex-col gap-3">
          {MONTHS.map((month, i) => (
            <motion.div
              key={month.id}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={fadeUp}
            >
              <MonthBlock month={month} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* LEGEND */}
      <section className="max-w-5xl mx-auto px-4 mb-10">
        <div className="bg-white/[0.02] border border-white/[0.07] rounded-xl p-5">
          <p className="text-xs font-bold text-white/30 uppercase tracking-wider mb-3">Légende — Types de formations</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {[
              { color: "bg-blue-400", label: "DGR 7.1 — Préparation expéditions" },
              { color: "bg-red-400", label: "DGR 7.3 — Acceptation marchandises" },
              { color: "bg-green-400", label: "DGR 7.2 / 7.4 — Fret & Piste" },
              { color: "bg-purple-400", label: "DGR 7.5 / 7.6 — Passage & Équipage" },
              { color: "bg-orange-400", label: "DGR 7.7 / 7.8 / 7.9 — Cabine & Ops" },
              { color: "bg-teal-400", label: "DGR 7.10 — Fret aérien" },
              { color: "bg-yellow-400", label: "Recurrent — selon exigences applicables" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-2 text-xs text-white/50">
                <div className={`w-5 h-1 rounded-full ${l.color}`} />
                {l.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="max-w-3xl mx-auto px-4 pb-20">
        <div className="bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-yellow-400/20 rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-yellow-400/[0.05] rounded-full blur-3xl pointer-events-none" />
          <p className="text-xs font-bold text-yellow-400 uppercase tracking-widest mb-3">
            Demande intra-entreprise à étudier
          </p>
          <h2 className="text-2xl md:text-3xl font-black leading-tight mb-3">
            Vous souhaitez former vos équipes ?<br />
            <span className="text-white/50 text-xl font-semibold">Le périmètre doit être défini avant la session.</span>
          </h2>
          <p className="text-white/40 text-sm mb-6 leading-relaxed">
            Lieu, déplacements, taille du groupe, dates et facturation sont précisés dans l'offre écrite.
          </p>

          <div className="flex flex-wrap gap-3 justify-center mb-6">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER.replace("+", "")}?text=${encodeURIComponent("Bonjour, je souhaite des informations sur les formations DGR / CBTA et le cadrage des tâches")}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsApp("planning-bottom")}
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-black text-sm px-6 py-3 rounded-full transition-all duration-200 shadow-lg shadow-green-500/20 hover:shadow-green-400/30 hover:-translate-y-0.5"
            >
              <MessageCircle size={16} />
              Réserver via WhatsApp
            </a>
            <Link
              href="/#contact"
              className="inline-flex items-center gap-2 border border-white/15 hover:border-white/30 text-white font-semibold text-sm px-6 py-3 rounded-full transition-all duration-200 hover:bg-white/5"
            >
              Demander un devis
            </Link>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-wrap justify-center gap-3 text-xs text-white/30">
              {[
                "Moyens de paiement à confirmer dans la proposition",
                "Entité de facturation et documents à confirmer dans la proposition",
                "✅ Modalités de délivrance à confirmer",
              ].map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
