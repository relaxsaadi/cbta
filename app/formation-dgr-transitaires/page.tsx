import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppSticky from "@/components/WhatsAppSticky";
import LeadForm from "@/components/LeadForm";
import TrackedLink from "@/components/TrackedLink";

export const metadata: Metadata = {
  title: "Formation DGR Transitaires Algérie — Selon les fonctions",
  description:
    "Formation DGR/CBTA pour transitaires et agents de fret aérien en Algérie. Parcours défini selon les tâches et exigences applicables.",
  alternates: { canonical: "/formation-dgr-transitaires" },
  keywords: [
    "formation DGR transitaires",
    "formation IATA DGR agents de fret",
    "DGR 7.1 transitaires",
    "formation marchandises dangereuses transitaires Algérie",
    "certification DGR freight forwarders",
  ],
  openGraph: {
    title: "Formation DGR pour Transitaires — KOST GROUP",
    description:
      "Formations DGR/CBTA pour les transitaires et agents de fret, sans attribution automatique de fonction.",
    url: "https://dgr.kostacademy.com/formation-dgr-transitaires",
  },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Formation DGR/CBTA pour transitaires (selon fonctions)",
  description:
    "Formation DGR/CBTA pour professionnels du fret aérien, ajustée aux tâches réellement exercées et aux exigences applicables.",
  provider: {
    "@type": "EducationalOrganization",
    name: "KOST GROUP",
    url: "https://dgr.kostacademy.com",
  },
  availableLanguage: "fr",
  offers: {
    "@type": "Offer",
    price: "900",
    priceCurrency: "EUR",
    availability: "https://schema.org/InStock",
  },
};

const RISKS = [
  {
    icon: "⚠️",
    title: "Exigences à vérifier",
    text: "Les obligations de formation et conséquences de non-conformité dépendent des tâches, des textes en vigueur et des exigences des opérateurs. Vérifier les sources applicables.",
  },
  {
    icon: "✈️",
    title: "Exigences des opérateurs",
    text: "Les transporteurs peuvent appliquer des conditions particulières d'acceptation et de formation. Vérifier les exigences de chaque opérateur et les tâches réellement exercées.",
  },
  {
    icon: "📋",
    title: "Responsabilités opérationnelles",
    text: "Les responsabilités dépendent des rôles, contrats, opérations et textes applicables. Aucune sanction ou attribution de responsabilité ne peut être présumée ici.",
  },
];

