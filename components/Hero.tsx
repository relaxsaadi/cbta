"use client";

import { motion } from "framer-motion";
import { ShieldCheck, MessageCircle, ArrowDown, BadgeCheck } from "lucide-react";
import { WHATSAPP_LINK } from "@/lib/formations";
import { trackWhatsApp } from "@/lib/tracking";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#003D7A] via-[#0a4a8a] to-[#002A56] text-white">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]"
      />
      <div className="container-x relative pt-24 pb-16 md:pt-32 md:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-start gap-6 max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm font-medium">
            <BadgeCheck className="h-4 w-4 text-[#F39C12]" aria-hidden />
            <span>IATA CBTA Provider — Officiellement certifié</span>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight">
            Formation DGR-CBTA<br />
            <span className="text-[#F39C12]">Certifiée IATA</span>
            <span className="block text-2xl md:text-4xl lg:text-5xl mt-2 font-bold opacity-95">
              1er Centre CBTA Provider en Afrique francophone
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/85 leading-relaxed max-w-2xl">
            Certificat IATA officiel reconnu par <strong className="text-white">300+ compagnies aériennes</strong> · Valide <strong className="text-white">24 mois</strong> · Formateurs internationaux certifiés.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto pt-2">
            <a
              href="#formulaire"
              className="btn-primary"
              aria-label="Recevoir le programme de formation"
            >
              <ArrowDown className="h-5 w-5" aria-hidden />
              Recevoir le programme
            </a>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsApp("hero")}
              className="btn-whatsapp"
              aria-label="Contacter sur WhatsApp"
            >
              <MessageCircle className="h-5 w-5" aria-hidden />
              WhatsApp +213 770 77 26 19
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 text-sm text-white/80">
            <div className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#F39C12]" aria-hidden />
              <span>1er certifié IATA en Algérie</span>
            </div>
            <div className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#F39C12]" aria-hidden />
              <span>Paiement EUR / USD</span>
            </div>
            <div className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#F39C12]" aria-hidden />
              <span>Facture officielle France</span>
            </div>
          </div>
        </motion.div>

        {/* IATA badge placeholder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="hidden lg:block absolute right-8 top-32 w-44 h-44 rounded-2xl bg-white/10 backdrop-blur-md border-2 border-white/20 flex items-center justify-center text-center p-4"
          aria-label="Badge IATA Provider"
        >
          <div className="flex flex-col items-center justify-center h-full">
            <BadgeCheck className="h-12 w-12 text-[#F39C12] mb-2" aria-hidden />
            <div className="text-xs uppercase tracking-wider text-white/70">Certifié</div>
            <div className="text-lg font-bold">IATA CBTA</div>
            <div className="text-xs text-white/70 mt-1">Provider</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
