"use client";

import { Suspense } from "react";
import Link from "next/link";
import LeadForm from "./LeadForm";
import WhatsAppSticky from "./WhatsAppSticky";
import Footer from "./Footer";
import Navbar from "./Navbar";
import { trackWhatsApp } from "@/lib/tracking";

export type CountryLocalContext = {
  title: string;
  paragraphs: string[];
  aeroports?: string[];
};

export type CountryData = {
  slug: string;
  pays: string;
  paysPreposition: string; // "en" Algérie, "au" Maroc, "au" Sénégal
  capitale: string;
  autoriteRegionale: string; // ANAC, DGAC, AACM...
  codeIso: string;
  langue: "fr" | "en";
  savingsVsParis: number; // % moins cher
  currency?: string;
  testimonialName?: string;
  testimonialPoste?: string;
  testimonialVille?: string;
  testimonialText?: string;
  keyFeature?: string; // point fort spécifique pour ce pays
  localContext?: CountryLocalContext; // contenu spécifique pays pour éviter thin content
};

const FORMATIONS_SUMMARY = [
  { code: "DGR 7.1 Initial", poste: "Expéditeurs, transitaires", duree: "4j / 32h", prix: "1 800 €" },
  { code: "DGR 7.1 Recurrent", poste: "Renouvellement 7.1", duree: "3j / 24h", prix: "1 400 €" },
  { code: "DGR 7.2 + 7.4", poste: "Agents cargo & manutention", duree: "2j / 16h", prix: "900 €" },
  { code: "DGR 7.3 Initial", poste: "Acceptation cargo compagnies", duree: "5j / 40h", prix: "2 100 €" },
  { code: "DGR 7.3 Recurrent", poste: "Renouvellement 7.3", duree: "3j / 18h", prix: "1 500 €" },
  { code: "DGR 7.5 + 7.6", poste: "Agents embarquement & pilotes", duree: "2j / 16h", prix: "850 €" },
  { code: "DGR 7.7 + 7.8 + 7.9", poste: "PNC, dispatchers, sûreté", duree: "2j / 16h", prix: "650 €" },
  { code: "DGR 7.10", poste: "Agents de fret aérien", duree: "Sur devis", prix: "650 €" },
];

