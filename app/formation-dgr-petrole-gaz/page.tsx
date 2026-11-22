import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppSticky from "@/components/WhatsAppSticky";
import LeadForm from "@/components/LeadForm";
import TrackedLink from "@/components/TrackedLink";

export const metadata: Metadata = {
  title: "Formation IATA DGR Pétrole & Gaz — Marchandises Dangereuses Hydrocarbures",
  description:
    "Formation DGR pour entreprises pétrolières et gazières. Identifier les tâches CBTA réellement exercées et les règles applicables aux produits avant de définir un parcours.",
  alternates: { canonical: "/formation-dgr-petrole-gaz" },
  keywords: [
    "formation DGR pétrole gaz",
    "IATA DGR hydrocarbures",
    "formation marchandises dangereuses oil gas",
    "DGR classe 3 flammable",
    "certification DGR secteur pétrolier Algérie",
  ],
  openGraph: {
    title: "Formation DGR Pétrole & Gaz — KOST GROUP",
    description:
      "Formation DGR pour les opérations aériennes du secteur pétrolier et gazier : classification et formation à déterminer selon les marchandises et tâches effectives.",
    url: "https://dgr.kostacademy.com/formation-dgr-petrole-gaz",
  },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Formation IATA DGR — Secteur Pétrole & Gaz",
  description:
    "Formation DGR spécialisée pour les entreprises du secteur pétrolier et gazier : expédition de gaz comprimés, liquides inflammables, matières corrosives et équipements de forage par voie aérienne.",
  provider: {
    "@type": "EducationalOrganization",
    name: "KOST GROUP",
    url: "https://dgr.kostacademy.com",
  },
  courseCode: "DGR-PETROLE-GAZ",
  availableLanguage: "fr",
};

