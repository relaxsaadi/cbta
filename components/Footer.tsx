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
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="mb-4 inline-block rounded-lg bg-white p-2">
              <Image
                src="/kost-group-icon.png"
                alt="KOST Academy"
                width={48}
                height={48}
                className="h-12 w-12"
              />
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Formation IATA DGR en Algérie, méthode CBTA, pour l'aviation et le fret aérien.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-xs text-gray-400">
              <BadgeCheck className="h-4 w-4 text-[#F39C12]" aria-hidden />
              <span>
                En savoir plus sur{" "}
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
                <span>176 Cité Boushaki, Bab Ezzouar, Alger, Algérie — 16024</span>
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
            <h3 className="text-white font-semibold mb-3">Formations par pays</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/formation-dgr-algerie" className="hover:text-white">Formation DGR Algérie</Link></li>
              <li><Link href="/formation-dgr-maroc" className="hover:text-white">Formation DGR Maroc</Link></li>
              <li><Link href="/formation-dgr-senegal" className="hover:text-white">Formation DGR Sénégal</Link></li>
              <li><Link href="/formation-dgr-cote-ivoire" className="hover:text-white">Formation DGR Côte d'Ivoire</Link></li>
              <li><Link href="/formation-dgr-cameroun" className="hover:text-white">Formation DGR Cameroun</Link></li>
              <li><Link href="/formation-dgr-afrique" className="hover:text-white">Formation DGR Afrique (Tunisie, Mali, Burkina Faso, Gabon...)</Link></li>
              <li><Link href="/formation-dgr-petrole-gaz" className="hover:text-white">Formation DGR Pétrole & Gaz</Link></li>
              <li><Link href="/formation-dgr-transitaires" className="hover:text-white">Formation DGR Transitaires</Link></li>
              <li><Link href="/iata-dangerous-goods-training-algeria" className="hover:text-white">IATA DGR Training Algeria</Link></li>
              <li><Link href="/entreprises" className="hover:text-white">Solutions Entreprises</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">Liens utiles</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white">Accueil</Link></li>
              <li><Link href="/#formations" className="hover:text-white">Catalogue formations</Link></li>
              <li><Link href="/planning" className="hover:text-white">Planning 2026</Link></li>
              <li><Link href="/promos" className="hover:text-white">Offres & Réductions</Link></li>
              <li><Link href="/reglementation-dgr-algerie" className="hover:text-white">Réglementation DGR Algérie</Link></li>
              <li><Link href="/a-propos" className="hover:text-white">À propos</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
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
