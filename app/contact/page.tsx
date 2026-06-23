import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";
import LeadForm from "@/components/LeadForm";
import { MapPin, Phone, Clock, MessageCircle } from "lucide-react";
import { WHATSAPP_LINK, PHONE_DISPLAY } from "@/lib/formations";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez KOST GROUP pour une formation IATA DGR à Alger. WhatsApp, formulaire, téléphone — réponse sous 24h.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contacter KOST GROUP — Formation IATA DGR",
    description:
      "Réponse sous 24h · WhatsApp +213 542 30 53 83 · Bab Ezzouar, Alger",
    url: "/contact",
  },
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dgr.kostacademy.com";

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Accueil", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "Contact", item: `${siteUrl}/contact` },
  ],
};

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <main className="bg-white">
        <section className="bg-gradient-to-br from-[#002A56] to-[#003D7A] text-white">
          <div className="container-x max-w-4xl py-14 md:py-18">
            <nav className="text-sm text-white/40 mb-6 flex items-center gap-2">
              <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
              <span>/</span>
              <span className="text-white/70">Contact</span>
            </nav>
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-3">
              Contactez-nous
            </h1>
            <p className="text-white/70 text-base max-w-xl">
              Réponse sous 24h · Devis gratuit · Sessions disponibles Juillet – Décembre 2026
            </p>
          </div>
        </section>

        <section className="container-x max-w-4xl py-12">
          <div className="grid md:grid-cols-2 gap-10">
            {/* COORDONNÉES */}
            <div>
              <h2 className="text-xl font-extrabold text-[#003D7A] mb-6">
                Nos coordonnées
              </h2>
              <ul className="space-y-5 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 mt-0.5 text-[#F39C12] flex-shrink-0" aria-hidden />
                  <div>
                    <p className="font-semibold text-[#0f1c2e]">Adresse</p>
                    <p className="text-gray-600">176 Cité Boushaki, Bab Ezzouar<br />Alger, Algérie — 16111</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="h-5 w-5 mt-0.5 text-[#F39C12] flex-shrink-0" aria-hidden />
                  <div>
                    <p className="font-semibold text-[#0f1c2e]">Téléphone / WhatsApp</p>
                    <a href="tel:+213542305383" className="text-[#003D7A] hover:underline">
                      {PHONE_DISPLAY}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="h-5 w-5 mt-0.5 text-[#F39C12] flex-shrink-0" aria-hidden />
                  <div>
                    <p className="font-semibold text-[#0f1c2e]">Horaires</p>
                    <p className="text-gray-600">Dimanche – Jeudi : 08h30 – 16h30</p>
                  </div>
                </li>
              </ul>

              <div className="mt-8">
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-black px-6 py-3 rounded-full transition-all duration-150 hover:scale-105 shadow-lg shadow-green-500/20 text-sm"
                >
                  <MessageCircle size={16} />
                  Écrire sur WhatsApp
                </a>
              </div>

              <div className="mt-8 p-4 bg-[#f7f9fc] rounded-xl border border-gray-100 text-sm text-gray-600">
                <p className="font-semibold text-[#003D7A] mb-1">Facturation</p>
                <p>
                  Paiements traités via <strong>STRATEGIX</strong> (entité française) — Facture EUR ou USD.
                  Entité algérienne disponible sur demande.
                </p>
              </div>
            </div>

            {/* FORMULAIRE */}
            <div>
              <h2 className="text-xl font-extrabold text-[#003D7A] mb-6">
                Demande de programme ou devis
              </h2>
              <Suspense fallback={null}>
                <LeadForm sourcePage="/contact" />
              </Suspense>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