const DGR_CLASSES = [
  { classe: "Classe 2", label: "Gaz comprimés, liquéfiés, dissous", exemples: "Exemples à classifier individuellement : gaz industriels et récipients sous pression", badge: "bg-orange" },
  { classe: "Classe 3", label: "Liquides inflammables", exemples: "Exemples à vérifier : certains carburants et solvants", badge: "bg-red" },
  { classe: "Classe 8", label: "Matières corrosives", exemples: "Exemples à vérifier : certains acides et produits de traitement", badge: "bg-purple" },
  { classe: "Classe 9", label: "Matières dangereuses diverses", exemples: "Exemples à vérifier : certains équipements et batteries", badge: "bg-gray" },
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
        <section style={{ background: "linear-gradient(135deg, #1c1c1c 0%, #3d1a00 50%, #7c3800 100%)", color: "white", padding: "80px 24px", textAlign: "center" }}>
          <p style={{ fontSize: 13, letterSpacing: 2, opacity: 0.7, marginBottom: 12, textTransform: "uppercase" }}>Secteur Pétrole, Gaz & Énergie</p>
          <h1 style={{ fontSize: "clamp(26px, 4.5vw, 44px)", fontWeight: 700, margin: "0 0 16px", lineHeight: 1.2 }}>
            Formation IATA DGR<br />Pétrole & Gaz
          </h1>
          <p style={{ fontSize: 17, opacity: 0.9, maxWidth: 600, margin: "0 auto 12px" }}>
            Préparez vos équipes à analyser les exigences de transport aérien applicables à leurs marchandises et activités.
          </p>
          <p style={{ fontSize: 14, opacity: 0.7, marginBottom: 32 }}>
            Classes et obligations à vérifier · Formation basée sur les tâches · Modalités sur demande
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#contact" style={{ background: "white", color: "#7c3800", padding: "14px 28px", borderRadius: 8, fontWeight: 700, textDecoration: "none" }}>
              Demander un devis
            </a>
            <TrackedLink track="whatsapp" location="formation-dgr-petrole-gaz-top" href="https://wa.me/213542305383?text=Bonjour%2C%20secteur%20p%C3%A9trolier%20-%20je%20souhaite%20former%20mon%20%C3%A9quipe%20DGR" target="_blank" rel="noopener noreferrer" style={{ background: "#25D366", color: "white", padding: "14px 28px", borderRadius: 8, fontWeight: 700, textDecoration: "none" }}>
              WhatsApp
            </TrackedLink>
          </div>
        </section>

        {/* Classes DGR concernées */}
        <section style={{ maxWidth: 960, margin: "0 auto", padding: "60px 24px" }}>
          <h2 style={{ textAlign: "center", fontSize: 26, fontWeight: 700, marginBottom: 8 }}>
            Classes DGR concernant le secteur pétrolier & gazier
          </h2>
          <p style={{ textAlign: "center", color: "#666", marginBottom: 36 }}>
            Ces exemples ne valent pas classification. Vérifiez chaque substance, article et exigence dans la réglementation applicable.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 16 }}>
            {DGR_CLASSES.map((c) => (
              <div key={c.classe} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "24px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ fontWeight: 800, fontSize: 18, color: "#7c3800", marginBottom: 6 }}>{c.classe}</div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>{c.label}</div>
                <div style={{ fontSize: 12, color: "#888", lineHeight: 1.5 }}>{c.exemples}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Qui doit se former */}
        <section style={{ background: "#fff8f0", padding: "50px 24px" }}>
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            <h2 style={{ textAlign: "center", fontSize: 24, fontWeight: 700, marginBottom: 28 }}>
              Comment définir les compétences des équipes pétrolières ?
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
              {[
                { poste: "Responsable logistique", cat: "À déterminer", desc: "Décrire les responsabilités effectives en expédition, contrôle et documentation." },
                { poste: "Agent expédition export", cat: "À déterminer", desc: "Identifier les tâches réellement réalisées avant de choisir une fonction CBTA." },
                { poste: "Agent cargo en base aérienne", cat: "À déterminer", desc: "Évaluer les opérations réellement effectuées, le périmètre et le niveau de compétence." },
                { poste: "Acheteur / supply chain", cat: "À déterminer", desc: "Définir les décisions opérationnelles liées aux marchandises avant d'établir un plan de formation." },
              ].map((p) => (
                <div key={p.poste} style={{ background: "white", borderRadius: 10, padding: "18px", border: "1px solid #fde68a" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{p.poste}</div>
                  <span style={{ background: "#7c3800", color: "white", fontSize: 11, padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>{p.cat}</span>
                  <p style={{ fontSize: 12, color: "#666", lineHeight: 1.4, margin: "8px 0 0" }}>{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Avantage intra */}
        <section style={{ maxWidth: 860, margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Formation intra-entreprise sur votre site</h2>
          <p style={{ color: "#555", maxWidth: 600, margin: "0 auto 32px", lineHeight: 1.7 }}>
            Une session sur votre site peut être étudiée en fonction des tâches à couvrir, des moyens disponibles, des règles HSE et des autorisations applicables. La faisabilité sera confirmée avant toute réservation.
          </p>
          <div style={{ display: "inline-flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <div style={{ background: "#fff8f0", border: "1px solid #fcd34d", borderRadius: 8, padding: "12px 20px", fontSize: 14, fontWeight: 600 }}>🛢️ Hassi Messaoud</div>
            <div style={{ background: "#fff8f0", border: "1px solid #fcd34d", borderRadius: 8, padding: "12px 20px", fontSize: 14, fontWeight: 600 }}>⛽ Hassi R&apos;Mel</div>
            <div style={{ background: "#fff8f0", border: "1px solid #fcd34d", borderRadius: 8, padding: "12px 20px", fontSize: 14, fontWeight: 600 }}>🌍 Déplacement sous réserve de faisabilité</div>
            <div style={{ background: "#fff8f0", border: "1px solid #fcd34d", borderRadius: 8, padding: "12px 20px", fontSize: 14, fontWeight: 600 }}>🏢 Vos bureaux à Alger</div>
          </div>
        </section>

        {/* Programmes industriels sur mesure — aucune relation client présumée */}
        <section style={{ background: "#fff8f0", padding: "60px 24px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <p style={{ fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: "#7c3800", fontWeight: 700, marginBottom: 8 }}>Programmes sur mesure</p>
            <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 12 }}>
              Formation DGR pour les équipes de l&apos;industrie énergétique
            </h2>
            <p style={{ color: "#555", lineHeight: 1.7, maxWidth: 720, marginBottom: 24 }}>
              Pour les opérateurs, prestataires et sociétés de services pétroliers, le programme est défini après une analyse des tâches réellement exercées, des marchandises concernées et des exigences applicables. Aucun code de fonction CBTA ne peut être attribué automatiquement sur la base d&apos;un employeur ou d&apos;un intitulé de poste.
            </p>
            <p style={{ color: "#555", lineHeight: 1.7, maxWidth: 720, marginBottom: 28 }}>
              Les documents relatifs aux qualifications du prestataire, les conditions de déplacement et les modalités commerciales sont communiqués sur demande et vérifiés avant tout engagement. Cette page ne constitue ni une preuve de partenariat avec une entreprise nommée, ni une validation réglementaire d&apos;un programme.
            </p>
            <a href="#contact" style={{ display: "inline-block", background: "#7c3800", color: "white", padding: "14px 28px", borderRadius: 8, fontWeight: 700, textDecoration: "none", fontSize: 15 }}>
              Demander une proposition adaptée
            </a>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px 60px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 28, textAlign: "center" }}>FAQ — DGR Pétrole & Gaz</h2>
          {[
            { q: "Votre programme convient-il à une entreprise pétrolière précise ?", a: "Le périmètre de formation est à déterminer après analyse des tâches et des marchandises de l'entreprise. Nous ne présumons pas de la reconnaissance d'un cours par un donneur d'ordre ou une compagnie aérienne." },
            { q: "Une formation sur un site industriel éloigné est-elle possible ?", a: "La faisabilité dépend des moyens sur site, des conditions d'accès et HSE et des autorisations requises. Une proposition écrite confirmera le lieu, les dates et le périmètre." },
            { q: "Quels produits pétroliers relèvent des règles DGR ?", a: "La classification et les conditions de transport dépendent des caractéristiques exactes de la substance ou de l'article. Les règles doivent être contrôlées dans la DGR 67e édition 2026, les mises à jour et les variations applicables." },
            { q: "Comment vérifier les qualifications du prestataire ?", a: "Demandez les documents d'autorisation et de qualification à jour, puis vérifiez leur portée et leurs conditions d'application avant de conclure un contrat." },
            { q: "Pouvez-vous répondre à un processus achats spécifique ?", a: "Nous pouvons examiner avec le service achats les pièces et procédures requises. Aucun référencement fournisseur n'est présumé acquis." },
          ].map((faq) => (
            <details key={faq.q} style={{ borderBottom: "1px solid #e5e7eb", padding: "16px 0" }}>
              <summary style={{ fontWeight: 600, cursor: "pointer", fontSize: 15, color: "#7c3800" }}>{faq.q}</summary>
              <p style={{ color: "#555", lineHeight: 1.6, marginTop: 10, marginBottom: 0, fontSize: 14 }}>{faq.a}</p>
            </details>
          ))}
        </section>

        {/* Formulaire */}
        <section id="contact" style={{ background: "#1c1c1c", padding: "60px 24px" }}>
          <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center", color: "white", marginBottom: 32 }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Demandez un devis pour votre société</h2>
            <p style={{ opacity: 0.8, fontSize: 14 }}>Formation DGR pétrolière inter ou intra-entreprise — modalités sur devis.</p>
          </div>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <Suspense fallback={null}>
              <LeadForm sourcePage="/formation-dgr-petrole-gaz" />
            </Suspense>
          </div>
        </section>

        {/* Liens internes */}
        <nav style={{ background: "#f1f5f9", padding: "20px 24px", textAlign: "center" }}>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", fontSize: 14 }}>
            <Link href="/formation-dgr-transitaires" style={{ color: "#003087", textDecoration: "none" }}>DGR Transitaires</Link>
            <Link href="/formation-dgr-pharmacie" style={{ color: "#003087", textDecoration: "none" }}>DGR Pharmacie</Link>
            <Link href="/formation-dgr-algerie" style={{ color: "#003087", textDecoration: "none" }}>Formation DGR Algérie</Link>
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
