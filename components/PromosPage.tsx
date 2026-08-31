"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Tag, Users, Clock, Zap, CheckCircle, MessageCircle, Timer } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/lib/formations";
import { trackWhatsApp } from "@/lib/tracking";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] },
  }),
};

function waLink(subject: string) {
  const text = encodeURIComponent(`Bonjour, je souhaite profiter de l'offre "${subject}". Merci de me contacter.`);
  return `https://wa.me/${WHATSAPP_NUMBER.replace("+", "")}?text=${text}`;
}

const PROMOS = [
  {
    id: "early-bird",
    badge: "⏰ Early Bird",
    badgeClass: "bg-yellow-400/15 text-yellow-400 border border-yellow-400/25",
    tag: "−10% · Places limitées",
    tagClass: "bg-yellow-400 text-black",
    title: "Réservation 30 jours à l'avance",
    description:
      "Inscrivez-vous au moins 30 jours avant le début de la session et bénéficiez d'une remise immédiate de 10% sur tout tarif initial ou recurrent.",
    example: "DGR 7.1 Initial : 1 800 € → 1 620 €",
    includes: [
      "Applicable sur toutes les sessions Juillet–Décembre 2026",
      "Non cumulable avec d'autres offres",
      "Confirmation écrite requise via WhatsApp",
      "Paiement à l'avance (virement ou chèque)",
    ],
    cta: "Réserver avec Early Bird",
    waSubject: "Early Bird −10%",
    highlight: false,
  },
  {
    id: "pack-duo",
    badge: "👥 Pack Duo",
    badgeClass: "bg-blue-400/15 text-blue-400 border border-blue-400/25",
    tag: "−12% · 2 formations",
    tagClass: "bg-blue-500 text-white",
    title: "2 formations en même temps",
    description:
      "Inscrivez 2 participants sur la même session (ou 1 participant sur 2 sessions différentes) et obtenez 12% de réduction sur le total.",
    example: "7.1 + 7.3 : 3 900 € → 3 432 €  (économie 468 €)",
    includes: [
      "Même entreprise ou particulier",
      "Sessions Juillet–Décembre 2026",
      "Facture unique disponible (Strategix France ou Algérie)",
      "Cumulable avec l'Early Bird → jusqu'à 22% de remise",
    ],
    cta: "Demander le Pack Duo",
    waSubject: "Pack Duo −12%",
    highlight: true,
  },
  {
    id: "groupe",
    badge: "🏢 Groupe Entreprise",
    badgeClass: "bg-green-400/15 text-green-400 border border-green-400/25",
    tag: "−15% à −25%",
    tagClass: "bg-green-500 text-black",
    title: "Formation intra-entreprise (4+ participants)",
    description:
      "Formez votre équipe en interne : nous nous déplaçons dans vos locaux (Alger, Oran, Constantine, Annaba) ou à l'international. Tarif dégressif selon le groupe.",
    example: "6 participants DGR 7.1 : 10 800 € → 8 100 € (−25%)",
    includes: [
      "Déplacement formateur inclus en Algérie",
      "Hors Algérie : Maroc, Tunisie, Sénégal, Côte d'Ivoire",
      "Planning sur mesure selon vos contraintes",
      "Convention de formation fournie pour prise en charge OPCA/CPFE",
      "Remise selon volume : 4–5 = −15% · 6–8 = −20% · 9+ = −25%",
    ],
    cta: "Demander un devis groupe",
    waSubject: "Groupe Entreprise intra",
    highlight: false,
  },
  {
    id: "recurrent",
    badge: "🔄 Renouvellement fidélité",
    badgeClass: "bg-purple-400/15 text-purple-400 border border-purple-400/25",
    tag: "−8% · Anciens certifiés",
    tagClass: "bg-purple-500 text-white",
    title: "Vous avez déjà été certifié chez KOST",
    description:
      "Votre certificat IATA expire dans moins de 6 mois ? En tant qu'ancien stagiaire KOST GROUP, vous bénéficiez d'une remise fidélité de 8% sur votre renouvellement.",
    example: "Recurrent DGR 7.1 : 1 400 € → 1 288 €",
    includes: [
      "Sur présentation de votre ancien certificat KOST",
      "Applicable aux formations Recurrent uniquement",
      "Accès prioritaire aux sessions (liste d'attente fermée en dernier)",
      "Rappel WhatsApp automatique avant expiration",
    ],
    cta: "Renouveler avec la remise fidélité",
    waSubject: "Renouvellement fidélité −8%",
    highlight: false,
  },
];

