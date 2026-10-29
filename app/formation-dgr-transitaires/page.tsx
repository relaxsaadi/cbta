import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppSticky from "@/components/WhatsAppSticky";
import LeadForm from "@/components/LeadForm";
import TrackedLink from "@/components/TrackedLink";

export const metadata: Metadata = {
  title: "Formation DGR Transitaires en Algérie",
  description:
    "Formation DGR pour transitaires et agents de fret à Alger. Fonction CBTA et programme à déterminer selon les tâches exercées. Informations sur demande.",
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
      "Formation DGR pour transitaires et agents de fret aérien. Parcours CBTA établi selon les tâches et compétences à évaluer.",
    url: "https://dgr.kostacademy.com/formation-dgr-transitaires",
  },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Formation DGR / CBTA pour personnels du transit et du fret aérien",
  description:
    "Parcours de formation DGR pour les personnels du transit et du fret aérien. Les fonctions, compétences et évaluations sont définies à partir des tâches effectivement exercées.",
  provider: {
    "@type": "EducationalOrganization",
    name: "KOST GROUP",
    url: "https://dgr.kostacademy.com",
  },
  availableLanguage: "fr",
};

const RISKS = [
  {
    icon: "⚠️",
    title: "Conformité des opérations",
    text: "La formation et les compétences nécessaires dépendent des tâches réellement exercées et des exigences applicables. Les conséquences d'un écart doivent être appréciées selon les faits et le cadre concerné.",
  },
  {
    icon: "✈️",
    title: "Contrôle des expéditions",
    text: "Un transporteur peut refuser une expédition si les conditions applicables de classification, emballage, documentation ou acceptation ne sont pas remplies.",
  },
  {
    icon: "📋",
    title: "Responsabilités à déterminer",
    text: "Les responsabilités de l'expéditeur, du transitaire et des autres intervenants varient selon leurs actes, leurs obligations et les circonstances. Elles ne se déduisent pas automatiquement d'un intitulé de poste.",
  },
];

const FORMATIONS = [
  {
    code: "DGR 7.1 Initial",
    titre: "Personnel préparant des envois DGR",
    desc: "Parcours initial destiné aux tâches de préparation d'expéditions DGR concernées. L'adéquation de la fonction 7.1 est à vérifier selon les responsabilités du poste.",
    duree: "4 jours / 32h",
    prix: "1 800 €",
    badge: "Selon tâches",
    color: "#003087",
  },
  {
    code: "DGR 7.1 Recurrent",
    titre: "Formation périodique 7.1",
    desc: "Parcours périodique à adapter aux exigences applicables, à l'analyse des tâches et à la version réglementaire utilisée. Périodicité à confirmer pour chaque contexte.",
    duree: "3 jours / 24h",
    prix: "1 400 €",
    badge: "Renouvellement",
    color: "#0052cc",
  },
  {
    code: "DGR 7.2 et/ou 7.4",
    titre: "Agents cargo & manutention",
    desc: "Fonction(s) à choisir selon les tâches exactes de traitement, d'acceptation ou de manutention. Aucun regroupement 7.2/7.4 ne doit être présumé automatiquement.",
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
            Parcours <strong>DGR / CBTA</strong> — Identifiez les compétences à évaluer selon les tâches de vos équipes de transit et de fret aérien.
          </p>
          <p style={{ fontSize: 14, opacity: 0.7, marginBottom: 32 }}>
            Approche basée sur les compétences · Fonction adaptée aux tâches · Informations et justificatifs sur demande
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
              Formation DGR : identifier les exigences de chaque poste
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
                { icon: "📚", t: "Approche DGR / CBTA", d: "Programme établi selon les tâches du personnel. Statut du prestataire et justificatifs du parcours disponibles sur demande." },
                { icon: "📅", t: "Sessions régulières à Alger", d: "Planning de sessions ouvertes tout au long de l'année. Inscrivez un ou plusieurs agents sans attendre." },
                { icon: "🏢", t: "Intra-entreprise possible", d: "Session sur site envisageable selon l'effectif, les fonctions à couvrir et la disponibilité des formateurs." },
                { icon: "💶", t: "Devis selon vos besoins", d: "Tarif et durée détaillés selon les fonctions, l'effectif et le lieu de formation, sans comparaison tarifaire non vérifiée." },
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
            { q: "Tous mes agents export doivent-ils suivre la fonction 7.1 ?", a: "Pas automatiquement. Les besoins de formation et d'évaluation dépendent des tâches réellement exercées, des responsabilités attribuées et des règles applicables au poste." },
            { q: "Quelle est la périodicité des formations ?", a: "Elle doit être confirmée au regard des exigences applicables et du dispositif de suivi des compétences. Nous précisons les modalités et justificatifs du parcours proposé avant inscription." },
            { q: "Peut-on organiser une formation intra-entreprise ?", a: "Une session sur site peut être étudiée selon les fonctions, l'effectif, le lieu et les disponibilités. La durée n'est pas garantie avant validation du programme." },
            { q: "Comment vérifier la reconnaissance de la formation ?", a: "Demandez les justificatifs actuels du programme et de l'organisme émetteur. Les exigences d'acceptation dépendent de l'autorité, du transporteur et de l'employeur ; aucune reconnaissance universelle n'est présumée." },
            { q: "Quelles évaluations sont prévues ?", a: "Les modalités d'évaluation sont définies selon les compétences et le programme concernés ; elles sont communiquées avant inscription. Aucun taux de réussite n'est avancé sans données vérifiées." },
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
            <p style={{ opacity: 0.9, fontSize: 15 }}>Indiquez les tâches, l'effectif et le lieu souhaité pour recevoir une proposition adaptée.</p>
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
