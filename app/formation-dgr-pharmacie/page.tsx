import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppSticky from "@/components/WhatsAppSticky";
import LeadForm from "@/components/LeadForm";
import TrackedLink from "@/components/TrackedLink";

export const metadata: Metadata = {
  title: "Formation IATA DGR Pharmacie & Biomédical — Glace Sèche, UN 3373",
  description:
    "Formation IATA DGR pour le secteur pharmaceutique et biomédical : glace sèche (PI 954), substances biologiques UN 3373, matières infectieuses UN 2814/2900. Méthode CBTA, en Algérie.",
  alternates: { canonical: "/formation-dgr-pharmacie" },
  keywords: [
    "formation DGR pharmacie",
    "IATA DGR UN 3373 biomédical",
    "formation glace sèche avion",
    "DGR matières infectieuses",
    "certification DGR secteur pharmaceutique Algérie",
  ],
  openGraph: {
    title: "Formation DGR Pharmacie & Biomédical — KOST GROUP",
    description:
      "Formation IATA DGR spécialisée pharma : glace sèche (PI 954), UN 3373, UN 2814. Compliance cold chain aérienne.",
    url: "https://dgr.kostacademy.com/formation-dgr-pharmacie",
  },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Formation IATA DGR — Secteur Pharmaceutique & Biomédical",
  description:
    "Formation DGR spécialisée pour le transport aérien de produits pharmaceutiques : glace sèche, substances biologiques catégorie B (UN 3373), matières infectieuses catégorie A (UN 2814/2900).",
  provider: {
    "@type": "EducationalOrganization",
    name: "KOST GROUP",
    url: "https://dgr.kostacademy.com",
  },
  courseCode: "DGR-PHARMA",
  availableLanguage: "fr",
  occupationalCredentialAwarded: "Certificat IATA DGR-CBTA",
};

