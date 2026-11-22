import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppSticky from "@/components/WhatsAppSticky";
import LeadForm from "@/components/LeadForm";
import TrackedLink from "@/components/TrackedLink";

export const metadata: Metadata = {
  title: "Formation DGR IATA Entreprises & Grands Comptes — Intra & Groupe",
  description:
    "Formation DGR CBTA sur mesure pour les entreprises en Algérie : besoins définis selon les tâches et fonctions exercées, modalités de formation sur devis.",
  alternates: { canonical: "/entreprises" },
  keywords: [
    "formation DGR entreprises Algérie",
    "formation IATA DGR grands comptes",
    "formation DGR intra entreprise",
    "IATA DGR Sonatrach",
    "certification DGR marchés publics Algérie",
    "formation DGR entreprises secteur public",
  ],
  openGraph: {
    title: "Formation DGR IATA Entreprises — KOST GROUP",
    description:
      "Formations DGR pour grands comptes. Seul prestataire IATA CBTA Provider certifié en Algérie.",
    url: "https://dgr.kostacademy.com/entreprises",
  },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Formation DGR IATA Intra-Entreprise — Grands Comptes",
  description:
    "Service de formation DGR CBTA pour les entreprises en Algérie et en Afrique. Besoins étudiés fonction par fonction ; interventions sur site sous réserve des autorisations applicables.",
  provider: {
    "@type": "EducationalOrganization",
    name: "KOST GROUP",
    url: "https://dgr.kostacademy.com",
    telephone: "+213542305383",
    address: {
      "@type": "PostalAddress",
      addressCountry: "DZ",
      addressLocality: "Alger",
      postalCode: "16024",
    },
  },
  areaServed: ["DZ", "MA", "TN", "SN", "CI", "CM", "GA"],
  serviceType: "Formation professionnelle DGR IATA",
  hasCredential: {
    "@type": "EducationalOccupationalCredential",
    name: "IATA CBTA Provider n°CBTA-PR-25-0059",
  },
};

const SECTEURS = [
  {
    icon: "🛢️",
    titre: "Oil & Gas",
    entreprises: "Sonatrach, TotalEnergies, Eni, Halliburton",
    potentiel: "20 – 50 M DZD / an",
    couleur: "#7c3800",
    fond: "#fff8f0",
    bordure: "#fcd34d",
    categories: ["Classe 2 — Gaz comprimés (LPG, propane)", "Classe 3 — Liquides inflammables", "Classe 8 — Corrosifs (acides de forage)"],
  },
  {
    icon: "✈️",
    titre: "Aviation & Cargo",
    entreprises: "Air Algérie Cargo, Tassili Airlines, agents IATA",
    potentiel: "15 – 30 M DZD / an",
    couleur: "#003087",
    fond: "#eff6ff",
    bordure: "#93c5fd",
    categories: ["Acceptation des DG — fonctions selon tâches réelles", "Passagers et équipages — fonctions selon responsabilités", "Handling et escale — compétences selon activités"],
  },
  {
    icon: "🏛️",
    titre: "Institutionnel & Défense",
    entreprises: "Douanes, Armée, hôpitaux, universités",
    potentiel: "5 – 15 M DZD / an",
    couleur: "#166534",
    fond: "#f0fdf4",
    bordure: "#86efac",
    categories: ["Classe 6.2 — Matières infectieuses", "Classe 7 — Matières radioactives", "Classe 9 — Matières diverses (piles Li)"],
  },
];

const AVANTAGES = [
  {
    icon: "✅",
    titre: "Seul centre IATA CBTA Provider certifié en Algérie",
    desc: "Statut de prestataire CBTA à vérifier dans le registre IATA. Les attestations sont soumises aux exigences de l’employeur, de l’opérateur et de l’autorité compétente.",
  },
  {
    icon: "📋",
    titre: "Périmètre des autorisations nationales",
    desc: "Les justificatifs ANAC actualisés et le périmètre applicable à chaque fonction et prestation sont à vérifier avant contractualisation ; aucun statut n’est présumé par cette page.",
  },
  {
    icon: "🚁",
    titre: "Formation sur votre site, partout en Algérie et en Afrique",
    desc: "Sessions intra-entreprise possibles sur devis, sous réserve des autorisations locales et conditions logistiques applicables.",
  },
  {
    icon: "📄",
    titre: "Facturation conforme marchés publics",
    desc: "Factures pro forma, bon de commande, PV de formation, attestations individuelles CBTA — tous les justificatifs requis pour votre comptabilité publique ou privée.",
  },
];

const ETAPES = [
  {
    num: "01",
    titre: "Audit DGR gratuit",
    desc: "Nous analysons les tâches réellement exercées, établissons les besoins de formation CBTA fonction par fonction et vous remettons un plan à valider avec votre responsable conformité et les autorités ou opérateurs concernés.",
  },
  {
    num: "02",
    titre: "Planification de la session",
    desc: "Nous proposons des dates flexibles — formation chez vous ou dans notre centre à Alger. Nous adaptons le contenu à vos produits (classes DGR concernées) et au nombre de participants.",
  },
  {
    num: "03",
    titre: "Formation et évaluation CBTA par fonction",
    desc: "Les résultats et attestations individuels suivent les modalités du programme convenu. La validité, les recyclages et l’acceptation relèvent des exigences applicables ; un document de suivi peut être fourni.",
  },
];

