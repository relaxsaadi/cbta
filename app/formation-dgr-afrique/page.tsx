import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppSticky from "@/components/WhatsAppSticky";
import TrackedLink from "@/components/TrackedLink";

export const metadata: Metadata = {
  title: "Formation IATA DGR Afrique — KOST GROUP Algérie",
  description:
    "KOST GROUP forme les équipes du transport aérien en Afrique francophone (Maroc, Sénégal, Côte d'Ivoire, Cameroun, Gabon) aux formations DGR, méthode CBTA.",
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
      "Formation IATA DGR pour toute l'Afrique francophone et au-delà, méthode CBTA.",
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
  name: "KOST GROUP — Formation IATA DGR",
  description:
    "Centre de formation DGR (Dangerous Goods Regulations) basé en Algérie, méthode CBTA, pour toute l'Afrique.",
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
          <p style={{ fontSize: 14, letterSpacing: 2, opacity: 0.8, marginBottom: 12 }}>MÉTHODE CBTA</p>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 700, margin: "0 0 16px" }}>
            Formation IATA DGR en Afrique
          </h1>
          <p style={{ fontSize: 18, opacity: 0.9, maxWidth: 600, margin: "0 auto 32px" }}>
            Un centre basé en Algérie, au service de toute l&apos;Afrique —
            formations DGR, méthode CBTA.
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
          <strong>⚠️ Obligation OACI — Annexe 18 :</strong> Tout personnel impliqué dans le transport aérien de marchandises dangereuses doit être formé et certifié avant sa prise de poste. Sans certification IATA DGR valide, l&apos;accès au cargo aérien est interdit.
        </section>

        {/* Pays couverts */}
        <section id="pays" style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 24px" }}>
          <h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
            Pays couverts
          </h2>
          <p style={{ textAlign: "center", color: "#666", marginBottom: 40 }}>
            Formation inter-entreprises ou intra-entreprise — nous nous déplaçons dans toute l&apos;Afrique
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
                { icon: "🏅", title: "Formation méthode CBTA en Algérie", text: "Formation DGR dispensée depuis l'Algérie, selon la méthode CBTA." },
                { icon: "🌍", title: "Formation intra en Afrique", text: "Nos formateurs se déplacent dans votre pays. Vous formez votre équipe sans déplacements coûteux vers l'Europe." },
                { icon: "💰", title: "50 % moins cher que Paris", text: "Tarifs adaptés au marché africain — économisez sur les frais de déplacement, visa et hébergement." },
                { icon: "📜", title: "Certificat DGR-CBTA", text: "Certificat DGR-CBTA valable 24 mois." },
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
