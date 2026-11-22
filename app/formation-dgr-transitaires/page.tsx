import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppSticky from "@/components/WhatsAppSticky";
import LeadForm from "@/components/LeadForm";
import TrackedLink from "@/components/TrackedLink";

export const metadata: Metadata = {
  title: "Formation marchandises dangereuses — transitaires et fret aérien",
  description:
    "Formation et accompagnement sur les marchandises dangereuses en transport aérien. Le périmètre est défini selon les tâches réellement exercées et les exigences applicables.",
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
      "Programme établi après analyse des tâches, des sources applicables et des exigences de l'État et de l'exploitant.",
    url: "https://dgr.kostacademy.com/formation-dgr-transitaires",
  },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Formation sur les marchandises dangereuses en transport aérien",
  description:
    "Programme de formation défini après analyse des tâches réellement exercées et vérification des exigences réglementaires, de l'État et de l'exploitant concernés.",
  provider: {
    "@type": "EducationalOrganization",
    name: "KOST GROUP",
    url: "https://dgr.kostacademy.com",
  },
  availableLanguage: "fr",
};

const RISKS = [
  {
    icon: "📋",
    title: "Identifier les tâches",
    text: "Décrivez les opérations réellement réalisées par chaque personne : préparation, documentation, acceptation, manutention, chargement ou autres activités.",
  },
  {
    icon: "📚",
    title: "Vérifier les exigences",
    text: "Les compétences requises dépendent des tâches, des règles en vigueur, des variations de l'État et des procédures de l'exploitant.",
  },
  {
    icon: "✈️",
    title: "Confirmer le périmètre",
    text: "Avant de choisir une formation ou de planifier un envoi, confirmez le périmètre applicable auprès de l'employeur, de l'exploitant et, si nécessaire, de l'autorité compétente.",
  },
];

const FORMATIONS = [
  {
    code: "Analyse préalable",
    titre: "Cartographie des tâches et du périmètre",
    desc: "Les fonctions CBTA ne sont pas attribuées à partir du seul intitulé de poste ou du secteur. Le programme est proposé après examen des tâches réelles, des sources applicables et des exigences de l'État et de l'exploitant.",
    duree: "À définir",
    prix: "Sur devis",
    badge: "Avant inscription",
    color: "#003087",
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
            Formation marchandises dangereuses<br />pour les activités de transit et de fret
          </h1>
          <p style={{ fontSize: 17, opacity: 0.9, maxWidth: 580, margin: "0 auto 12px" }}>
            Le périmètre de formation est déterminé à partir des tâches réellement exercées et des exigences applicables au transport aérien.
          </p>
          <p style={{ fontSize: 14, opacity: 0.7, marginBottom: 32 }}>
            Tâches, références réglementaires et modalités à confirmer avant la session
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
              Avant toute formation, identifiez les tâches et vérifiez les exigences applicables
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
                { icon: "🏅", t: "Périmètre défini par les tâches", d: "Le programme est construit à partir des opérations réellement confiées, sans attribuer automatiquement une fonction à un métier." },
                { icon: "📅", t: "Sessions selon planning confirmé", d: "Les dates et disponibilités sont communiquées après confirmation du programme et de la proposition." },
                { icon: "🏢", t: "Modalités intra-entreprise", d: "Le lieu, la durée, les moyens pédagogiques et les conditions logistiques sont précisés dans le programme et le devis." },
                { icon: "💶", t: "Devis transparent", d: "Le prix est communiqué après définition du périmètre, de la durée et des modalités de la session." },
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
            { q: "Tous mes agents export relèvent-ils de la même fonction CBTA ?", a: "Non. Un intitulé de poste ou l'appartenance au service export ne suffit pas à attribuer une fonction. Il faut recenser les tâches réellement confiées, puis vérifier les exigences actuelles de l'État et de l'exploitant." },
            { q: "Quelle est la périodicité de formation récurrente ?", a: "Elle dépend des règles applicables, des tâches et des exigences de l'État et de l'exploitant. La périodicité doit être vérifiée dans les sources en vigueur avant toute planification." },
            { q: "Peut-on former toute l'équipe en une semaine ?", a: "La faisabilité, le lieu, les déplacements, la capacité du groupe et la durée sont confirmés dans une proposition écrite après cadrage du besoin." },
            { q: "Le document délivré est-il automatiquement accepté par toutes les compagnies ?", a: "Aucune acceptation universelle ne doit être présumée. Vérifiez le statut et le périmètre du prestataire dans les registres officiels, puis confirmez l'acceptation du document auprès de l'exploitant et de l'autorité concernés." },
            { q: "Quelles sont les modalités d'évaluation ?", a: "Elles sont précisées dans le programme et le devis. Le type d'évaluation, les critères, le statut du document délivré et les éventuelles conditions de reprise sont communiqués avant inscription." },
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
            <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Cadrage de formation pour votre entreprise</h2>
            <p style={{ opacity: 0.9, fontSize: 15 }}>Décrivez les tâches de vos équipes et le contexte d'exploitation pour recevoir une proposition de périmètre et de programme.</p>
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