const ROI_ROWS = [
  {
    item: "Formation DGR 7.1 (5 agents)",
    cout: "~250 000 DZD",
    risque: "—",
    classe: "light",
  },
  {
    item: "Sanction réglementaire éventuelle (selon les textes applicables)",
    cout: "—",
    risque: "À documenter juridiquement",
    classe: "risk",
  },
  {
    item: "Incident cargo DGR en vol — responsabilité civile",
    cout: "—",
    risque: "Selon faits et droit applicable",
    classe: "risk",
  },
  {
    item: "Perte de contrat cargo faute de certification",
    cout: "—",
    risque: "Perte marché + pénalités",
    classe: "risk",
  },
  {
    item: "Formation récurrente si requise",
    cout: "Sur devis",
    risque: "—",
    classe: "light",
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
        <section style={{
          background: "linear-gradient(135deg, #0D1B2A 0%, #1B4F72 100%)",
          color: "white",
          padding: "80px 24px",
          textAlign: "center",
        }}>
          <p style={{ fontSize: 12, letterSpacing: 3, opacity: 0.65, marginBottom: 12, textTransform: "uppercase" }}>
            Grands comptes &amp; entreprises — Algérie &amp; Afrique
          </p>
          <h1 style={{ fontSize: "clamp(26px, 4.5vw, 44px)", fontWeight: 700, margin: "0 0 16px", lineHeight: 1.2 }}>
            Formation DGR IATA pour les Entreprises<br />
            Intra &amp; Groupe
          </h1>
          <p style={{ fontSize: 17, opacity: 0.9, maxWidth: 620, margin: "0 auto 10px", lineHeight: 1.6 }}>
            Premier centre CBTA Provider certifié IATA en Algérie (n°CBTA-PR-25-0059). Formations sur site ou dans notre centre.
          </p>
          <p style={{ fontSize: 13, opacity: 0.65, marginBottom: 36 }}>
            Périmètre ANAC et reconnaissance des attestations à vérifier sur justificatifs
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="#contact"
              style={{ background: "white", color: "#1B4F72", padding: "14px 28px", borderRadius: 8, fontWeight: 700, textDecoration: "none", fontSize: 15 }}
            >
              Demander un devis groupe
            </a>
            <TrackedLink
              track="whatsapp"
              location="entreprises-page"
              href="https://wa.me/213542305383?text=Bonjour%2C%20je%20souhaite%20un%20devis%20pour%20une%20formation%20DGR%20intra-entreprise"
              target="_blank"
              rel="noopener noreferrer"
              style={{ background: "#25D366", color: "white", padding: "14px 28px", borderRadius: 8, fontWeight: 700, textDecoration: "none", fontSize: 15 }}
            >
              WhatsApp direct
            </TrackedLink>
          </div>
        </section>

        {/* Pourquoi nous choisir */}
        <section style={{ maxWidth: 980, margin: "0 auto", padding: "64px 24px" }}>
          <h2 style={{ textAlign: "center", fontSize: 26, fontWeight: 700, marginBottom: 8 }}>
            Pourquoi choisir KOST GROUP pour vos formations DGR ?
          </h2>
          <p style={{ textAlign: "center", color: "#666", marginBottom: 40, fontSize: 15 }}>
            Quatre avantages décisifs pour les acheteurs publics et privés
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
            {AVANTAGES.map((a) => (
              <div
                key={a.titre}
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: "24px 20px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 12 }}>{a.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, color: "#0D1B2A" }}>{a.titre}</div>
                <div style={{ fontSize: 13, color: "#666", lineHeight: 1.6 }}>{a.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Secteurs cibles */}
        <section style={{ background: "#f8fafc", padding: "56px 24px" }}>
          <div style={{ maxWidth: 980, margin: "0 auto" }}>
            <h2 style={{ textAlign: "center", fontSize: 26, fontWeight: 700, marginBottom: 8 }}>
              Secteurs &amp; grands comptes prioritaires
            </h2>
            <p style={{ textAlign: "center", color: "#666", marginBottom: 40, fontSize: 15 }}>
              Estimations commerciales indicatives ; besoins réels à déterminer selon les fonctions exercées
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
              {SECTEURS.map((s) => (
                <div
                  key={s.titre}
                  style={{
                    background: s.fond,
                    border: `1.5px solid ${s.bordure}`,
                    borderRadius: 14,
                    padding: "28px 24px",
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 10 }}>{s.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: s.couleur, marginBottom: 4 }}>{s.titre}</div>
                  <div style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>{s.entreprises}</div>
                  <div style={{
                    display: "inline-block",
                    background: s.couleur,
                    color: "white",
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "4px 12px",
                    borderRadius: 20,
                    marginBottom: 16,
                  }}>
                    Potentiel : {s.potentiel}
                  </div>
                  <ul style={{ margin: 0, padding: "0 0 0 16px" }}>
                    {s.categories.map((cat) => (
                      <li key={cat} style={{ fontSize: 12, color: "#555", lineHeight: 1.7 }}>{cat}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Processus 3 étapes */}
        <section style={{ maxWidth: 860, margin: "0 auto", padding: "64px 24px" }}>
          <h2 style={{ textAlign: "center", fontSize: 26, fontWeight: 700, marginBottom: 8 }}>
            Notre processus en 3 étapes
          </h2>
          <p style={{ textAlign: "center", color: "#666", marginBottom: 44, fontSize: 15 }}>
            De l&apos;audit à la certification — un accompagnement clé en main
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {ETAPES.map((e, i) => (
              <div
                key={e.num}
                style={{
                  display: "flex",
                  gap: 20,
                  alignItems: "flex-start",
                  background: i === 0 ? "#eff6ff" : i === 1 ? "#f0fdf4" : "#fefce8",
                  border: `1px solid ${i === 0 ? "#bfdbfe" : i === 1 ? "#bbf7d0" : "#fde68a"}`,
                  borderRadius: 12,
                  padding: "24px 20px",
                }}
              >
                <div style={{
                  minWidth: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: i === 0 ? "#1B4F72" : i === 1 ? "#166534" : "#92400e",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 16,
                  flexShrink: 0,
                }}>
                  {e.num}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6, color: "#0D1B2A" }}>{e.titre}</div>
                  <div style={{ fontSize: 14, color: "#555", lineHeight: 1.7 }}>{e.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section ROI / Tableau comparatif */}
        <section style={{ background: "#f8fafc", padding: "56px 24px" }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <h2 style={{ textAlign: "center", fontSize: 26, fontWeight: 700, marginBottom: 8 }}>
              Coût de la formation vs coût de la non-conformité
            </h2>
            <p style={{ textAlign: "center", color: "#666", marginBottom: 36, fontSize: 15 }}>
              La formation adaptée soutient la maîtrise des risques, sans garantir une conformité ou un résultat
            </p>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", background: "white", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <thead>
                  <tr style={{ background: "#0D1B2A", color: "white" }}>
                    <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 600 }}>Situation</th>
                    <th style={{ padding: "14px 16px", textAlign: "right", fontSize: 13, fontWeight: 600 }}>Coût formation</th>
                    <th style={{ padding: "14px 16px", textAlign: "right", fontSize: 13, fontWeight: 600 }}>Risque non-conformité</th>
                  </tr>
                </thead>
                <tbody>
                  {ROI_ROWS.map((row, i) => (
                    <tr
                      key={row.item}
                      style={{
                        background: row.classe === "risk" ? "#fff1f2" : i % 2 === 0 ? "#fff" : "#f9fafb",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      <td style={{ padding: "13px 16px", fontSize: 13, color: "#1e293b" }}>{row.item}</td>
                      <td style={{ padding: "13px 16px", fontSize: 13, textAlign: "right", color: row.cout === "—" ? "#94a3b8" : "#166534", fontWeight: row.cout !== "—" ? 600 : 400 }}>{row.cout}</td>
                      <td style={{ padding: "13px 16px", fontSize: 13, textAlign: "right", color: row.risque === "—" ? "#94a3b8" : "#b91c1c", fontWeight: row.risque !== "—" ? 600 : 400 }}>{row.risque}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ textAlign: "center", fontSize: 12, color: "#94a3b8", marginTop: 12 }}>
              * Amendes indicatives basées sur le Décret 15-247 et jurisprudence ANAC. Les incidents DGR peuvent engager la responsabilité pénale des dirigeants.
            </p>
          </div>
        </section>

        {/* Formulaire de contact */}
        <section id="contact" style={{ background: "#0D1B2A", padding: "64px 24px" }}>
          <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center", color: "white", marginBottom: 36 }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 10 }}>
              Demandez un devis pour votre entreprise
            </h2>
            <p style={{ opacity: 0.75, fontSize: 14, lineHeight: 1.6, marginBottom: 6 }}>
              Formation intra ou groupe — réponse sous 24h avec proposition commerciale et calendrier.
            </p>
            <p style={{ opacity: 0.55, fontSize: 12 }}>
              Facturation marchés publics · Pro forma disponible · Gré à gré Art. 49
            </p>
          </div>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <Suspense fallback={null}>
              <LeadForm sourcePage="/entreprises" />
            </Suspense>
          </div>
        </section>

        {/* Navigation bas de page */}
        <nav style={{ background: "#f1f5f9", padding: "20px 24px", textAlign: "center" }}>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", fontSize: 14 }}>
            <Link href="/formation-dgr-petrole-gaz" style={{ color: "#003087", textDecoration: "none" }}>DGR Pétrole &amp; Gaz</Link>
            <Link href="/formation-dgr-algerie" style={{ color: "#003087", textDecoration: "none" }}>Formation DGR Algérie</Link>
            <Link href="/" style={{ color: "#003087", textDecoration: "none" }}>Accueil</Link>
          </div>
        </nav>
      </main>
      <Footer />
      <WhatsAppSticky />
    </>
  );
}
