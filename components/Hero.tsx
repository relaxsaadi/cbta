"use client";

import Image from "next/image";
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
      <div className="container-x relative pt-16 pb-16 md:pt-20 md:pb-24">
        <div className="animate-fade-in-up flex flex-col items-start gap-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm font-medium">
            <BadgeCheck className="h-4 w-4 text-[#F39C12]" aria-hidden />
            <span>IATA CBTA Provider — Officiellement certifié</span>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight">
            Formation DGR-CBTA<br />
            <span className="text-[#F39C12]">Certifiée IATA</span>
            <span className="block text-2xl md:text-4xl lg:text-5xl mt-2 font-bold opacity-95">
              1er Centre CBTA Provider Certifié IATA en Algérie
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
              WhatsApp +213 542 30 53 83
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
        </div>

        {/* IATA CBTA Provider badge */}
        <div
          className="animate-fade-in-scale hidden lg:block absolute right-8 top-32 w-48 h-48 rounded-2xl bg-white/95 backdrop-blur-md p-3 shadow-2xl"
          aria-label="Badge IATA Competency Training & Assessment Center Provider"
        >
          <Image
            src="/iata-cbta-provider.png"
            alt="IATA Competency Training & Assessment Center Provider"
            width={192}
            height={192}
            priority
            className="h-full w-full object-contain"
          />
        </div>
      </div>
    </section>
  );
}
