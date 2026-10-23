import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppSticky from "@/components/WhatsAppSticky";
import LeadForm from "@/components/LeadForm";
import TrackedLink from "@/components/TrackedLink";

export const metadata: Metadata = {
  title: "Formation DGR pour transitaires en Algérie | KOST",
  description:
    "Formations DGR/CBTA pour les activités de transit et de fret aérien. Les fonctions pertinentes sont déterminées selon les tâches réellement exercées.",
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
      "Parcours DGR/CBTA pour transitaires et agents de fret aérien, à préciser selon les tâches réellement exercées.",
    url: "https://dgr.kostacademy.com/formation-dgr-transitaires",
  },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Formation DGR/CBTA pour les activités de transit et de fret aérien",
  description:
    "Programme DGR/CBTA orienté fret aérien. Le périmètre de formation est déterminé par les tâches réellement exercées, sans attribution automatique de fonctions.",
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
    title: "Compétences à déterminer",
    text: "Identifier les tâches exercées permet de définir les compétences DGR pertinentes sans attribuer automatiquement une fonction à un poste.",
  },
  {
    icon: "✈️",
    title: "Exigences des exploitants",
    text: "Les obligations de formation et les conditions d'acceptation du fret doivent être vérifiées dans les référentiels et procédures applicables.",
  },
  {
    icon: "🗂️",
    title: "Preuves et traçabilité",
    text: "Conserver les éléments d'évaluation, les décisions de compétence et les justificatifs pertinents facilite la revue de conformité.",
  },
];

const FORMATIONS = [
  {
    code: "Analyse des tâches",
    titre: "Diagnostic DGR/CBTA",
    desc: "Identification des activités effectivement exercées, puis sélection des fonctions pertinentes à partir des tableaux CBTA applicables.",
    duree: "À définir",
    prix: "Sur devis",
    badge: "Étape préalable",
    color: "#003087",
  },
  {
    code: "Parcours initial",
    titre: "Fonctions 7.1 à 7.10 selon les tâches",
    desc: "Programme et évaluations propres aux compétences visées. Aucun parcours n'est attribué sur le seul intitulé de poste.",
    duree: "Selon programme",
    prix: "Sur devis",
    badge: "Selon fonction",
    color: "#0052cc",
  },
  {
    code: "Actualisation des compétences",
    titre: "Revue et formation complémentaire",
    desc: "Périodicité et contenu adaptés aux exigences applicables, aux tâches et aux résultats de l'évaluation.",
    duree: "À confirmer",
    prix: "Sur devis",
    badge: "Selon besoin",
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
            Déterminez les fonctions <strong>7.1 à 7.10</strong> pertinentes selon les tâches réellement exercées dans votre activité de fret aérien.
          </p>
          <p style={{ fontSize: 14, opacity: 0.7, marginBottom: 32 }}>
            Référentiels OACI et IATA à vérifier · Formation et évaluation adaptées aux tâches
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
              Identifier les exigences DGR liées à votre activité
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
            Modalités inter-entreprises et intra-entreprise à confirmer selon les besoins
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
                { icon: "📋", t: "Parcours adaptés aux tâches", d: "Les fonctions CBTA sont définies selon les activités réellement exercées, sans reconnaissance universelle présumée." },
                { icon: "📅", t: "Sessions sur demande", d: "Calendrier et capacité à confirmer avant toute inscription." },
                { icon: "🏢", t: "Formation en entreprise à étudier", d: "Modalités, intervenants et disponibilité à confirmer selon le programme demandé." },
                { icon: "📝", t: "Offre sur devis", d: "Durée, tarifs et modalités de formation établis après analyse des tâches et du besoin." },
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
            { q: "Tous mes agents export ont-ils besoin de la même formation ?", a: "Les besoins de formation et d'évaluation dépendent des tâches confiées à chaque personne et des exigences applicables. Une fonction CBTA ne se déduit pas automatiquement du poste occupé." },
            { q: "Quelle est la validité de la formation ?", a: "La périodicité et les modalités d'actualisation sont à confirmer selon les exigences applicables et les tâches de la personne concernée." },
            { q: "Peut-on organiser une formation pour toute l'équipe ?", a: "Une formation en groupe peut être étudiée après analyse des tâches, des effectifs et des disponibilités. La durée et les modalités sont confirmées dans l'offre." },
            { q: "Le certificat est-il reconnu par les exploitants aériens ?", a: "La reconnaissance dépend du programme, de l'exploitant et des exigences applicables. Elle doit être vérifiée auprès des organismes concernés avant tout engagement." },
            { q: "Y a-t-il une évaluation ?", a: "Le dispositif d'évaluation et ses modalités sont précisés pour chaque parcours CBTA après définition des compétences visées." },
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
            <p style={{ opacity: 0.9, fontSize: 15 }}>Indiquez les tâches et le nombre de personnes à former pour obtenir une proposition adaptée.</p>
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