export default function CountryLandingPage({ data }: { data: CountryData }) {
  const isEnglish = data.langue === "en";

  const t = isEnglish
    ? {
        heroTitle: `IATA DGR Training in ${data.pays}`,
        heroSub: `DGR training for dangerous goods by air, using the CBTA approach — delivered locally in Africa`,
        whyTitle: `Why train in ${data.pays} with KOST GROUP?`,
        obligTitle: `Regulatory obligation — ${data.autoriteRegionale}`,
        obligText: `Under ICAO Annex 18 and the regulations of ${data.autoriteRegionale}, all personnel involved in the air transport of dangerous goods must be trained and certified before taking up their duties. Certification is valid for 24 months.`,
        formationsTitle: "Available IATA DGR Formations",
        savingsLabel: `${data.savingsVsParis}% less expensive than Paris or Brussels`,
        ctaTitle: "Get a free quote in 24 hours",
        ctaBtn: "Request a quote",
        faqTitle: "Frequently asked questions",
      }
    : {
        heroTitle: `Formation IATA DGR ${data.paysPreposition} ${data.pays}`,
        heroSub: `Formation marchandises dangereuses, méthode CBTA — pour toute l'Afrique francophone`,
        whyTitle: `Pourquoi choisir KOST GROUP pour votre formation DGR ${data.paysPreposition} ${data.pays} ?`,
        obligTitle: `Obligation réglementaire — ${data.autoriteRegionale}`,
        obligText: `Conformément à l'Annexe 18 de l'OACI et à la réglementation de ${data.autoriteRegionale}, tout personnel impliqué dans le transport aérien de marchandises dangereuses doit être formé et certifié avant d'exercer ses fonctions. La certification est valide 24 mois.`,
        formationsTitle: "Formations IATA DGR disponibles",
        savingsLabel: `${data.savingsVsParis}% moins cher qu'à Paris ou Bruxelles`,
        ctaTitle: "Obtenez un devis gratuit en 24h",
        ctaBtn: "Demander un devis",
        faqTitle: "Questions fréquentes",
      };

  const reasons = isEnglish
    ? [
        { icon: "🏆", title: "CBTA-based training in Algeria", text: "KOST GROUP delivers DGR training in Algeria using the CBTA approach, so your team can train locally instead of traveling to Europe." },
        { icon: "💰", title: `Save ${data.savingsVsParis}% vs. Europe`, text: "Same CBTA method. Same passing rate. At a fraction of the cost of sending staff to Belgium or France." },
        { icon: "🌍", title: "We come to you", text: `On-site training in ${data.pays} from 6 participants. No travel required. Our trainers travel across Africa.` },
        { icon: "📄", title: "Local invoicing", text: `Invoice in EUR, USD or local currency. Compatible with your accounting requirements in ${data.pays}.` },
      ]
    : [
        { icon: "🏆", title: "Formation méthode CBTA en Algérie", text: `KOST GROUP dispense ses formations DGR en Algérie selon la méthode CBTA, pour éviter à vos équipes un déplacement en Europe.` },
        { icon: "💰", title: `${data.savingsVsParis}% moins cher qu'en Europe`, text: "Même méthode CBTA. Même taux de réussite. À une fraction du coût d'un déplacement en Belgique ou en France." },
        { icon: "🌍", title: "Formation intra possible", text: `Nous venons dans votre entreprise ${data.paysPreposition} ${data.pays} à partir de 6 participants. Pas de déplacement requis pour vos équipes.` },
        { icon: "📄", title: "Facturation adaptée", text: `Facture en EUR, USD ou monnaie locale. Compatible avec vos exigences comptables ${data.paysPreposition} ${data.pays}.` },
      ];

  const faqItems = isEnglish
    ? [
        { q: `Is the IATA DGR certificate recognized in ${data.pays}?`, a: `The IATA Dangerous Goods Regulations (DGR) are the training standard referenced by IATA member airlines and civil aviation authorities, including ${data.autoriteRegionale}. We recommend confirming your airline's specific requirements when booking.` },
        { q: "How long is the certificate valid?", a: "24 months from the date of successful examination. A Recurrent (renewal) training is mandatory before expiry to maintain the qualification." },
        { q: `Can you deliver training in ${data.pays}?`, a: `Yes. We organize intra-company training sessions in ${data.pays} from 6 participants. Our trainers travel to your site. Contact us for a quote.` },
        { q: "What is the examination pass rate?", a: "Over 90% on first attempt for our participants. Our CBTA-based approach focuses on practical skill demonstration, not just theory." },
      ]
    : [
        { q: `Le certificat IATA DGR est-il reconnu ${data.paysPreposition} ${data.pays} ?`, a: `Le référentiel IATA DGR (Dangerous Goods Regulations) est le standard de formation utilisé par les compagnies aériennes membres de l'IATA et repris par les autorités de l'aviation civile, dont ${data.autoriteRegionale}. Nous vous recommandons de vérifier les exigences spécifiques de votre compagnie lors de la réservation.` },
        { q: "Combien de temps dure la certification ?", a: "24 mois à compter de la date de réussite à l'examen. Un recyclage (Recurrent) est obligatoire avant l'expiration pour maintenir la qualification." },
        { q: `Pouvez-vous former ${data.paysPreposition} ${data.pays} ?`, a: `Oui. Nous organisons des sessions intra-entreprise ${data.paysPreposition} ${data.pays} à partir de 6 participants. Nos formateurs se déplacent sur votre site. Contactez-nous pour un devis.` },
        { q: "Quel est le taux de réussite à l'examen ?", a: "Plus de 90% à la première tentative pour nos stagiaires. Notre approche CBTA axée sur la démonstration de compétences garantit une préparation optimale." },
        { q: `Y a-t-il une session prochainement ${data.paysPreposition} ${data.pays} ?`, a: `Des sessions inter-entreprises ont lieu régulièrement à Alger. Pour ${data.pays}, nous organisons des sessions intra à partir de 6 participants. Consultez le planning ou contactez-nous.` },
      ];

  return (
    <>
      <Navbar />
      <WhatsAppSticky />

      {/* HERO */}
      <section
        style={{
          background: "linear-gradient(160deg, #001832 0%, #003D7A 100%)",
          color: "white",
          padding: "80px 20px 60px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div
            style={{
              display: "inline-block",
              background: "rgba(255,215,0,0.15)",
              border: "1px solid rgba(255,215,0,0.3)",
              color: "#FFD700",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              padding: "5px 14px",
              borderRadius: 20,
              marginBottom: 20,
            }}
          >
            Formation IATA DGR · {t.savingsLabel}
          </div>
          <h1
            style={{
              fontSize: "clamp(26px, 5vw, 44px)",
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: 16,
            }}
          >
            {t.heroTitle}
          </h1>
          <p style={{ fontSize: 16, opacity: 0.65, lineHeight: 1.7, marginBottom: data.keyFeature ? 12 : 32 }}>
            {t.heroSub}
          </p>
          {data.keyFeature && (
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#FFD700",
                lineHeight: 1.6,
                marginBottom: 32,
                maxWidth: 620,
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              ✓ {data.keyFeature}
            </p>
          )}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="#devis"
              style={{
                background: "#FFD700",
                color: "#001832",
                fontWeight: 800,
                padding: "14px 28px",
                borderRadius: 10,
                textDecoration: "none",
                fontSize: 15,
              }}
            >
              {t.ctaBtn}
            </a>
            <a
              href={`https://wa.me/213542305383?text=Bonjour, je veux une formation DGR IATA ${data.paysPreposition} ${data.pays}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsApp(`country-${data.slug}`)}
              style={{
                background: "#25D366",
                color: "white",
                fontWeight: 700,
                padding: "14px 28px",
                borderRadius: 10,
                textDecoration: "none",
                fontSize: 15,
              }}
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* OBLIGATION RÉGLEMENTAIRE */}
      <section style={{ background: "#FFF8E1", borderBottom: "2px solid #F59E0B", padding: "24px 20px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", gap: 14, alignItems: "flex-start" }}>
          <span style={{ fontSize: 24, flexShrink: 0 }}>⚠️</span>
          <div>
            <strong style={{ color: "#92400E", display: "block", marginBottom: 4 }}>{t.obligTitle}</strong>
            <p style={{ color: "#78350F", fontSize: 14, lineHeight: 1.7, margin: 0 }}>{t.obligText}</p>
          </div>
        </div>
      </section>

      {/* WHY KOST */}
      <section style={{ padding: "60px 20px", background: "#fff" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#003D7A", marginBottom: 32, textAlign: "center" }}>
            {t.whyTitle}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
            {reasons.map((r, i) => (
              <div
                key={i}
                style={{
                  background: "#F8FAFC",
                  border: "1px solid #E5E7EB",
                  borderRadius: 12,
                  padding: "20px 16px",
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 10 }}>{r.icon}</div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#003D7A", marginBottom: 6 }}>{r.title}</h3>
                <p style={{ fontSize: 12.5, color: "#6B7280", lineHeight: 1.65, margin: 0 }}>{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FORMATIONS TABLE */}
      <section style={{ padding: "40px 20px", background: "#F8FAFC" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#003D7A", marginBottom: 24 }}>
            {t.formationsTitle}
          </h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#003D7A", color: "white" }}>
                  <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600 }}>Formation</th>
                  <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600 }}>Personnel concerné</th>
                  <th style={{ padding: "10px 12px", textAlign: "center", fontWeight: 600 }}>Durée</th>
                  <th style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600 }}>Tarif HT</th>
                </tr>
              </thead>
              <tbody>
                {FORMATIONS_SUMMARY.map((f, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#F8FAFC", borderBottom: "1px solid #E5E7EB" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 700, color: "#003D7A" }}>{f.code}</td>
                    <td style={{ padding: "10px 12px", color: "#374151" }}>{f.poste}</td>
                    <td style={{ padding: "10px 12px", textAlign: "center", color: "#6B7280" }}>{f.duree}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700, color: "#003D7A" }}>{f.prix}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 10 }}>
            * Formation intra-entreprise disponible {isEnglish ? `in ${data.pays}` : `${data.paysPreposition} ${data.pays}`} · Min. 6 participants · Devis personnalisé sous 24h
          </p>
        </div>
      </section>

      {/* TESTIMONIAL */}
      {data.testimonialText && (
        <section style={{ padding: "40px 20px", background: "#EFF6FF" }}>
          <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⭐⭐⭐⭐⭐</div>
            <p style={{ fontSize: 16, fontStyle: "italic", color: "#1E3A5F", lineHeight: 1.75, marginBottom: 16 }}>
              &ldquo;{data.testimonialText}&rdquo;
            </p>
            <div style={{ fontWeight: 700, color: "#003D7A", fontSize: 14 }}>{data.testimonialName}</div>
            <div style={{ color: "#6B7280", fontSize: 12 }}>{data.testimonialPoste} · {data.testimonialVille}</div>
          </div>
        </section>
      )}

      {/* LOCAL CONTEXT — contenu spécifique pays */}
      {data.localContext && (
        <section style={{ padding: "60px 20px", background: "#F0F7FF" }}>
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#003D7A", marginBottom: 24 }}>
              {data.localContext.title}
            </h2>
            {data.localContext.paragraphs.map((p, i) => (
              <p key={i} style={{ color: "#374151", fontSize: 14, lineHeight: 1.8, marginBottom: 16 }}>
                {p}
              </p>
            ))}
            {data.localContext.aeroports && data.localContext.aeroports.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <p style={{ fontWeight: 700, color: "#003D7A", fontSize: 13, marginBottom: 10 }}>
                  Principaux aéroports concernés par la réglementation DGR :
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {data.localContext.aeroports.map((a, i) => (
                    <span
                      key={i}
                      style={{
                        background: "#DBEAFE",
                        color: "#1E40AF",
                        fontSize: 12,
                        fontWeight: 600,
                        padding: "4px 12px",
                        borderRadius: 20,
                        border: "1px solid #BFDBFE",
                      }}
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* FAQ */}
      <section style={{ padding: "60px 20px", background: "#fff" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#003D7A", marginBottom: 28 }}>{t.faqTitle}</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {faqItems.map((f, i) => (
              <div
                key={i}
                style={{ border: "1px solid #E5E7EB", borderRadius: 10, padding: "16px 18px", background: "#F8FAFC" }}
              >
                <div style={{ fontWeight: 700, color: "#003D7A", marginBottom: 6, fontSize: 14 }}>
                  {f.q}
                </div>
                <div style={{ color: "#374151", fontSize: 13, lineHeight: 1.7 }}>{f.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEVIS FORM */}
      <section id="devis" style={{ padding: "60px 20px", background: "#F8FAFC" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#003D7A", marginBottom: 8, textAlign: "center" }}>
            {t.ctaTitle}
          </h2>
          <p style={{ textAlign: "center", color: "#6B7280", fontSize: 14, marginBottom: 28 }}>
            {isEnglish
              ? "Fill in the form. Our team responds within 24 hours with a personalized quote."
              : "Remplissez le formulaire. Notre équipe vous répond sous 24h avec un devis personnalisé."}
          </p>
          <Suspense fallback={null}>
            <LeadForm />
          </Suspense>
        </div>
      </section>

      {/* LINKS TO OTHER PAGES */}
      <section style={{ padding: "40px 20px", background: "#003D7A", color: "white" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 14, opacity: 0.6, marginBottom: 16 }}>
            {isEnglish ? "More IATA DGR resources" : "Autres ressources IATA DGR"}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { href: "/", label: isEnglish ? "Home" : "Accueil" },
              { href: "/planning", label: "Planning" },
              { href: "/dgr-7-1", label: "DGR 7.1" },
              { href: "/dgr-7-3", label: "DGR 7.3" },
              { href: "/contact", label: isEnglish ? "Contact" : "Contact" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  color: "rgba(255,255,255,0.6)",
                  textDecoration: "none",
                  fontSize: 13,
                  padding: "6px 12px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 8,
                }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