const PRODUITS = [
  {
    code: "UN 1845",
    label: "Glace sèche (dry ice)",
    pi: "Instruction PI 954",
    desc: "Utilisée pour le transport de vaccins, médicaments thermosensibles, produits biologiques. Réglementation stricte sur les quantités et l'emballage.",
    color: "#0052cc",
  },
  {
    code: "UN 3373",
    label: "Substances biologiques Cat. B",
    pi: "Instruction PI 650",
    desc: "Échantillons diagnostiques, cultures cellulaires, sang, tissus non infectieux. Emballage P650, étiquette UN 3373 obligatoire.",
    color: "#00875a",
  },
  {
    code: "UN 2814 / 2900",
    label: "Matières infectieuses Cat. A",
    pi: "Instruction PI 602",
    desc: "Agents pathogènes présentant un risque grave pour la santé humaine (Cat. A) ou animale (Cat. B/2900). Exigences strictes IATA DGR.",
    color: "#de350b",
  },
  {
    code: "Classe 2.2",
    label: "Azote liquide",
    pi: "Instruction PI 202",
    desc: "Transport d'échantillons biologiques conservés à ultra-basse température. Réglementé comme gaz non inflammable non toxique.",
    color: "#6554c0",
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
        <section style={{ background: "linear-gradient(135deg, #003d1a 0%, #00875a 70%, #00a86b 100%)", color: "white", padding: "80px 24px", textAlign: "center" }}>
          <p style={{ fontSize: 13, letterSpacing: 2, opacity: 0.7, marginBottom: 12, textTransform: "uppercase" }}>Secteur Pharmaceutique & Biomédical</p>
          <h1 style={{ fontSize: "clamp(26px, 4.5vw, 44px)", fontWeight: 700, margin: "0 0 16px", lineHeight: 1.2 }}>
            Formation IATA DGR<br />Pharmacie & Biomédical
          </h1>
          <p style={{ fontSize: 17, opacity: 0.9, maxWidth: 600, margin: "0 auto 12px" }}>
            Glace sèche · UN 3373 · UN 2814 · Azote liquide — Certifiez vos équipes pour l&apos;expédition aérienne de produits pharmaceutiques et biologiques.
          </p>
          <p style={{ fontSize: 14, opacity: 0.7, marginBottom: 32 }}>
            Méthode CBTA · Conformité IATA DGR dernière édition · Algérie & Afrique
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#contact" style={{ background: "white", color: "#003d1a", padding: "14px 28px", borderRadius: 8, fontWeight: 700, textDecoration: "none" }}>
              Demander un devis
            </a>
            <TrackedLink track="whatsapp" location="formation-dgr-pharmacie" href="https://wa.me/213542305383?text=Bonjour%2C%20secteur%20pharmaceutique%20-%20je%20souhaite%20former%20mon%20%C3%A9quipe%20DGR" target="_blank" rel="noopener noreferrer" style={{ background: "#25D366", color: "white", padding: "14px 28px", borderRadius: 8, fontWeight: 700, textDecoration: "none" }}>
              WhatsApp
            </TrackedLink>
          </div>
        </section>

        {/* Produits concernés */}
        <section style={{ maxWidth: 1000, margin: "0 auto", padding: "60px 24px" }}>
          <h2 style={{ textAlign: "center", fontSize: 26, fontWeight: 700, marginBottom: 8 }}>
            Produits pharmaceutiques réglementés DGR
          </h2>
          <p style={{ textAlign: "center", color: "#666", marginBottom: 36 }}>
            Ces produits nécessitent une formation DGR obligatoire pour l&apos;expédition aérienne
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
            {PRODUITS.map((p) => (
              <div key={p.code} style={{ background: "white", border: `2px solid ${p.color}`, borderRadius: 12, padding: "24px 20px" }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: p.color, marginBottom: 4 }}>{p.code}</div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{p.label}</div>
                <span style={{ background: p.color, color: "white", fontSize: 10, padding: "2px 8px", borderRadius: 10, fontWeight: 700 }}>{p.pi}</span>
                <p style={{ fontSize: 12, color: "#666", lineHeight: 1.5, margin: "10px 0 0" }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Qui doit se former */}
        <section style={{ background: "#f0fff4", padding: "50px 24px" }}>
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            <h2 style={{ textAlign: "center", fontSize: 24, fontWeight: 700, marginBottom: 28 }}>
              Qui doit être certifié dans une entreprise pharmaceutique ?
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
              {[
                { poste: "Responsable supply chain pharma", cat: "DGR 7.1", desc: "Valide et signe tous les envois DGR de l'entreprise." },
                { poste: "Agent export laboratoire", cat: "DGR 7.1", desc: "Prépare les envois d'échantillons et produits biologiques." },
                { poste: "Coursier biomédical", cat: "DGR 7.1 / 7.2", desc: "Transport d'échantillons diagnostiques (UN 3373) au quotidien." },
                { poste: "Responsable quality cold chain", cat: "DGR 7.1 sensibilisation", desc: "Doit connaître les exigences d'emballage et de documentation." },
              ].map((p) => (
                <div key={p.poste} style={{ background: "white", borderRadius: 10, padding: "18px", border: "1px solid #a7f3d0" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{p.poste}</div>
                  <span style={{ background: "#00875a", color: "white", fontSize: 11, padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>{p.cat}</span>
                  <p style={{ fontSize: 12, color: "#666", lineHeight: 1.4, margin: "8px 0 0" }}>{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Erreurs fréquentes */}
        <section style={{ maxWidth: 860, margin: "0 auto", padding: "60px 24px" }}>
          <h2 style={{ textAlign: "center", fontSize: 22, fontWeight: 700, marginBottom: 28 }}>
            Erreurs fréquentes en pharma/biomédical
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { e: "Glace sèche non déclarée", s: "La glace sèche est réglementée DGR dès qu'elle est utilisée comme réfrigérant dans un envoi. Son omission entraîne le refus de l'envoi par la compagnie aérienne." },
              { e: "UN 3373 sans emballage P650", s: "L'emballage P650 est obligatoire pour tous les échantillons biologiques catégorie B. Un simple emballage «biohazard» commercial n'est pas conforme IATA." },
              { e: "Déclaration d'expéditeur absente", s: "Toute expédition DGR doit être accompagnée d'une Shipper's Declaration for Dangerous Goods (SDG) correctement remplie et signée par un agent certifié 7.1." },
            ].map((item) => (
              <div key={item.e} style={{ display: "flex", gap: 16, background: "#fff5f5", borderRadius: 10, padding: "16px 20px", border: "1px solid #fecaca" }}>
                <div style={{ flexShrink: 0, fontWeight: 800, color: "#dc2626", fontSize: 18 }}>✗</div>
                <div>
                  <div style={{ fontWeight: 700, color: "#dc2626", marginBottom: 4 }}>{item.e}</div>
                  <div style={{ fontSize: 13, color: "#555", lineHeight: 1.5 }}>{item.s}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px 60px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 28, textAlign: "center" }}>FAQ — DGR Pharmacie</h2>
          {[
            { q: "La formation DGR est-elle obligatoire pour envoyer des médicaments par avion ?", a: "Oui, si les médicaments entrent dans la classification DGR (inflammables, toxiques, biologiques, etc.). Tout expéditeur doit avoir un agent certifié DGR 7.1 qui prépare et signe l'envoi." },
            { q: "Comment expédier des vaccins thermosensibles par avion ?", a: "Les vaccins conservés sur glace sèche sont classés DGR. L'expéditeur doit être certifié 7.1, utiliser l'emballage réglementaire, et remplir une Shipper's Declaration (SDG). La formation couvre ces procédures." },
            { q: "Les échantillons de sang ou de tissus nécessitent-ils une certification DGR ?", a: "Oui. Les échantillons biologiques catégorie B sont classés UN 3373 — expédition soumise à l'instruction d'emballage P650 et à une Shipper's Declaration. Une formation DGR 7.1 est requise." },
            { q: "Peut-on former les équipes dans les locaux d'un laboratoire pharmaceutique ?", a: "Oui, KOST GROUP propose des formations intra-entreprise dans vos locaux. C'est souvent plus efficace pour contextualiser la formation à vos produits spécifiques (catalogue DGR de votre labo)." },
          ].map((faq) => (
            <details key={faq.q} style={{ borderBottom: "1px solid #e5e7eb", padding: "16px 0" }}>
              <summary style={{ fontWeight: 600, cursor: "pointer", fontSize: 15, color: "#00875a" }}>{faq.q}</summary>
              <p style={{ color: "#555", lineHeight: 1.6, marginTop: 10, marginBottom: 0, fontSize: 14 }}>{faq.a}</p>
            </details>
          ))}
        </section>

        {/* Formulaire */}
        <section id="contact" style={{ background: "#003d1a", padding: "60px 24px" }}>
          <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center", color: "white", marginBottom: 32 }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Devis gratuit pour votre laboratoire</h2>
            <p style={{ opacity: 0.8, fontSize: 14 }}>Précisez vos produits (glace sèche, UN 3373…) — nous adaptons la formation à votre activité.</p>
          </div>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <Suspense fallback={null}>
              <LeadForm sourcePage="/formation-dgr-pharmacie" />
            </Suspense>
          </div>
        </section>

        {/* Liens internes */}
        <nav style={{ background: "#f1f5f9", padding: "20px 24px", textAlign: "center" }}>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", fontSize: 14 }}>
            <Link href="/formation-dgr-transitaires" style={{ color: "#003087", textDecoration: "none" }}>DGR Transitaires</Link>
            <Link href="/formation-dgr-petrole-gaz" style={{ color: "#003087", textDecoration: "none" }}>DGR Pétrole & Gaz</Link>
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
