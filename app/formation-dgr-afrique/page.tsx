import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppSticky from "@/components/WhatsAppSticky";
import TrackedLink from "@/components/TrackedLink";

export const metadata: Metadata = {
  title: "Formation IATA DGR en Afrique — Centre CBTA Certifié pour toute l'Afrique",
  description:
    "KOST GROUP, 1er centre IATA CBTA Provider certifié d'Algérie, forme les professionnels du transport aérien dans toute l'Afrique : Maroc, Sénégal, Côte d'Ivoire, Cameroun, Gabon, Mali.",
  alternates: { canonical: "/formation-dgr-afrique" },
  keywords: [
    "formation IATA DGR Afrique",
    "formation marchandises dangereuses Afrique",
    "CBTA Afrique",
    "DGR Afrique francophone",
    "centre IATA Afrique",
  ],
  openGraph: {
    title: "Formation IATA DGR en Afrique — KOST GROUP",
    description:
      "1er centre IATA CBTA certifié d'Algérie. Formation DGR pour toute l'Afrique francophone et au-delà.",
    url: "https://dgr.kostacademy.com/formation-dgr-afrique",
  },
};

const PAYS = [
  { nom: "Algérie", slug: "formation-dgr-algerie", capital: "Alger", flag: "🇩🇿" },
  { nom: "Maroc", slug: "formation-dgr-maroc", capital: "Casablanca", flag: "🇲🇦" },
  { nom: "Sénégal", slug: "formation-dgr-senegal", capital: "Dakar", flag: "🇸🇳" },
  { nom: "Côte d'Ivoire", slug: "formation-dgr-cote-ivoire", capital: "Abidjan", flag: "🇨🇮" },
  { nom: "Cameroun", slug: "formation-dgr-cameroun", capital: "Douala", flag: "🇨🇲" },
  { nom: "Gabon", slug: "formation-dgr-afrique", capital: "Libreville", flag: "🇬🇦" },
  { nom: "Mali", slug: "formation-dgr-afrique", capital: "Bamako", flag: "🇲🇱" },
  { nom: "Tunisie", slug: "formation-dgr-afrique", capital: "Tunis", flag: "🇹🇳" },
  { nom: "Burkina Faso", slug: "formation-dgr-afrique", capital: "Ouagadougou", flag: "🇧🇫" },
];

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "KOST GROUP — Centre IATA CBTA",
  description:
    "Premier centre IATA CBTA Provider certifié d'Algérie, spécialisé dans la formation DGR (Dangerous Goods Regulations) pour toute l'Afrique.",
  url: "https://dgr.kostacademy.com",
  telephone: "+213542305383",
  address: {
    "@type": "PostalAddress",
    addressCountry: "DZ",
    addressLocality: "Alger",
    postalCode: "16024",
  },
  areaServed: ["DZ", "MA", "SN", "CI", "CM", "GA", "ML", "TN"],
};

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
        <section style={{ background: "linear-gradient(135deg, #003087 0%, #0052cc 100%)", color: "white", padding: "80px 24px", textAlign: "center" }}>
          <p style={{ fontSize: 14, letterSpacing: 2, opacity: 0.8, marginBottom: 12 }}>IATA CBTA PROVIDER CERTIFIÉ</p>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 700, margin: "0 0 16px" }}>
            Formation IATA DGR en Afrique
          </h1>
          <p style={{ fontSize: 18, opacity: 0.9, maxWidth: 600, margin: "0 auto 32px" }}>
            Le premier centre CBTA certifié d&apos;Algérie au service de toute l&apos;Afrique —
            formations CBTA adaptées aux tâches exercées, avec évaluation des compétences.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#pays" style={{ background: "white", color: "#003087", padding: "14px 28px", borderRadius: 8, fontWeight: 700, textDecoration: "none" }}>
              Choisir mon pays
            </a>
            <TrackedLink track="whatsapp" location="formation-dgr-afrique-top" href="https://wa.me/213542305383?text=Bonjour%2C%20je%20souhaite%20une%20formation%20DGR%20pour%20mon%20%C3%A9quipe%20en%20Afrique" target="_blank" rel="noopener noreferrer" style={{ background: "#25D366", color: "white", padding: "14px 28px", borderRadius: 8, fontWeight: 700, textDecoration: "none" }}>
              WhatsApp
            </TrackedLink>
          </div>
        </section>

        {/* Alerte réglementaire */}
        <section style={{ background: "#FFF8E1", borderLeft: "4px solid #F59E0B", padding: "20px 24px", maxWidth: 900, margin: "32px auto", borderRadius: 8 }}>
          <strong>Formation selon les responsabilités :</strong> Les fonctions réellement exercées déterminent les besoins de formation et d&apos;évaluation CBTA. Vérifiez les exigences de l&apos;employeur, de l&apos;opérateur et de l&apos;autorité compétente avant toute affectation.
        </section>

        {/* Pays couverts */}
        <section id="pays" style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 24px" }}>
          <h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
            Pays couverts
          </h2>
          <p style={{ textAlign: "center", color: "#666", marginBottom: 40 }}>
            Formations en centre ou intra-entreprise selon les disponibilités et les autorisations locales
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {PAYS.map((p) => (
              <Link key={p.nom} href={`/${p.slug}`} style={{ display: "block", background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: "24px 20px", textAlign: "center", textDecoration: "none", color: "inherit", transition: "box-shadow 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>{p.flag}</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#003087" }}>{p.nom}</div>
                <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{p.capital}</div>
                <div style={{ marginTop: 12, fontSize: 13, color: "#0052cc", fontWeight: 600 }}>
                  Voir formations →
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Pourquoi KOST */}
        <section style={{ background: "#f8fafc", padding: "60px 24px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <h2 style={{ textAlign: "center", fontSize: 28, fontWeight: 700, marginBottom: 40 }}>
              Pourquoi choisir KOST GROUP pour toute l&apos;Afrique ?
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
              {[
                { icon: "🏅", title: "Prestataire CBTA", text: "Statut de prestataire à vérifier sur le registre IATA ; reconnaissance locale à confirmer auprès des autorités et opérateurs concernés." },
                { icon: "🌍", title: "Formation intra en Afrique", text: "Déplacements des formateurs envisageables sur devis, sous réserve des autorisations locales et des conditions opérationnelles." },
                { icon: "💰", title: "Devis adapté à votre équipe", text: "Tarifs et frais de déplacement détaillés dans une offre, sans promesse de comparaison non documentée." },
                { icon: "📜", title: "Attestation selon évaluation", text: "La portée, la validité et l’acceptation des attestations dépendent des exigences de l’employeur, des opérateurs et des autorités compétentes." },
              ].map((r) => (
                <div key={r.title} style={{ background: "white", borderRadius: 12, padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{r.icon}</div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{r.title}</h3>
                  <p style={{ color: "#555", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: "#003087", color: "white", padding: "60px 24px", textAlign: "center" }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>
            Demandez un devis gratuit pour votre pays
          </h2>
          <p style={{ opacity: 0.9, marginBottom: 28 }}>
            Réponse sous 24h — sessions inter ou intra-entreprise disponibles dans toute l&apos;Afrique
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/#contact" style={{ background: "white", color: "#003087", padding: "14px 28px", borderRadius: 8, fontWeight: 700, textDecoration: "none" }}>
              Demander un devis
            </a>
            <TrackedLink track="whatsapp" location="formation-dgr-afrique-bottom" href="https://wa.me/213542305383?text=Bonjour%2C%20je%20souhaite%20une%20formation%20DGR%20pour%20mon%20%C3%A9quipe" target="_blank" rel="noopener noreferrer" style={{ background: "#25D366", color: "white", padding: "14px 28px", borderRadius: 8, fontWeight: 700, textDecoration: "none" }}>
              WhatsApp +213 542 30 53 83
            </TrackedLink>
          </div>
        </section>

        {/* Liens internes */}
        <nav style={{ background: "#f1f5f9", padding: "24px", textAlign: "center" }}>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", fontSize: 14 }}>
            {PAYS.filter(p => p.slug !== "formation-dgr-afrique").map(p => (
              <Link key={p.nom} href={`/${p.slug}`} style={{ color: "#003087", textDecoration: "none" }}>
                DGR {p.nom}
              </Link>
            ))}
            <Link href="/" style={{ color: "#003087", textDecoration: "none" }}>Accueil DGR</Link>
            <Link href="/iata-dangerous-goods-training-algeria" style={{ color: "#003087", textDecoration: "none" }}>English page</Link>
          </div>
        </nav>
      </main>
      <Footer />
      <WhatsAppSticky />
    </>
  );
}
