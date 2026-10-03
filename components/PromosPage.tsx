"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Building2, CalendarClock, FileCheck2, MessageCircle } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/lib/formations";
import { trackWhatsApp } from "@/lib/tracking";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

function waLink(subject: string) {
  const text = encodeURIComponent(
    `Bonjour, je souhaite recevoir les conditions écrites pour ${subject}. Merci de me contacter.`,
  );
  return `https://wa.me/${WHATSAPP_NUMBER.replace("+", "")}?text=${text}`;
}

const OPTIONS = [
  {
    icon: CalendarClock,
    title: "Réservation anticipée",
    description:
      "Demandez si une condition commerciale est disponible pour la session et la fonction CBTA concernées. Aucune remise n'est garantie avant confirmation écrite.",
  },
  {
    icon: Building2,
    title: "Groupe / entreprise",
    description:
      "Pour plusieurs participants, KOST peut établir une proposition adaptée au besoin, au lieu, aux dates et au périmètre de formation réellement demandé.",
  },
  {
    icon: FileCheck2,
    title: "Renouvellement / besoin existant",
    description:
      "Un ancien certificat ou une formation antérieure ne suffit pas à déterminer automatiquement la fonction, la durée ou les conditions du prochain parcours. Le besoin est revu avant devis.",
  },
];

export default function PromosPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#002A56] via-[#003D7A] to-[#001a38] text-white">
      <section className="max-w-4xl mx-auto px-4 pt-12 pb-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 text-yellow-300 text-xs font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-wider"
        >
          Conditions commerciales sur devis
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.06 }}
          className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-tight"
        >
          Offres pour les formations DGR / CBTA
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12 }}
          className="text-white/65 text-lg max-w-2xl mx-auto leading-relaxed"
        >
          Les prix, remises, dates, durées, modalités d&apos;évaluation et documents délivrés sont confirmés par écrit pour l&apos;offre concernée. Cette page ne constitue ni un tarif contractuel ni une affirmation réglementaire.
        </motion.p>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {OPTIONS.map((option, i) => (
            <motion.div
              key={option.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeUp}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
            >
              <option.icon className="h-6 w-6 text-yellow-300 mb-4" aria-hidden />
              <h2 className="text-lg font-black mb-2">{option.title}</h2>
              <p className="text-sm text-white/60 leading-relaxed">{option.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-16">
        <div className="rounded-2xl border border-blue-300/20 bg-blue-300/[0.06] p-6 md:p-8">
          <h2 className="text-xl font-black mb-3">Avant toute réservation</h2>
          <p className="text-sm text-white/65 leading-relaxed mb-4">
            La fonction 7.1–7.10 doit être déterminée à partir des tâches réellement exercées et du jeu de sources applicable. Un intitulé de poste ou un secteur d&apos;activité ne suffit pas, à lui seul, pour attribuer une fonction CBTA.
          </p>
          <p className="text-sm text-white/65 leading-relaxed">
            Pour toute affirmation réglementaire, KOST applique une vérification de source et conserve explicitement les états de manque ou de conflit de source jusqu&apos;à revue. Les conditions commerciales sont séparées de cette validation réglementaire.
          </p>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-4 pb-20 text-center">
        <p className="text-2xl font-black mb-2">Recevoir une proposition écrite</p>
        <p className="text-white/45 text-sm mb-6">
          Indiquez vos tâches, le nombre de participants, le lieu et la période souhaitée.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href={waLink("une proposition de formation DGR / CBTA")}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsApp("offers-bottom")}
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-black px-6 py-3 rounded-full transition-all duration-150 hover:scale-105 shadow-lg shadow-green-500/20"
          >
            <MessageCircle size={16} />
            Demander un devis
          </a>
          <Link
            href="/planning"
            className="inline-flex items-center gap-2 border border-white/15 hover:border-white/30 text-white font-semibold px-6 py-3 rounded-full transition-all hover:bg-white/5"
          >
            Voir le planning
          </Link>
        </div>
      </section>
    </main>
  );
}
