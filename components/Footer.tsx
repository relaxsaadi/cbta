"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Mail, MessageCircle, Clock } from "lucide-react";
import {
  ADDRESS_LINE_EN,
  ADDRESS_LINE_FR,
  BILLING_DZ_EN,
  BILLING_DZ_FR,
  CONTACT_EMAIL,
  MENTION_EN,
  MENTION_FR,
  ONLY_ANAC_EN,
  ONLY_ANAC_FR,
  ONLY_IATA_EN,
  ONLY_IATA_FR,
  PROOF,
  WHATSAPP_DISPLAY,
  whatsAppHref,
} from "@/lib/kost-facts";
import { GROUP_LABELS, getSitePage, pagesInGroup, type PageGroup } from "@/lib/site-pages";
import { trackWhatsApp } from "@/lib/tracking";

const LINK_GROUPS: PageGroup[] = [
  "algerie-villes",
  "algerie-themes",
  "fonctions",
  "international",
  "english",
];

export default function Footer() {
  const pathname = usePathname() || "/";
  const page = getSitePage(pathname);
  const en = page?.lang === "en";
  const intl = page?.region === "intl";

  return (
    <footer className="bg-[#0f1c2e] text-gray-300">
      <div className="container-x py-14">
        <div className="grid gap-10 md:grid-cols-3">
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
            <p className="text-sm text-gray-300 leading-relaxed">
              KOST Academy — {en ? MENTION_EN : MENTION_FR}.
            </p>
          </div>

          <div>
            <h2 className="text-white font-semibold mb-3">{en ? "Our approvals" : "Nos agréments"}</h2>
            <ul className="space-y-3 text-sm">
              <li>
                {en ? "KOST Academy is " : "KOST Academy est le "}
                {en ? ONLY_IATA_EN : ONLY_IATA_FR}
                {" — "}
                <a href={PROOF.iata} target="_blank" rel="noopener" className="underline hover:text-white">
                  {en ? "IATA registry entry" : "fiche au registre IATA"}
                </a>
              </li>
              <li>
                {en ? "KOST Academy is " : "KOST Academy est le "}
                {en ? ONLY_ANAC_EN : ONLY_ANAC_FR}
                {" — "}
                <a href={en ? PROOF.anacEn : PROOF.anacFr} target="_blank" rel="noopener" className="underline hover:text-white">
                  {en ? "ANAC list of training schools" : "liste ANAC des écoles de formation"}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-white font-semibold mb-3">Contact</h2>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-[#F39C12]" aria-hidden />
                <span>{en ? ADDRESS_LINE_EN : ADDRESS_LINE_FR}</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 shrink-0 text-[#F39C12]" aria-hidden />
                <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-white">
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MessageCircle className="h-4 w-4 mt-0.5 shrink-0 text-[#F39C12]" aria-hidden />
                <a
                  href={whatsAppHref(en ? "Hello, I would like information about DGR training." : "Bonjour, je souhaite des informations sur la formation DGR.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsApp("footer")}
                  className="hover:text-white"
                >
                  WhatsApp {WHATSAPP_DISPLAY}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 shrink-0 text-[#F39C12]" aria-hidden />
                <span>{en ? "Sunday – Thursday: 8:30 – 16:30" : "Dimanche – Jeudi : 8h30 – 16h30"}</span>
              </li>
              <li>
                <Link href="/contact" className="underline hover:text-white">
                  {en ? "Contact form" : "Formulaire de contact"}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <nav
          aria-label={en ? "All training pages" : "Toutes les formations"}
          className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5 border-t border-white/10 pt-10"
        >
          {LINK_GROUPS.map((group) => (
            <div key={group}>
              <h2 className="text-white font-semibold mb-3 text-sm">
                {en ? GROUP_LABELS[group].en : GROUP_LABELS[group].fr}
              </h2>
              <ul className="space-y-1.5 text-sm">
                {pagesInGroup(group).map((item) => (
                  <li key={item.path}>
                    <Link
                      href={item.path || "/"}
                      hrefLang={item.lang}
                      className="hover:text-white"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="mt-10 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <Link href="/" className="hover:text-white">{en ? "Home" : "Accueil"}</Link>
          <Link href="/planning" className="hover:text-white">Planning</Link>
          <Link href="/promos" className="hover:text-white">{en ? "Offers" : "Offres"}</Link>
          <Link href="/a-propos" className="hover:text-white">{en ? "About" : "À propos"}</Link>
          <Link href="/contact" className="hover:text-white">Contact</Link>
          <Link href="/mentions-legales" className="hover:text-white">{en ? "Legal notice" : "Mentions légales"}</Link>
          <Link href="/confidentialite" className="hover:text-white">{en ? "Privacy" : "Confidentialité"}</Link>
        </div>

        <div className="mt-6 pt-6 border-t border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs text-gray-400">
          <div>© {new Date().getFullYear()} EURL KOST GROUPE — {en ? "All rights reserved" : "Tous droits réservés"}</div>
          <div>
            {intl
              ? en
                ? "Payments processed via STRATEGIX (French entity) — EUR/USD invoicing"
                : "Paiements traités via STRATEGIX (entité française) — Facturation EUR/USD"
              : en
                ? BILLING_DZ_EN
                : BILLING_DZ_FR}
          </div>
        </div>
      </div>
    </footer>
  );
}
