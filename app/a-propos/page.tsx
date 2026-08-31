import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import { Award, MapPin, CheckCircle, Globe, BadgeCheck, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "À propos de KOST GROUP",
  description:
    "Centre de formation DGR basé en Algérie, méthode CBTA. Fondé pour rendre la formation DGR accessible en Afrique francophone à prix juste.",
  alternates: { canonical: "/a-propos" },
  openGraph: {
    title: "À propos de KOST GROUP",
    description:
      "Centre de formation DGR basé en Algérie, méthode CBTA, pour l'Afrique francophone.",
    url: "/a-propos",
  },
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dgr.kostacademy.com";

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "KOST GROUP",
  url: siteUrl,
  logo: `${siteUrl}/kost-group-logo.svg`,
  image: `${siteUrl}/og-image.jpg`,
  description:
    "Centre de formation DGR (Marchandises Dangereuses) basé en Algérie, méthode CBTA, pour l'aviation et le fret aérien en Afrique francophone.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "176 Cité Boushaki",
    addressLocality: "Bab Ezzouar",
    addressRegion: "Alger",
    postalCode: "16024",
    addressCountry: "DZ",
  },
  telephone: "+213542305383",
  email: "kostgroupe@gmail.com",
  geo: {
    "@type": "GeoCoordinates",
    latitude: 36.71942,
    longitude: 3.18274,
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
    opens: "08:30",
    closes: "16:30",
  },
  employee: {
    "@type": "Person",
    name: "Formateur Principal IATA DGR",
    jobTitle: "Formateur DGR — méthode CBTA",
    worksFor: { "@type": "Organization", name: "KOST GROUP" },
    knowsAbout: [
      "IATA DGR Dangerous Goods Regulations",
      "CBTA Competency-Based Training & Assessment",
      "Fret aérien international",
      "Sécurité aéronautique",
    ],
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Accueil",
      item: siteUrl,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "À propos",
      item: `${siteUrl}/a-propos`,
    },
  ],
};