export default function PromosPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#002A56] via-[#003D7A] to-[#001a38] text-white">
      {/* HERO */}
      <section className="max-w-4xl mx-auto px-4 pt-10 pb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-wider"
        >
          <Timer size={14} />
          Offres valables Juillet – Décembre 2026
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.07 }}
          className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-tight"
        >
          Économisez sur votre{" "}
          <span className="text-yellow-400">Certification IATA DGR</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.14 }}
          className="text-white/60 text-lg max-w-xl mx-auto mb-10 leading-relaxed"
        >
          4 offres cumulables · Early Bird · Pack Duo · Groupe · Fidélité<br />
          Jusqu'à <strong className="text-yellow-400">−25%</strong> sur votre formation
        </motion.p>

        {/* QUICK CHIPS */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 mb-4"
        >
          {[
            "⏰ Early Bird −10%",
            "👥 Pack Duo −12%",
            "🏢 Groupe −25%",
            "🔄 Fidélité −8%",
          ].map((chip) => (
            <span key={chip} className="bg-white/[0.07] border border-white/10 text-white/60 text-xs font-semibold px-3 py-1.5 rounded-full">
              {chip}
            </span>
          ))}
        </motion.div>
      </section>

      {/* PROMO CARDS */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {PROMOS.map((p, i) => (
            <motion.div
              key={p.id}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeUp}
              className={`relative flex flex-col rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
                p.highlight
                  ? "border-blue-400/30 bg-gradient-to-b from-blue-500/[0.08] to-white/[0.02] shadow-xl shadow-blue-500/10"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              {p.highlight && (
                <div className="absolute top-3 right-3 bg-blue-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Populaire
                </div>
              )}

              <div className="p-5 flex flex-col gap-3 flex-1">
                {/* HEADER */}
                <div className="flex items-start gap-2 flex-wrap">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${p.badgeClass}`}>
                    {p.badge}
                  </span>
                  <span className={`text-xs font-black px-3 py-1 rounded-full ${p.tagClass}`}>
                    {p.tag}
                  </span>
                </div>

                <h2 className="text-base font-black text-white leading-snug">{p.title}</h2>
                <p className="text-sm text-white/55 leading-relaxed">{p.description}</p>

                {/* EXAMPLE */}
                <div className="bg-black/20 border border-white/[0.07] rounded-lg px-4 py-2.5 text-xs font-mono text-green-400">
                  {p.example}
                </div>

                {/* INCLUDES */}
                <ul className="flex flex-col gap-1.5">
                  {p.includes.map((inc) => (
                    <li key={inc} className="flex items-start gap-2 text-xs text-white/50">
                      <CheckCircle size={12} className="shrink-0 mt-0.5 text-green-400/70" />
                      {inc}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="px-5 pb-5">
                <a
                  href={waLink(p.waSubject)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsApp(`promo-${p.id}`)}
                  className={`w-full flex items-center justify-center gap-2 font-black text-sm py-3 rounded-xl transition-all duration-150 hover:scale-[1.02] ${
                    p.highlight
                      ? "bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/20"
                      : "bg-green-500 hover:bg-green-400 text-black shadow-lg shadow-green-500/15"
                  }`}
                >
                  <MessageCircle size={15} />
                  {p.cta}
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* COMPARATIF PRIX VS CONCURRENTS */}
      <section className="max-w-3xl mx-auto px-4 mb-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
        >
          <h2 className="text-xl font-black text-center mb-2">
            Combien coûte la même formation ailleurs ?
          </h2>
          <p className="text-white/40 text-sm text-center mb-6">
            Le certificat IATA est identique — le prix, non.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-white/40 font-semibold text-xs uppercase tracking-wider">Formation</th>
                  <th className="py-3 px-3 text-white/40 font-semibold text-xs uppercase tracking-wider text-center">IATA Bruxelles</th>
                  <th className="py-3 px-3 text-white/40 font-semibold text-xs uppercase tracking-wider text-center">AFTRAL (France)</th>
                  <th className="py-3 px-3 bg-yellow-400/[0.07] rounded-t-xl text-yellow-400 font-black text-xs uppercase tracking-wider text-center">KOST GROUP</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "DGR 7.1 Initial", brussels: "$3 950", aftral: "~€2 800", kost: "1 800 €", saving: "−36%" },
                  { name: "DGR 7.3 Initial", brussels: "$4 500", aftral: "~€3 100", kost: "2 100 €", saving: "−32%" },
                  { name: "DGR 7.2", brussels: "$2 200", aftral: "~€1 600", kost: "900 €", saving: "−44%" },
                  { name: "DGR 7.5", brussels: "$1 800", aftral: "~€1 200", kost: "850 €", saving: "−29%" },
                  { name: "DGR 7.7/7.9", brussels: "$1 400", aftral: "~€950", kost: "650 €", saving: "−32%" },
                ].map((row, i) => (
                  <tr key={row.name} className={`border-b border-white/[0.06] ${i % 2 === 0 ? "" : "bg-white/[0.02]"}`}>
                    <td className="py-3 px-4 font-semibold text-white">{row.name}</td>
                    <td className="py-3 px-3 text-center text-red-400/80 font-mono">{row.brussels}</td>
                    <td className="py-3 px-3 text-center text-orange-400/70 font-mono">{row.aftral}</td>
                    <td className="py-3 px-3 bg-yellow-400/[0.05] text-center">
                      <span className="font-black text-green-400 font-mono">{row.kost}</span>
                      <span className="ml-2 text-xs text-green-500 font-bold">{row.saving}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} className="pt-3 px-4 text-xs text-white/25 italic">
                    Tarifs IATA Bruxelles au catalogue 2026 · AFTRAL estimés (session inter) · Tous incluent l'évaluation CBTA
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </motion.div>
      </section>

      {/* CUMUL SECTION */}
      <section className="max-w-3xl mx-auto px-4 mb-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="bg-yellow-400/[0.06] border border-yellow-400/20 rounded-2xl p-6 md:p-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap size={18} className="text-yellow-400" />
            <h2 className="text-lg font-black text-yellow-400">Offres cumulables — exemple réel</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            {[
              { label: "Tarif affiché", val: "1 800 €", sub: "DGR 7.1 Initial" },
              { label: "Early Bird −10%", val: "−180 €", sub: "Inscription 30j avant" },
              { label: "Pack Duo −12%", val: "−216 €", sub: "2e inscription identique" },
            ].map((row) => (
              <div key={row.label} className="bg-black/20 rounded-xl p-3 text-center">
                <p className="text-xs text-white/40 mb-1">{row.label}</p>
                <p className="text-lg font-black text-white">{row.val}</p>
                <p className="text-xs text-white/30">{row.sub}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-xl px-5 py-3">
            <span className="text-sm font-semibold text-white/60">Votre prix final (2 personnes)</span>
            <div className="text-right">
              <span className="text-2xl font-black text-green-400">3 208 €</span>
              <span className="block text-xs text-white/30">au lieu de 3 600 € · économie 392 €</span>
            </div>
          </div>
          <p className="text-xs text-white/30 mt-3 text-center">
            * Remises vérifiées à la réservation · Non applicables aux tarifs déjà négociés
          </p>
        </motion.div>
      </section>

      {/* BOTTOM CTA */}
      <section className="max-w-2xl mx-auto px-4 pb-20 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
        >
          <p className="text-2xl font-black mb-2">Une question sur les offres ?</p>
          <p className="text-white/40 text-sm mb-6">
            Répondez en 5 minutes · Devis personnalisé · Facture Strategix France ou Algérie
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={waLink("Offres et remises 2026")}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsApp("promos-bottom")}
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-black px-6 py-3 rounded-full transition-all duration-150 hover:scale-105 shadow-lg shadow-green-500/20"
            >
              <MessageCircle size={16} />
              Obtenir mon devis
            </a>
            <Link
              href="/planning"
              className="inline-flex items-center gap-2 border border-white/15 hover:border-white/30 text-white font-semibold px-6 py-3 rounded-full transition-all hover:bg-white/5"
            >
              Voir le planning 2026
            </Link>
          </div>
          <div className="mt-6 flex justify-center">
            <Image src="/iata-cbta-provider.png" alt="Formation IATA DGR" width={40} height={40} className="object-contain opacity-60" />
          </div>
        </motion.div>
      </section>
    </main>
  );
}
