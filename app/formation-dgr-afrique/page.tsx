import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppSticky from "@/components/WhatsAppSticky";
import TrackedLink from "@/components/TrackedLink";

export const metadata: Metadata = {
  title: "Formation DGR / CBTA en Afrique — Périmètre par Fonction",
  description:
    "Parcours DGR / CBTA en Afrique. Les fonctions 7.1 à 7.10 sont déterminées à partir des tâches réelles, des sources applicables et du circuit de revue requis.",
  alternates: { canonical: "/formation-dgr-afrique" },
  keywords: [
    "formation DGR Afrique",
    "formation marchandises dangereuses Afrique",
    "CBTA Afrique",
    "DGR Afrique francophone",
    "formation fret aérien Afrique",
  ],
  openGraph: {
    title: "Formation DGR / CBTA en Afrique — KOST GROUP",
    description:
      "Approche DGR / CBTA fondée sur l'analyse des tâches et les sources applicables, sans attribution automatique d'une fonction selon le poste.",
    url: "https://dgr.kostacademy.com/formation-dgr-afrique",
  },
};

const PAYS = [
  { nom: "Algérie", slug: "formation-dgr-algerie", capital: "Alger", flag: "🇩🇿" },
  { nom: "Maroc", slug: "formation-dgr-maroc", capital: "Casablanca", flag: "🇲🇦" },
  { nom: "Sénégal", slug: "formation-dgr-senegal", capital: "Dakar", flag: "🇸🇳" },
  { nom: "Côte d'Ivoire", slug: "formation-dgr-cote-ivoire", capital: "Abidjan", flag: "🇨🇮" },
  { nom: "Cameroun", slug: "formation-dgr-cameroun", capital: "Douala", flag: "🇨🇲" },
];

export default function Page() {
  return (
    <>
      <Navbar />
      <main style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif" }}>
        <section style={{ background: "linear-gradient(135deg, #003087 0%, #0052cc 100%)", color: "white", padding: "80px 24px", textAlign: "center" }}>
          <p style={{ fontSize: 14, letterSpacing: 2, opacity: 0.8, marginBottom: 12 }}>DGR / CBTA · ANALYSE DES TÂCHES</p>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 700, margin: "0 0 16px" }}>
            Formation DGR / CBTA en Afrique
          </h1>
          <p style={{ fontSize: 18, opacity: 0.9, maxWidth: 720, margin: "0 auto 32px" }}>
            Chaque fonction 7.1 à 7.10 est étudiée séparément à partir des tâches réellement exercées, des sources courantes applicables et du circuit de revue requis.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#pays" style={{ background: "white", color: "#003087", padding: "14px 28px", borderRadius: 8, fontWeight: 700, textDecoration: "none" }}>
              Voir les pages pays
            </a>
            <TrackedLink track="whatsapp" location="formation-dgr-afrique-top" href="https://wa.me/213542305383?text=Bonjour%2C%20je%20souhaite%20des%20informations%20sur%20une%20formation%20DGR%20%2F%20CBTA" target="_blank" rel="noopener noreferrer" style={{ background: "#25D366", color: "white", padding: "14px 28px", borderRadius: 8, fontWeight: 700, textDecoration: "none" }}>
              WhatsApp
            </TrackedLink>
          </div>
        </section>

        <section style={{ background: "#FFF8E1", borderLeft: "4px solid #F59E0B", padding: "20px 24px", maxWidth: 900, margin: "32px auto", borderRadius: 8 }}>
          <strong>⚠️ Vérification réglementaire requise :</strong> les obligations de formation, de recyclage, de certification et de reconnaissance varient selon les règles et exigences applicables. Elles doivent être confirmées à partir des sources faisant autorité en vigueur avant de présenter un parcours comme obligatoire, reconnu ou approuvé.
        </section>

        <section id="pays" style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 24px" }}>
          <h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Pages pays</h2>
          <p style={{ textAlign: "center", color: "#666", marginBottom: 40 }}>
            Les modalités de formation sont confirmées après analyse du périmètre et des contraintes opérationnelles.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {PAYS.map((p) => (
              <Link key={p.nom} href={`/${p.slug}`} style={{ display: "block", background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: "24px 20px", textAlign: "center", textDecoration: "none", color: "inherit", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>{p.flag}</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#003087" }}>{p.nom}</div>
                <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{p.capital}</div>
                <div style={{ marginTop: 12, fontSize: 13, color: "#0052cc", fontWeight: 600 }}>Voir le cadrage →</div>
              </Link>
            ))}
          </div>
        </section>

        <section style={{ background: "#f8fafc", padding: "60px 24px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <h2 style={{ textAlign: "center", fontSize: 28, fontWeight: 700, marginBottom: 40 }}>Principes de cadrage</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
              {[
                { title: "Tâches avant fonction", text: "Aucun intitulé de poste ou secteur ne suffit à attribuer automatiquement une fonction 7.x." },
                { title: "Sources courantes", text: "Toute affirmation réglementaire doit être rattachée à une preuve courante faisant autorité ; sinon l'état reste SOURCE GAP ou SOURCE CONFLICT." },
                { title: "Fonctions indépendantes", text: "La structure de 7.1 n'est pas copiée mécaniquement vers 7.2–7.10." },
                { title: "Revue qualifiée", text: "Aucun statut de production APPROVED sans reviewer qualifié nommé, date de revue et contrôles linguistiques requis." },
              ].map((r) => (
                <div key={r.title} style={{ background: "white", borderRadius: 12, padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{r.title}</h3>
                  <p style={{ color: "#555", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ background: "#003087", color: "white", padding: "60px 24px", textAlign: "center" }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Demander un cadrage</h2>
          <p style={{ opacity: 0.9, marginBottom: 28 }}>
            Transmettez les tâches des participants et le contexte opérationnel pour déterminer le périmètre à examiner.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/#contact" style={{ background: "white", color: "#003087", padding: "14px 28px", borderRadius: 8, fontWeight: 700, textDecoration: "none" }}>Demander des informations</a>
            <TrackedLink track="whatsapp" location="formation-dgr-afrique-bottom" href="https://wa.me/213542305383?text=Bonjour%2C%20je%20souhaite%20un%20cadrage%20DGR%20%2F%20CBTA" target="_blank" rel="noopener noreferrer" style={{ background: "#25D366", color: "white", padding: "14px 28px", borderRadius: 8, fontWeight: 700, textDecoration: "none" }}>
              WhatsApp +213 542 30 53 83
            </TrackedLink>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppSticky />
    </>
  );
}