const FORMATIONS = [
  {
    code: "DGR 7.1 Initial",
    titre: "Expéditeurs & Transitaires",
    desc: "Parcours destiné aux personnes réalisant des tâches de préparation d'expéditions DGR, sous réserve de la correspondance des fonctions et du programme applicable.",
    duree: "4 jours / 32h",
    prix: "1 800 €",
    badge: "Selon fonctions",
    color: "#003087",
  },
  {
    code: "DGR 7.1 Recurrent",
    titre: "Actualisation DGR 7.1 (selon exigences)",
    desc: "La périodicité, le contenu et la nécessité de la formation récurrente doivent être vérifiés selon les règles applicables et la fonction exercée.",
    duree: "3 jours / 24h",
    prix: "1 400 €",
    badge: "Renouvellement",
    color: "#0052cc",
  },
  {
    code: "DGR 7.2 + 7.4",
    titre: "Agents cargo & manutention",
    desc: "Parcours à définir selon les tâches d'acceptation, de manutention ou de stockage confiées aux personnels concernés.",
    duree: "2 jours / 16h",
    prix: "900 €",
    badge: "Cargo & handling",
    color: "#0066cc",
  },
];

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <Navbar />
      <main style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif" }}>

        {/* Hero */}
        <section style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #003087 100%)", color: "white", padding: "80px 24px", textAlign: "center" }}>
          <p style={{ fontSize: 13, letterSpacing: 2, opacity: 0.7, marginBottom: 12, textTransform: "uppercase" }}>Secteur Transitaires & Fret Aérien</p>
          <h1 style={{ fontSize: "clamp(26px, 4.5vw, 44px)", fontWeight: 700, margin: "0 0 16px", lineHeight: 1.2 }}>
            Formation IATA DGR<br />pour Transitaires
          </h1>
          <p style={{ fontSize: 17, opacity: 0.9, maxWidth: 580, margin: "0 auto 12px" }}>
            Parcours DGR/CBTA adaptés aux <strong>tâches exercées</strong>, sous réserve des exigences applicables.
          </p>
          <p style={{ fontSize: 14, opacity: 0.7, marginBottom: 32 }}>
            Sources OACI/IATA, textes nationaux et exigences opérateur à vérifier par fonction
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#formations" style={{ background: "white", color: "#003087", padding: "14px 28px", borderRadius: 8, fontWeight: 700, textDecoration: "none" }}>
              Voir les formations
            </a>
            <TrackedLink track="whatsapp" location="formation-dgr-transitaires" href="https://wa.me/213542305383?text=Bonjour%2C%20je%20suis%20transitaire%20et%20souhaite%20former%20mon%20%C3%A9quipe%20DGR" target="_blank" rel="noopener noreferrer" style={{ background: "#25D366", color: "white", padding: "14px 28px", borderRadius: 8, fontWeight: 700, textDecoration: "none" }}>
              WhatsApp
            </TrackedLink>
          </div>
        </section>

        {/* Exigences à clarifier selon les fonctions */}
        <section style={{ background: "#FFF3CD", borderBottom: "1px solid #FBBF24", padding: "32px 24px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <h2 style={{ textAlign: "center", fontSize: 20, fontWeight: 700, marginBottom: 24, color: "#92400E" }}>
              Identifiez les exigences de formation propres à vos opérations DGR
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
              {RISKS.map((r) => (
                <div key={r.title} style={{ background: "white", borderRadius: 10, padding: "20px", border: "1px solid #FCD34D" }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{r.icon}</div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: "#92400E" }}>{r.title}</h3>
                  <p style={{ fontSize: 13, color: "#555", lineHeight: 1.5, margin: 0 }}>{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Formations */}
        <section id="formations" style={{ maxWidth: 1000, margin: "0 auto", padding: "60px 24px" }}>
          <h2 style={{ textAlign: "center", fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
            Formations DGR pour transitaires
          </h2>
          <p style={{ textAlign: "center", color: "#666", marginBottom: 40 }}>
            Inter-entreprises (Alger) ou intra-entreprise (vos locaux, toute l&apos;Afrique)
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {FORMATIONS.map((f) => (
              <div key={f.code} style={{ background: "white", border: `2px solid ${f.color}`, borderRadius: 12, padding: "28px", display: "flex", flexWrap: "wrap", gap: 20, alignItems: "flex-start" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <span style={{ background: f.color, color: "white", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    {f.badge}
                  </span>
                  <h3 style={{ fontSize: 20, fontWeight: 700, margin: "12px 0 6px", color: f.color }}>{f.code}</h3>
                  <p style={{ fontSize: 15, fontWeight: 600, color: "#333", marginBottom: 8 }}>{f.titre}</p>
                  <p style={{ color: "#555", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
                </div>
                <div style={{ textAlign: "right", minWidth: 140 }}>
                  <div style={{ fontSize: 13, color: "#888", marginBottom: 4 }}>Durée</div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>{f.duree}</div>
                  <div style={{ fontSize: 13, color: "#888", marginBottom: 4 }}>À partir de</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: f.color }}>{f.prix}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pourquoi KOST */}
        <section style={{ background: "#f0f4ff", padding: "50px 24px" }}>
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            <h2 style={{ textAlign: "center", fontSize: 24, fontWeight: 700, marginBottom: 32 }}>
              Pourquoi les transitaires choisissent KOST GROUP ?
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 16 }}>
              {[
                { icon: "🏅", t: "Parcours par fonctions", d: "Les besoins de formation et de reconnaissance sont à vérifier selon les tâches, l'autorité et l'opérateur concernés." },
                { icon: "📅", t: "Sessions régulières à Alger", d: "Planning de sessions ouvertes tout au long de l'année. Inscrivez un ou plusieurs agents sans attendre." },
                { icon: "🏢", t: "Intra-entreprise possible", d: "Modalités d'intervention et qualifications des formateurs à préciser dans la proposition adaptée à votre équipe." },
                { icon: "💶", t: "Proposition sur devis", d: "Devis à confirmer selon le programme, la durée, les modalités et le nombre de participants." },
              ].map((r) => (
                <div key={r.t} style={{ background: "white", borderRadius: 10, padding: "20px" }}>
                  <div style={{ fontSize: 30, marginBottom: 10 }}>{r.icon}</div>
                  <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 15 }}>{r.t}</div>
                  <div style={{ color: "#555", fontSize: 13, lineHeight: 1.5 }}>{r.d}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ maxWidth: 760, margin: "0 auto", padding: "60px 24px" }}>
          <h2 style={{ textAlign: "center", fontSize: 24, fontWeight: 700, marginBottom: 32 }}>Questions fréquentes — Transitaires</h2>
          {[
            { q: "Tous mes agents export doivent-ils être certifiés DGR ?", a: "La formation requise dépend des fonctions réellement exercées, du cadre applicable et des exigences de l'employeur ou de l'opérateur. La fonction 7.1 ne se déduit pas du seul métier de transitaire." },
            { q: "Quelle est la validité de la certification ?", a: "La validité et l'éventuel recyclage doivent être établis selon les textes, les fonctions exercées et les exigences applicables. Aucune durée universelle n'est présumée." },
            { q: "Peut-on former toute l'équipe en une semaine ?", a: "Oui, en intra-entreprise. Le formateur KOST se déplace dans vos locaux et forme jusqu'à 10-12 agents simultanément." },
            { q: "Le certificat KOST est-il reconnu par Air Algérie, Cargolux, etc. ?", a: "Aucune reconnaissance universelle par les compagnies ne peut être garantie. Il convient de vérifier le type de certificat délivré, le périmètre du programme et les exigences du transporteur concerné." },
            { q: "Y a-t-il un examen à la fin ?", a: "Les modalités d'évaluation dépendent du programme convenu. Aucun taux de réussite n'est affirmé sans preuves vérifiables." },
          ].map((faq) => (
            <details key={faq.q} style={{ borderBottom: "1px solid #e5e7eb", padding: "16px 0" }}>
              <summary style={{ fontWeight: 600, cursor: "pointer", fontSize: 15, color: "#003087" }}>{faq.q}</summary>
              <p style={{ color: "#555", lineHeight: 1.6, marginTop: 10, marginBottom: 0, fontSize: 14 }}>{faq.a}</p>
            </details>
          ))}
        </section>

        {/* Formulaire */}
        <section style={{ background: "#003087", padding: "60px 24px" }}>
          <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center", color: "white", marginBottom: 32 }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Devis gratuit pour votre entreprise</h2>
            <p style={{ opacity: 0.9, fontSize: 15 }}>Indiquez le nombre d&apos;agents à certifier — nous vous envoyons un devis sous 24h.</p>
          </div>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <Suspense fallback={null}>
              <LeadForm sourcePage="/formation-dgr-transitaires" />
            </Suspense>
          </div>
        </section>

        {/* Liens internes */}
        <nav style={{ background: "#f1f5f9", padding: "20px 24px", textAlign: "center" }}>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", fontSize: 14 }}>
            <Link href="/formation-dgr-petrole-gaz" style={{ color: "#003087", textDecoration: "none" }}>DGR Pétrole & Gaz</Link>
            <Link href="/formation-dgr-pharmacie" style={{ color: "#003087", textDecoration: "none" }}>DGR Pharmacie</Link>
            <Link href="/formation-dgr-algerie" style={{ color: "#003087", textDecoration: "none" }}>Formation DGR Algérie</Link>
            <Link href="/formation-dgr-afrique" style={{ color: "#003087", textDecoration: "none" }}>Formation DGR Afrique</Link>
            <Link href="/dgr-7-1" style={{ color: "#003087", textDecoration: "none" }}>DGR 7.1 — Détails</Link>
            <Link href="/" style={{ color: "#003087", textDecoration: "none" }}>Accueil</Link>
          </div>
        </nav>
      </main>
      <Footer />
      <WhatsAppSticky />
    </>
  );
}
