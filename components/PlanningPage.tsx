"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, Clock, Users, ChevronDown, MessageCircle } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/lib/formations";

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
  urgent?: boolean;
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
    id: "juillet",
    name: "Juillet 2026",
    icon: "☀️",
    sessions: [
      {
        id: "71-juil",
        badge: "DGR 7.1 — Initial",
        badgeColor: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
        name: "Préparation des Expéditions de Marchandises Dangereuses",
        dates: "5 – 9 Juillet 2026",
        days: "Dim – Jeu",
        hours: "08h30 – 16h30",
        duration: "32h",
        price: "1 800 €",
        audience: "Transitaires · Exportateurs · Agents logistique",
        seatsLabel: "12 places max",
      },
      {
        id: "73-juil",
        badge: "DGR 7.3 — Initial",
        badgeColor: "bg-red-500/15 text-red-400 border border-red-500/20",
        name: "Acceptation des Expéditions de Marchandises Dangereuses",
        dates: "12 – 16 Juillet 2026",
        days: "Dim – Jeu",
        hours: "08h30 – 16h30",
        duration: "40h",
        price: "2 100 €",
        audience: "Compagnies aériennes · Handling · Acceptation cargo",
        seatsLabel: "12 places max",
      },
    ],
  },
  {
    id: "aout",
    name: "Août 2026 — Pause Estivale",
    icon: "🏖️",
    sessions: [],
    closed: true,
  },
  {
    id: "septembre",
    name: "Septembre 2026",
    icon: "🍂",
    sessions: [
      {
        id: "71-sep",
        badge: "DGR 7.1 — Initial",
        badgeColor: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
        name: "Préparation des Expéditions de Marchandises Dangereuses",
        dates: "6 – 10 Sep 2026",
        days: "Dim – Jeu",
        hours: "08h30 – 16h30",
        duration: "32h",
        price: "1 800 €",
        audience: "Transitaires · Exportateurs",
        seatsLabel: "12 places max",
      },
      {
        id: "73-sep",
        badge: "DGR 7.3 — Initial",
        badgeColor: "bg-red-500/15 text-red-400 border border-red-500/20",
        name: "Acceptation des Expéditions de Marchandises Dangereuses",
        dates: "13 – 17 Sep 2026",
        days: "Dim – Jeu",
        hours: "08h30 – 16h30",
        duration: "40h",
        price: "2 100 €",
        audience: "Compagnies aériennes · Acceptation",
        seatsLabel: "12 places max",
      },
      {
        id: "75-sep",
        badge: "DGR 7.5 + 7.6",
        badgeColor: "bg-purple-500/15 text-purple-400 border border-purple-500/20",
        name: "Personnel Passage / Contact Direct & Équipage",
        dates: "20 – 21 Sep 2026",
        days: "Dim – Lun",
        hours: "08h30 – 16h30",
        duration: "16h",
        price: "850 €",
        audience: "Embarquement · Pilotes · Co-pilotes",
        seatsLabel: "12 places max",
      },
      {
        id: "71rec-sep",
        badge: "DGR 7.1 — Recurrent",
        badgeColor: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20",
        name: "Renouvellement Certification DGR 7.1 (24 mois)",
        dates: "27 – 29 Sep 2026",
        days: "Dim – Mar",
        hours: "08h30 – 16h30",
        duration: "24h",
        price: "1 400 €",
        audience: "Certifiés DGR 7.1 à renouveler",
        seatsLabel: "Renouvellement",
      },
    ],
  },
  {
    id: "octobre",
    name: "Octobre 2026",
    icon: "🍁",
    sessions: [
      {
        id: "71-oct",
        badge: "DGR 7.1 — Initial",
        badgeColor: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
        name: "Préparation des Expéditions de Marchandises Dangereuses",
        dates: "4 – 8 Oct 2026",
        days: "Dim – Jeu",
        hours: "08h30 – 16h30",
        duration: "32h",
        price: "1 800 €",
        audience: "Transitaires · Exportateurs",
        seatsLabel: "12 places max",
      },
      {
        id: "72-oct",
        badge: "DGR 7.2 + 7.4",
        badgeColor: "bg-green-500/15 text-green-400 border border-green-500/20",
        name: "Traitement Fret Général & Personnel de Piste",
        dates: "11 – 12 Oct 2026",
        days: "Dim – Lun",
        hours: "08h30 – 16h30",
        duration: "16h",
        price: "900 €",
        audience: "Agents cargo · Ramp agents · Handlers",
        seatsLabel: "12 places max",
      },
      {
        id: "73-oct",
        badge: "DGR 7.3 — Initial",
        badgeColor: "bg-red-500/15 text-red-400 border border-red-500/20",
        name: "Acceptation des Expéditions de Marchandises Dangereuses",
        dates: "18 – 22 Oct 2026",
        days: "Dim – Jeu",
        hours: "08h30 – 16h30",
        duration: "40h",
        price: "2 100 €",
        audience: "Compagnies aériennes · Acceptation",
        seatsLabel: "12 places max",
      },
      {
        id: "73rec-oct",
        badge: "DGR 7.3 — Recurrent",
        badgeColor: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20",
        name: "Renouvellement Certification DGR 7.3 (24 mois)",
        dates: "25 – 27 Oct 2026",
        days: "Dim – Mar",
        hours: "08h30 – 16h30",
        duration: "18h",
        price: "1 500 €",
        audience: "Certifiés DGR 7.3 à renouveler",
        seatsLabel: "Renouvellement",
      },
    ],
  },
  {
    id: "novembre",
    name: "Novembre 2026",
    icon: "🌧️",
    sessions: [
      {
        id: "71-nov",
        badge: "DGR 7.1 — Initial",
        badgeColor: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
        name: "Préparation des Expéditions de Marchandises Dangereuses",
        dates: "1 – 5 Nov 2026",
        days: "Dim – Jeu",
        hours: "08h30 – 16h30",
        duration: "32h",
        price: "1 800 €",
        audience: "Transitaires · Exportateurs",
        seatsLabel: "12 places max",
      },
      {
        id: "77-nov",
        badge: "DGR 7.7 + 7.8 + 7.9",
        badgeColor: "bg-orange-500/15 text-orange-400 border border-orange-500/20",
        name: "Équipage Cabine · Dispatch & Opérations Sol · Sûreté",
        dates: "8 – 9 Nov 2026",
        days: "Dim – Lun",
        hours: "08h30 – 16h30",
        duration: "16h",
        price: "650 €",
        audience: "Hôtesses · Stewards · Dispatch · Sécurité",
        seatsLabel: "12 places max",
      },
      {
        id: "73-nov",
        badge: "DGR 7.3 — Initial",
        badgeColor: "bg-red-500/15 text-red-400 border border-red-500/20",
        name: "Acceptation des Expéditions de Marchandises Dangereuses",
        dates: "15 – 19 Nov 2026",
        days: "Dim – Jeu",
        hours: "08h30 – 16h30",
        duration: "40h",
        price: "2 100 €",
        audience: "Compagnies aériennes · Acceptation",
        seatsLabel: "12 places max",
      },
      {
        id: "710-nov",
        badge: "DGR 7.10 + 7.5",
        badgeColor: "bg-teal-500/15 text-teal-400 border border-teal-500/20",
        name: "Agents de Fret Aérien & Personnel Passage",
        dates: "22 – 23 Nov 2026",
        days: "Dim – Lun",
        hours: "08h30 – 16h30",
        duration: "16h",
        price: "650 €",
        audience: "Personnel fret · Aéroport",
        seatsLabel: "12 places max",
      },
      {
        id: "71rec-nov",
        badge: "DGR 7.1 — Recurrent",
        badgeColor: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20",
        name: "Renouvellement Certification DGR 7.1 (24 mois)",
        dates: "25 – 26 Nov 2026",
        days: "Mer – Jeu",
        hours: "08h30 – 16h30",
        duration: "24h",
        price: "1 400 €",
        audience: "Certifiés à renouveler",
        seatsLabel: "Renouvellement",
      },
    ],
  },
  {
    id: "decembre",
    name: "Décembre 2026",
    icon: "❄️",
    sessions: [
      {
        id: "71-dec",
        badge: "DGR 7.1 — Initial",
        badgeColor: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
        name: "Préparation des Expéditions de Marchandises Dangereuses",
        dates: "6 – 10 Déc 2026",
        days: "Dim – Jeu",
        hours: "08h30 – 16h30",
        duration: "32h",
        price: "1 800 €",
        audience: "Transitaires · Exportateurs",
        seatsLabel: "12 places max",
      },
      {
        id: "73-dec",
        badge: "DGR 7.3 — Initial",
        badgeColor: "bg-red-500/15 text-red-400 border border-red-500/20",
        name: "Acceptation des Expéditions de Marchandises Dangereuses",
        dates: "13 – 17 Déc 2026",
        days: "Dim – Jeu",
        hours: "08h30 – 16h30",
        duration: "40h",
        price: "2 100 €",
        audience: "Compagnies aériennes · Acceptation",
        seatsLabel: "12 places max",
      },
      {
        id: "72-dec",
        badge: "DGR 7.2 + 7.4 + 7.10",
        badgeColor: "bg-green-500/15 text-green-400 border border-green-500/20",
        name: "Fret Général · Piste · Agents de Fret Aérien",
        dates: "20 – 22 Déc 2026",
        days: "Dim – Mar",
        hours: "08h30 – 16h30",
        duration: "24h",
        price: "900 €",
        audience: "Cargo · Handlers · Personnel fret",
        seatsLabel: "12 places max",
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
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${session.badgeColor}`}>
          {session.badge}
        </span>
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
          <span>Présentiel Alger</span>
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
          Réserver
        </a>
      </div>
    </div>
  );
}

function MonthBlock({ month }: { month: Month }) {
  const [open, setOpen] = useState(!month.closed && month.id === "juillet");

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
  const totalSessions = MONTHS.reduce((acc, m) => acc + m.sessions.length, 0);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#002A56] via-[#003D7A] to-[#001a38] text-white">
      {/* HERO */}
      <section className="max-w-5xl mx-auto px-4 pt-10 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-wider">
          <Image
            src="/iata-cbta-provider.png"
            alt="IATA CBTA Provider"
            width={20}
            height={20}
            className="object-contain"
          />
          IATA CBTA Provider Certifié · Algérie
        </div>

        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-tight">
          Planning Sessions{" "}
          <span className="text-yellow-400">IATA DGR 2026</span>
        </h1>
        <p className="text-white/60 text-lg max-w-xl mx-auto mb-8 leading-relaxed">
          Présentiel · Formateurs certifiés IATA · Certificat valide 24 mois<br />
          Dimanche – Jeudi · 08h30 – 16h30
        </p>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto mb-8">
          {[
            { num: totalSessions, label: "Sessions restantes" },
            { num: "12", label: "Places / session" },
            { num: "10", label: "Fonctions DGR" },
            { num: "5", label: "Pays disponibles" },
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
          <span className="text-sm text-white/40 line-through">IATA Bruxelles : <span className="text-red-400">$3 950</span>/pers</span>
          <span className="text-green-400 text-lg">→</span>
          <span className="text-green-400 font-bold text-base">KOST GROUP : à partir de 650 €</span>
          <span className="bg-green-500 text-black text-xs font-black px-3 py-1 rounded-full uppercase">Économisez 5× à 8×</span>
        </div>
      </section>

      {/* VALUE INCLUDED */}
      <section className="max-w-3xl mx-auto px-4 mb-10">
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
          <div className="bg-yellow-400/[0.08] border-b border-yellow-400/15 px-5 py-3 text-xs font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-2">
            <Image src="/iata-cbta-provider.png" alt="IATA CBTA Provider Certifié — KOST GROUP Algérie" width={20} height={20} className="object-contain" />
            Ce que vous obtenez avec chaque formation
          </div>
          {[
            { icon: "📘", label: "Manuel DGR officiel IATA (support de formation)", val: "Valeur : 180 €" },
            { icon: "🏆", label: "Certification IATA CBTA valide 24 mois", val: "Valeur : $2 250+" },
            { icon: "👨‍🏫", label: "Formateur international certifié IATA", val: "Inclus" },
            { icon: "🍽️", label: "Hébergement & restauration (si déplacement)", val: "Inclus" },
            { icon: "📄", label: "Facture officielle France (Strategix) ou Algérie", val: "Inclus" },
            { icon: "🔄", label: "Accès renouvellement (Recurrent) prioritaire", val: "Inclus" },
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
            <span className="text-sm font-bold text-yellow-400">Valeur totale de l'offre</span>
            <span className="text-lg font-black text-yellow-400">$2 800+ · Votre prix : dès 650 €</span>
          </div>
        </div>
      </section>

      {/* PLANNING */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-black text-center mb-2">📅 Planning Juillet – Décembre 2026</h2>
        <p className="text-center text-white/40 text-sm mb-8">Cliquez sur un mois pour voir les sessions disponibles</p>

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
              { color: "bg-yellow-400", label: "Recurrent — Renouvellement 24 mois" },
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
            Formation intra-entreprise disponible
          </p>
          <h2 className="text-2xl md:text-3xl font-black leading-tight mb-3">
            Votre équipe n'est pas encore certifiée ?<br />
            <span className="text-white/50 text-xl font-semibold">Chaque jour sans certification = risque réglementaire.</span>
          </h2>
          <p className="text-white/40 text-sm mb-6 leading-relaxed">
            Déplacement inclus (Maroc, Tunisie, Sénégal, Côte d'Ivoire) · Groupe 6–12 participants ·
            Facture France (Strategix) ou Algérie
          </p>

          <div className="flex flex-wrap gap-3 justify-center mb-6">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER.replace("+", "")}?text=${encodeURIComponent("Bonjour, je souhaite des informations sur les formations IATA DGR CBTA 2026")}`}
              target="_blank"
              rel="noopener noreferrer"
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
            <Image src="/iata-cbta-provider.png" alt="IATA CBTA Provider" width={40} height={40} className="object-contain opacity-80" />
            <div className="flex flex-wrap justify-center gap-3 text-xs text-white/30">
              {[
                "✅ Paiement sécurisé via Strategix France",
                "✅ Facture officielle",
                "✅ Certificat IATA garanti",
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
