"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Clock, Linkedin, BadgeCheck } from "lucide-react";
import { PHONE_DISPLAY } from "@/lib/formations";
import { trackPhoneClick } from "@/lib/tracking";

export default function Footer() {
  return (
    <footer className="bg-[#0f1c2e] text-gray-300">
      <div className="container-x py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="mb-4 inline-block rounded-lg bg-white px-4 py-3">
              <Image
                src="/kost-group-logo.svg"
                alt="KOST GROUP"
                width={180}
                height={101}
                className="h-12 w-auto"
              />
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              1<sup>er</sup> CBTA Provider IATA en Algérie. Formations DGR officielles pour l'aviation et le fret aérien.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-xs text-gray-400">
              <BadgeCheck className="h-4 w-4 text-[#F39C12]" aria-hidden />
              <span>
                Vérifiable sur{" "}
                <a
                  href="https://www.iata.org/en/training/cbta-center-registry/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-white"
                >
                  iata.org/cbta-center-registry
                </a>
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-[#F39C12]" aria-hidden />
                <span>176 Cité Boushaki, Bab Ezzouar, Alger, Algérie</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 shrink-0 text-[#F39C12]" aria-hidden />
                <a
                  href="tel:+213542305383"
                  onClick={trackPhoneClick}
                  className="hover:text-white"
                >
                  {PHONE_DISPLAY}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 shrink-0 text-[#F39C12]" aria-hidden />
                <span>Dimanche – Jeudi : 8h30 – 16h30</span>
              </li>
              <li className="flex items-start gap-2">
                <Linkedin className="h-4 w-4 mt-0.5 shrink-0 text-[#F39C12]" aria-hidden />
                <span>LinkedIn : KOST GROUP CBTA Algérie</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">Liens</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white">Accueil</Link></li>
              <li><Link href="/#formations" className="hover:text-white">Formations</Link></li>
              <li><Link href="/#formulaire" className="hover:text-white">Demande de programme</Link></li>
              <li><Link href="/mentions-legales" className="hover:text-white">Mentions légales</Link></li>
              <li><Link href="/confidentialite" className="hover:text-white">Politique de confidentialité</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs text-gray-500">
          <div>© {new Date().getFullYear()} KOST GROUP — Tous droits réservés</div>
          <div>Paiements traités via STRATEGIX (entité française) — Facturation EUR/USD</div>
        </div>
      </div>
    </footer>
  );
}
