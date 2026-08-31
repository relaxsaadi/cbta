import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppSticky from "@/components/WhatsAppSticky";
import LeadForm from "@/components/LeadForm";
import TrackedLink from "@/components/TrackedLink";

export const metadata: Metadata = {
  title: "Formation DGR Transitaires Algérie – Fret Aérien 7.1/7.2",
  description:
    "Formation DGR en Algérie pour transitaires et agents de fret, méthode CBTA, couvrant les catégories 7.1 & 7.2. Sessions intra-entreprise possibles. Devis 24h.",
  alternates: { canonical: "/formation-dgr-transitaires" },
  keywords: [
    "formation DGR transitaires",
    "formation IATA DGR agents de fret",
    "DGR 7.1 transitaires",
    "formation marchandises dangereuses transitaires Algérie",
    "formation DGR agents de fret internationaux",
  ],
  openGraph: {
    title: "Formation DGR pour Transitaires — KOST GROUP",
    description:
      "Formation DGR 7.1 & 7.2, méthode CBTA, pour transitaires, commissionnaires en douane et agents de fret aérien.",
    url: "https://dgr.kostacademy.com/formation-dgr-transitaires",
  },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Formation IATA DGR pour Transitaires (Catégories 7.1 & 7.2)",
  description:
    "Formation obligatoire IATA DGR pour les transitaires, commissionnaires en douane et agents de fret aérien. Couvre les catégories 7.1 (expéditeurs) et 7.2 (agents cargo).",
  provider: {
    "@type": "EducationalOrganization",
    name: "KOST GROUP",
    url: "https://dgr.kostacademy.com",
  },
  courseCode: "DGR-7.1-7.2",
  availableLanguage: "fr",
  occupationalCredentialAwarded: "Certificat DGR-CBTA",
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
    title: "Amende & suspension",
    text: "Un transitaire qui expédie des marchandises dangereuses sans personnel certifié DGR risque une suspension d'accréditation cargo et des amendes DGAC/ANAC.",
  },
  {
    icon: "✈️",
    title: "Refus en compagnie",
    text: "Les compagnies aériennes refusent systématiquement les envois DGR dont le transitaire n'a pas de personnel certifié DGR 7.1 en poste.",
  },
  {
    icon: "📋",
    title: "Responsabilité pénale",
    text: "En cas d'incident DGR, la responsabilité civile et pénale de l'expéditeur — et donc du transitaire signataire — est directement engagée.",
  },
];

const FORMATIONS = [
  {
    code: "DGR 7.1 Initial",
    titre: "Expéditeurs & Transitaires",
    desc: "Formation complète pour toute personne qui prépare, classe, emballe, étiquette et documente des envois de marchandises dangereuses. La formation de référence pour les transitaires.",
    duree: "4 jours / 32h",
    prix: "1 800 €",
    badge: "Essentielle transitaires",
    color: "#003087",
  },
  {
    code: "DGR 7.1 Recurrent",
    titre: "Renouvellement 7.1 (24 mois)",
    desc: "Renouvellement obligatoire tous les 24 mois pour maintenir la certification 7.1 active. Mise à jour DGR dernière édition incluse.",
    duree: "3 jours / 24h",
    prix: "1 400 €",
    badge: "Renouvellement",
    color: "#0052cc",
  },
  {
    code: "DGR 7.2 + 7.4",
    titre: "Agents cargo & manutention",
    desc: "Pour les agents de fret en station cargo : acceptation, manutention et stockage des envois DGR. Complémentaire au 7.1 pour les équipes cargo.",
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
            Catégories <strong>7.1 & 7.2</strong> — Certifiez vos équipes pour expédier légalement des marchandises dangereuses par avion.
          </p>
          <p style={{ fontSize: 14, opacity: 0.7, marginBottom: 32 }}>
            Obligation OACI Annexe 18 · Méthode CBTA · Certificat valable 24 mois
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

        {/* Risques sans certification */}
        <section style={{ background: "#FFF3CD", borderBottom: "1px solid #FBBF24", padding: "32px 24px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <h2 style={{ textAlign: "center", fontSize: 20, fontWeight: 700, marginBottom: 24, color: "#92400E" }}>
              Sans certification DGR, votre activité de transitaire est en danger
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
                { icon: "🏅", t: "Formation méthode CBTA en Algérie", d: "Formation DGR dispensée localement en Algérie, sans déplacement en Europe." },
                { icon: "📅", t: "Sessions régulières à Alger", d: "Planning de sessions ouvertes tout au long de l'année. Inscrivez un ou plusieurs agents sans attendre." },
                { icon: "🏢", t: "Intra-entreprise possible", d: "Formateur déplacé dans vos locaux pour former tout votre pôle export DGR en une session." },
                { icon: "💶", t: "50% moins cher qu'en Europe", d: "Même méthode CBTA, même exigence de formation, moitié prix par rapport à Paris ou Bruxelles." },
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
            { q: "Tous mes agents export doivent-ils être certifiés DGR ?", a: "Oui. Tout agent qui prépare, classe, emballe ou documente des envois DGR doit détenir un certificat DGR 7.1 en cours de validité (OACI Annexe 18, IATA DGR Section 1)." },
            { q: "Quelle est la validité de la certification ?", a: "24 mois. À l'échéance, votre agent doit suivre la formation DGR 7.1 Recurrent pour renouveler son certificat." },
            { q: "Peut-on former toute l'équipe en une semaine ?", a: "Oui, en intra-entreprise. Le formateur KOST se déplace dans vos locaux et forme jusqu'à 10-12 agents simultanément." },
            { q: "Le certificat KOST est-il reconnu par Air Algérie, Cargolux, etc. ?", a: "Le certificat délivré suit le référentiel IATA DGR et la méthode CBTA. Nous vous recommandons de vérifier les exigences spécifiques de votre compagnie aérienne partenaire." },
            { q: "Y a-t-il un examen à la fin ?", a: "Oui. L'évaluation CBTA est basée sur des compétences (Competency-Based Training and Assessment)." },
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
