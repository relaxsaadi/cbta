import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppSticky from "@/components/WhatsAppSticky";
import LeadForm from "@/components/LeadForm";

export const metadata: Metadata = {
  title: "Formation IATA DGR Pétrole & Gaz — Marchandises Dangereuses Hydrocarbures | KOST GROUP",
  description:
    "Formation IATA DGR pour les entreprises pétrolières et gazières. Expédition par avion de produits pétroliers, gaz comprimés, matières corrosives et équipements chimiques. Centre CBTA certifié.",
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
      "Formation IATA DGR pour le secteur pétrolier et gazier : gaz comprimés (classe 2), liquides inflammables (classe 3), corrosifs (classe 8).",
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
  occupationalCredentialAwarded: "Certificat IATA DGR-CBTA",
};

const DGR_CLASSES = [
  { classe: "Classe 2", label: "Gaz comprimés, liquéfiés, dissous", exemples: "Bouteilles de gaz, LPG, propane, oxygène industriel", badge: "bg-orange" },
  { classe: "Classe 3", label: "Liquides inflammables", exemples: "Carburants, huiles, solvants pétroliers, kérosène", badge: "bg-red" },
  { classe: "Classe 8", label: "Matières corrosives", exemples: "Acides utilisés en forage, produits de traitement de puits", badge: "bg-purple" },
  { classe: "Classe 9", label: "Matières dangereuses diverses", exemples: "Équipements magnétisés, piles au lithium pour capteurs", badge: "bg-gray" },
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
            Expédiez vos produits pétroliers, gaz comprimés et équipements chimiques par avion en toute conformité OACI.
          </p>
          <p style={{ fontSize: 14, opacity: 0.7, marginBottom: 32 }}>
            Classes 2, 3, 8, 9 · CBTA Provider certifié · Algérie & Afrique
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#contact" style={{ background: "white", color: "#7c3800", padding: "14px 28px", borderRadius: 8, fontWeight: 700, textDecoration: "none" }}>
              Demander un devis
            </a>
            <a href="https://wa.me/213542305383?text=Bonjour%2C%20secteur%20p%C3%A9trolier%20-%20je%20souhaite%20former%20mon%20%C3%A9quipe%20DGR" target="_blank" rel="noopener noreferrer" style={{ background: "#25D366", color: "white", padding: "14px 28px", borderRadius: 8, fontWeight: 700, textDecoration: "none" }}>
              WhatsApp
            </a>
          </div>
        </section>

        {/* Classes DGR concernées */}
        <section style={{ maxWidth: 960, margin: "0 auto", padding: "60px 24px" }}>
          <h2 style={{ textAlign: "center", fontSize: 26, fontWeight: 700, marginBottom: 8 }}>
            Classes DGR concernant le secteur pétrolier & gazier
          </h2>
          <p style={{ textAlign: "center", color: "#666", marginBottom: 36 }}>
            Vos produits entrent dans ces catégories — leur expédition aérienne nécessite un personnel DGR certifié
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
              Qui doit être certifié dans une société pétrolière ?
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
              {[
                { poste: "Responsable logistique", cat: "DGR 7.1", desc: "Supervise et signe les documents de transport DGR." },
                { poste: "Agent expédition export", cat: "DGR 7.1", desc: "Prépare les envois de produits chimiques et équipements." },
                { poste: "Agent cargo en base aérienne", cat: "DGR 7.2", desc: "Manutentionne et stocke les envois DGR en escale." },
                { poste: "Acheteur / supply chain", cat: "DGR 7.1 sensibilisation", desc: "Doit connaître les restrictions DGR pour les commandes urgentes." },
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
            Pour les sociétés pétrolières avec des équipes sur des bases éloignées (Hassi Messaoud, Hassi R&apos;Mel, offshore), KOST GROUP propose des sessions intra-entreprise directement sur votre site d&apos;exploitation.
          </p>
          <div style={{ display: "inline-flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <div style={{ background: "#fff8f0", border: "1px solid #fcd34d", borderRadius: 8, padding: "12px 20px", fontSize: 14, fontWeight: 600 }}>🛢️ Hassi Messaoud</div>
            <div style={{ background: "#fff8f0", border: "1px solid #fcd34d", borderRadius: 8, padding: "12px 20px", fontSize: 14, fontWeight: 600 }}>⛽ Hassi R&apos;Mel</div>
            <div style={{ background: "#fff8f0", border: "1px solid #fcd34d", borderRadius: 8, padding: "12px 20px", fontSize: 14, fontWeight: 600 }}>🌍 Sites offshore Afrique</div>
            <div style={{ background: "#fff8f0", border: "1px solid #fcd34d", borderRadius: 8, padding: "12px 20px", fontSize: 14, fontWeight: 600 }}>🏢 Vos bureaux à Alger</div>
          </div>
        </section>

        {/* Sonatrach & TTA */}
        <section style={{ background: "#fff8f0", padding: "60px 24px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <p style={{ fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: "#7c3800", fontWeight: 700, marginBottom: 8 }}>Solution clé en main</p>
            <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 12 }}>
              Formation DGR pour Sonatrach et ses filiales
            </h2>
            <p style={{ color: "#555", lineHeight: 1.7, maxWidth: 720, marginBottom: 28 }}>
              Avec un plan d&apos;investissement de <strong>60 milliards USD sur 2026-2030</strong>, Sonatrach opère plus de 30 bases sahariennes (Hassi Messaoud, In Amenas, Hassi R&apos;Mel…) et sa filiale <strong>TTA (Tassili Travail Aérien)</strong> exploite une flotte de ~50 appareils pour relier ces sites. Chaque expédition aérienne de produits chimiques, d&apos;équipements de forage ou de gaz nécessite un personnel DGR certifié à bord et au sol.
            </p>

            {/* Catégories DGR concernées */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14, marginBottom: 28 }}>
              {[
                { cat: "DGR 7.1", titre: "Sensibilisation", desc: "Tous les agents Sonatrach qui touchent, commandent ou supervisent des envois de matières dangereuses." },
                { cat: "DGR 7.4", titre: "Expéditeurs", desc: "Logisticiens et agents supply-chain qui préparent et signent les déclarations DGR pour l'expédition des produits chimiques." },
                { cat: "DGR 7.9", titre: "Sécurité au sol", desc: "Agents TTA et personnels de piste qui manutentionnent les envois DGR dans les bases sahariennes." },
              ].map((item) => (
                <div key={item.cat} style={{ background: "white", borderRadius: 10, padding: "20px", border: "1px solid #fde68a" }}>
                  <span style={{ background: "#7c3800", color: "white", fontSize: 11, padding: "3px 10px", borderRadius: 10, fontWeight: 700 }}>{item.cat}</span>
                  <div style={{ fontWeight: 700, fontSize: 15, margin: "10px 0 6px" }}>{item.titre}</div>
                  <p style={{ fontSize: 13, color: "#666", lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Article 49 */}
            <div style={{ background: "#1c1c1c", color: "white", borderRadius: 12, padding: "24px 28px", marginBottom: 28 }}>
              <p style={{ fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", opacity: 0.6, marginBottom: 8 }}>Avantage réglementaire</p>
              <p style={{ fontSize: 15, lineHeight: 1.7, margin: 0 }}>
                En tant que <strong>seul prestataire IATA CBTA accrédité ANAC en Algérie</strong>, KOST bénéficie du régime de marché de gré à gré selon l&apos;<strong>Article 49 du Décret 15-247</strong> — aucun appel d&apos;offres requis pour Sonatrach et ses filiales. Commandez directement.
              </p>
            </div>

            <a
              href="https://wa.me/213542305383?text=Bonjour%2C%20je%20repr%C3%A9sente%20Sonatrach%20et%20souhaite%20obtenir%20votre%20dossier%20formation%20DGR%20%2B%20les%20modalit%C3%A9s%20gr%C3%A9%20%C3%A0%20gr%C3%A9"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-block", background: "#25D366", color: "white", padding: "14px 28px", borderRadius: 8, fontWeight: 700, textDecoration: "none", fontSize: 15 }}
            >
              Télécharger notre dossier Sonatrach via WhatsApp
            </a>
          </div>
        </section>

        {/* TotalEnergies Algérie */}
        <section style={{ maxWidth: 900, margin: "0 auto", padding: "60px 24px" }}>
          <p style={{ fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: "#7c3800", fontWeight: 700, marginBottom: 8 }}>5 entités concernées</p>
          <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 12 }}>
            Formation DGR pour TotalEnergies en Algérie
          </h2>
          <p style={{ color: "#555", lineHeight: 1.7, maxWidth: 720, marginBottom: 28 }}>
            TotalEnergies opère en Algérie via <strong>5 entités distinctes</strong>, chacune ayant ses propres obligations DGR. La <strong>nouvelle licence Ahara 2025</strong> (14 900 km² attribués) implique le déploiement de nouvelles équipes terrain avec une obligation de certification DGR immédiate avant toute expédition aérienne de matériaux ou d&apos;équipements.
          </p>

          {/* 5 entités */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 12, marginBottom: 28 }}>
            {[
              { nom: "TotalEnergies Lubrifiants", cat: "DGR 7.4", note: "Expédition de lubrifiants classés classe 3 & 8" },
              { nom: "TotalEnergies EP Algérie", cat: "DGR 7.1 + 7.9", note: "Équipes terrain exploration & production" },
              { nom: "TotalEnergies Exploration", cat: "DGR 7.9", note: "Sécurité au sol sites Ahara & Tin Fouye" },
              { nom: "TotalEnergies Trading", cat: "DGR 7.4", note: "Agents export et déclarations DGR" },
              { nom: "TotalEnergies Marketing", cat: "DGR 7.1", note: "Sensibilisation équipes commerciales" },
            ].map((e) => (
              <div key={e.nom} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "18px 16px" }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6, color: "#1c1c1c" }}>{e.nom}</div>
                <span style={{ background: "#003087", color: "white", fontSize: 10, padding: "2px 8px", borderRadius: 8, fontWeight: 700 }}>{e.cat}</span>
                <p style={{ fontSize: 12, color: "#888", lineHeight: 1.4, margin: "8px 0 0" }}>{e.note}</p>
              </div>
            ))}
          </div>

          {/* Licence Ahara + Sequana */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16, marginBottom: 28 }}>
            <div style={{ background: "#fff8f0", border: "1px solid #fcd34d", borderRadius: 10, padding: "20px 24px" }}>
              <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Licence Ahara 2025 — urgence DGR</p>
              <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6, margin: 0 }}>
                Le bloc Ahara (14 900 km²) nécessite des rotations aériennes régulières d&apos;équipements et de matériaux. Sans personnel DGR certifié sur place, ces expéditions sont bloquées. KOST peut déployer une session intra sur votre base opérationnelle sous 3 semaines.
              </p>
            </div>
            <div style={{ background: "#f0f7ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "20px 24px" }}>
              <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Référençable sur Sequana</p>
              <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6, margin: 0 }}>
                Le portail fournisseurs TotalEnergies (Sequana) exige un référencement préalable. KOST GROUP est référençable sur Sequana — nous fournissons tous les documents de conformité (accréditation IATA, attestation ANAC) nécessaires à votre processus achat.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a
              href="https://wa.me/213542305383?text=Bonjour%2C%20TotalEnergies%20Alg%C3%A9rie%20-%20je%20souhaite%20un%20devis%20formation%20DGR%20pour%20nos%20%C3%A9quipes%20et%20information%20sur%20votre%20r%C3%A9f%C3%A9rencement%20Sequana"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-block", background: "#25D366", color: "white", padding: "14px 28px", borderRadius: 8, fontWeight: 700, textDecoration: "none", fontSize: 15 }}
            >
              Contacter KOST pour TotalEnergies
            </a>
            <a
              href="#contact"
              style={{ display: "inline-block", background: "#7c3800", color: "white", padding: "14px 28px", borderRadius: 8, fontWeight: 700, textDecoration: "none", fontSize: 15 }}
            >
              Demander un devis
            </a>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px 60px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 28, textAlign: "center" }}>FAQ — DGR Pétrole & Gaz</h2>
          {[
            { q: "Sonatrach, TotalEnergies, Eni — leurs exigences DGR sont-elles couvertes ?", a: "Oui. La formation DGR 7.1 KOST est conforme IATA DGR dernière édition, reconnue par toutes les majors pétrolières et les compagnies aériennes cargo (Air Algérie, Air France Cargo, etc.)." },
            { q: "Peut-on former des agents sur un site de production éloigné ?", a: "Oui. KOST GROUP propose des formations intra sur site dans les bassins pétroliers algériens (Hassi Messaoud, In Amenas, etc.) et dans tout pays africain à la demande." },
            { q: "Quels produits pétroliers sont réglementés DGR par avion ?", a: "Tout produit inflammable (classe 3), gazeux comprimé (classe 2), corrosif (classe 8) ou chimique de forage est soumis aux réglementations IATA DGR. La liste précise est dans le Dangerous Goods Regulations (DGR) IATA, Section 3." },
            { q: "Comment Sonatrach peut-elle commander directement sans appel d'offres ?", a: "En vertu de l'Article 49 du Décret 15-247, un prestataire disposant d'une position unique ou d'une accréditation réglementaire exclusive peut être sollicité par gré à gré, sans procédure d'appel d'offres. KOST étant le seul centre IATA CBTA accrédité ANAC en Algérie, Sonatrach et ses filiales (TTA, etc.) peuvent nous sélectionner directement pour leurs formations DGR." },
            { q: "TotalEnergies utilise Sequana — êtes-vous référençable ?", a: "Oui. KOST GROUP est référençable sur Sequana, le portail fournisseurs de TotalEnergies. Nous fournissons l'ensemble des documents requis : accréditation IATA CBTA, attestation ANAC, RIB, extrait de registre de commerce, et fiches de conformité HSE. Contactez-nous pour initier le processus de référencement." },
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
            <p style={{ opacity: 0.8, fontSize: 14 }}>Formation DGR pétrolière inter ou intra-entreprise — réponse sous 24h.</p>
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