export default function AProposPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <main className="bg-white">
        {/* HERO */}
        <section className="bg-gradient-to-br from-[#002A56] to-[#003D7A] text-white">
          <div className="container-x max-w-4xl py-16 md:py-20">
            <nav className="text-sm text-white/40 mb-6 flex items-center gap-2">
              <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
              <span>/</span>
              <span className="text-white/70">À propos</span>
            </nav>
            <div className="inline-flex items-center gap-2 bg-[#F39C12]/20 border border-[#F39C12]/40 px-4 py-1.5 rounded-full text-sm font-bold text-[#F39C12] mb-5">
              <Award className="h-4 w-4" aria-hidden />
              Formation DGR — Méthode CBTA · Algérie
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">
              À propos de KOST GROUP
            </h1>
            <p className="text-lg text-white/80 leading-relaxed max-w-2xl">
              Centre de formation basé en Algérie, actif en Afrique francophone, utilisant la
              méthode IATA CBTA (Competency-Based Training & Assessment). Nous formons les
              professionnels du transport aérien aux Réglementations Marchandises Dangereuses
              (DGR) depuis Alger.
            </p>
          </div>
        </section>

        {/* NOTRE MISSION */}
        <section className="container-x max-w-4xl py-14">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#003D7A] mb-6">
            Notre mission
          </h2>
          <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed space-y-4">
            <p>
              En Algérie et en Afrique francophone, se former à l'IATA DGR revenait, jusqu'à
              récemment, à se déplacer jusqu'à Bruxelles ou Paris pour une formation facturée
              entre 3 000 et 5 000 euros. KOST GROUP a été fondé pour rompre avec cette réalité.
            </p>
            <p>
              Nous proposons 12 formations DGR à partir de 650 €, selon la méthode CBTA
              (Competency-Based Training and Assessment) utilisée par le{" "}
              <a
                href="https://www.iata.org/en/training/cbta-center-registry/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#003D7A] underline"
              >
                registre IATA CBTA Center
              </a>
              . Nous vous recommandons de vérifier les exigences spécifiques de votre compagnie
              aérienne ou autorité de tutelle.
            </p>
            <p>
              Nos formations couvrent tous les rôles réglementés : expéditeurs, agents de fret,
              handling, équipages, dispatchers, agents de sûreté. Sessions en présentiel à Alger
              ou en intra-entreprise dans toute l'Afrique francophone (Maroc, Sénégal, Tunisie,
              Côte d'Ivoire, Cameroun, Gabon…).
            </p>
          </div>
        </section>

        {/* CHIFFRES CLÉS */}
        <section className="bg-[#f7f9fc]">
          <div className="container-x max-w-4xl py-12">
            <h2 className="text-xl font-extrabold text-[#003D7A] mb-8 text-center">
              KOST GROUP en chiffres
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { num: "13", label: "Formations DGR (méthode CBTA)" },
                { num: "95%+", label: "Taux de réussite examen IATA" },
                { num: "9", label: "Pays couverts en Afrique" },
                { num: "24 mois", label: "Validité du certificat DGR" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center"
                >
                  <div className="text-3xl font-black text-[#003D7A] mb-1">{s.num}</div>
                  <div className="text-xs text-gray-500 leading-snug">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FORMATEUR */}
        <section className="container-x max-w-4xl py-14">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#003D7A] mb-6">
            Notre formateur
          </h2>
          <div className="flex flex-col md:flex-row items-start gap-6 bg-[#f7f9fc] rounded-2xl p-6 md:p-8 border border-gray-100">
            <div className="flex-shrink-0 w-20 h-20 rounded-xl bg-gradient-to-br from-[#003D7A] to-[#0a5a9c] flex items-center justify-center">
              <Award className="h-9 w-9 text-[#F39C12]" aria-hidden />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h3 className="text-lg font-extrabold text-[#0f1c2e]">
                  Formateur Principal — IATA DGR CBTA
                </h3>
                <span className="text-xs font-bold bg-[#F39C12]/15 text-[#b87400] border border-[#F39C12]/30 px-2.5 py-0.5 rounded-full">
                  KOST GROUP
                </span>
              </div>
              <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
                <Globe className="h-3.5 w-3.5" aria-hidden />
                Alger · Déplacements Afrique francophone
              </p>
              <p className="text-gray-700 leading-relaxed mb-4 text-sm">
                Praticien du fret aérien international, formé aux méthodes IATA Instructor & Evaluator, avec plus de 15 ans d'expérience en compagnie aérienne et en agence de fret. Spécialiste de la réglementation IATA DGR (67e édition 2026), il a accompagné des centaines d'apprenants — avec un taux de réussite supérieur à 95% au premier examen.
              </p>
              <ul className="space-y-1.5 text-sm">
                {[
                  "Formé aux méthodes IATA Instructor & Evaluator",
                  "15+ années dans le fret aérien international",
                  "Ancien agent acceptation DGR — compagnie aérienne",
                  "Formateur actif en Algérie · Maroc · Afrique francophone",
                ].map((c) => (
                  <li key={c} className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" aria-hidden />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* COUVERTURE GÉOGRAPHIQUE */}
        <section className="bg-[#f7f9fc]">
          <div className="container-x max-w-4xl py-12">
            <h2 className="text-xl font-extrabold text-[#003D7A] mb-6 flex items-center gap-2">
              <Globe className="h-5 w-5 text-[#F39C12]" aria-hidden />
              Couverture géographique
            </h2>
            <p className="text-gray-700 text-sm mb-5">
              Sessions en présentiel à Alger (Bab Ezzouar) toutes les 4 à 6 semaines.
              Formations intra-entreprise disponibles dans toute l'Afrique francophone dès 4 participants.
            </p>
            <div className="flex flex-wrap gap-2">
              {["🇩🇿 Algérie", "🇲🇦 Maroc", "🇹🇳 Tunisie", "🇸🇳 Sénégal", "🇨🇮 Côte d'Ivoire", "🇨🇲 Cameroun", "🇲🇱 Mali", "🇧🇫 Burkina Faso", "🇬🇦 Gabon"].map(
                (country) => (
                  <span
                    key={country}
                    className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-full px-3 py-1 text-sm font-medium text-gray-700"
                  >
                    {country}
                  </span>
                )
              )}
            </div>
          </div>
        </section>

        {/* CERTIFICATIONS & GARANTIES */}
        <section className="container-x max-w-4xl py-14">
          <h2 className="text-2xl font-extrabold text-[#003D7A] mb-6">
            Certifications & garanties
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                icon: BadgeCheck,
                title: "Formation méthode CBTA en Algérie",
                desc: "Formation dispensée localement selon la méthode CBTA (Competency-Based Training and Assessment) utilisée par le registre IATA CBTA Center.",
              },
              {
                icon: Award,
                title: "Retake gratuit si échec",
                desc: "Si vous ne réussissez pas l'examen IATA du premier coup, nous vous offrons une session de rattrapage sans frais supplémentaires.",
              },
              {
                icon: Users,
                title: "Facturation officielle EUR/USD",
                desc: "Facture via STRATEGIX (entité française) ou via notre entité algérienne selon vos besoins comptables.",
              },
              {
                icon: Globe,
                title: "Manuel IATA 2026 inclus",
                desc: "Chaque participant reçoit le manuel IATA DGR 67e édition (valeur 180 €) inclus dans le prix de la formation.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 p-5 bg-[#f7f9fc] rounded-xl border border-gray-100">
                <div className="flex-shrink-0 mt-0.5">
                  <Icon className="h-5 w-5 text-[#F39C12]" aria-hidden />
                </div>
                <div>
                  <p className="font-bold text-[#0f1c2e] text-sm mb-1">{title}</p>
                  <p className="text-gray-600 text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CONTACT RAPIDE */}
        <section className="bg-[#002A56] text-white">
          <div className="container-x max-w-4xl py-12 text-center">
            <h2 className="text-xl font-extrabold mb-3">Une question sur nos formations ?</h2>
            <p className="text-white/60 text-sm mb-6">
              176 Cité Boushaki, Bab Ezzouar, Alger · Dim–Jeu 08h30–16h30
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-white text-[#003D7A] font-bold px-5 py-2.5 rounded-full hover:bg-gray-100 transition-colors text-sm"
              >
                Formulaire de contact
              </Link>
              <Link
                href="/#formations"
                className="inline-flex items-center gap-2 border border-white/20 text-white font-semibold px-5 py-2.5 rounded-full hover:bg-white/10 transition-colors text-sm"
              >
                Voir les formations
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
