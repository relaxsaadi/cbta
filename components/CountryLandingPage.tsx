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
  paysPreposition: string;
  capitale: string;
  autoriteRegionale: string;
  codeIso: string;
  langue: "fr" | "en";
  savingsVsParis: number;
  currency?: string;
  testimonialName?: string;
  testimonialPoste?: string;
  testimonialVille?: string;
  testimonialText?: string;
  keyFeature?: string;
  localContext?: CountryLocalContext;
};

const DGR_FUNCTIONS = ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7", "7.8", "7.9", "7.10"];

export default function CountryLandingPage({ data }: { data: CountryData }) {
  const isEnglish = data.langue === "en";

  const t = isEnglish
    ? {
        heroTitle: `DGR / CBTA training in ${data.pays}`,
        heroSub:
          "Training scope is confirmed from the participant's actual tasks, the applicable current source set and the required review path. No job title is mapped automatically to a DGR function.",
        whyTitle: `How KOST GROUP scopes DGR training in ${data.pays}`,
        noticeTitle: `Regulatory scope — ${data.autoriteRegionale}`,
        noticeText:
          "Applicable training, recurrent-training, certification and recognition requirements must be confirmed against the current authoritative rules and the participant's duties before enrolment or issuance. This page does not claim universal regulator, airline or IATA approval.",
        functionsTitle: "DGR / CBTA functions 7.1–7.10",
        functionsIntro:
          "Each function is treated independently. Scope, duration, assessment design, source evidence and reviewer sign-off are validated per function before use.",
        ctaTitle: "Request a scoped training proposal",
        ctaBtn: "Request information",
        faqTitle: "Frequently asked questions",
        resources: "More DGR resources",
      }
    : {
        heroTitle: `Formation DGR / CBTA ${data.paysPreposition} ${data.pays}`,
        heroSub:
          "Le périmètre de formation est déterminé à partir des tâches réellement exercées, des sources courantes applicables et du circuit de revue requis. Aucun intitulé de poste n'est associé automatiquement à une fonction DGR.",
        whyTitle: `Comment KOST GROUP détermine le périmètre DGR ${data.paysPreposition} ${data.pays}`,
        noticeTitle: `Périmètre réglementaire — ${data.autoriteRegionale}`,
        noticeText:
          "Les obligations de formation, de recyclage, de certification et de reconnaissance doivent être confirmées à partir des textes faisant autorité en vigueur et des tâches réelles du participant avant inscription ou délivrance. Cette page ne revendique aucune approbation universelle d'une autorité, d'une compagnie aérienne ou de l'IATA.",
        functionsTitle: "Fonctions DGR / CBTA 7.1–7.10",
        functionsIntro:
          "Chaque fonction est traitée indépendamment. Le périmètre, la durée, l'évaluation, les preuves de source et la revue qualifiée sont validés fonction par fonction avant utilisation.",
        ctaTitle: "Demander une proposition de formation cadrée",
        ctaBtn: "Demander des informations",
        faqTitle: "Questions fréquentes",
        resources: "Autres ressources DGR",
      };

  const reasons = isEnglish
    ? [
        {
          icon: "🧭",
          title: "Task-based scoping",
          text: "The required function is determined from actual duties and the applicable task table, not from a generic job-title shortcut.",
        },
        {
          icon: "📚",
          title: "Source traceability",
          text: "Regulatory claims and assessment content require current source evidence, with gaps or conflicts kept explicit until resolved.",
        },
        {
          icon: "👥",
          title: "Qualified review",
          text: "Production approval requires a named qualified reviewer and date; bilingual review is handled separately where applicable.",
        },
        {
          icon: "🏢",
          title: "Organisation options",
          text: `Delivery arrangements in ${data.pays} are confirmed in the proposal after the scope and operational constraints are reviewed.`,
        },
      ]
    : [
        {
          icon: "🧭",
          title: "Périmètre fondé sur les tâches",
          text: "La fonction requise est déterminée à partir des tâches réelles et de la table de tâches applicable, jamais par un raccourci basé uniquement sur l'intitulé du poste.",
        },
        {
          icon: "📚",
          title: "Traçabilité des sources",
          text: "Les affirmations réglementaires et le contenu d'évaluation exigent des preuves de source courantes ; les écarts ou conflits restent explicitement ouverts jusqu'à résolution.",
        },
        {
          icon: "👥",
          title: "Revue qualifiée",
          text: "Une approbation de production exige un reviewer qualifié nommé et daté ; la revue bilingue est traitée séparément lorsqu'elle s'applique.",
        },
        {
          icon: "🏢",
          title: "Organisation sur mesure",
          text: `Les modalités de formation ${data.paysPreposition} ${data.pays} sont confirmées dans la proposition après revue du périmètre et des contraintes opérationnelles.`,
        },
      ];

  const faqItems = isEnglish
    ? [
        {
          q: `Is a DGR / CBTA certificate automatically recognized in ${data.pays}?`,
          a: "No universal recognition is claimed on this page. Recognition depends on the issuing route, the applicable regulator/operator requirements and the current validated scope. These points must be checked before enrolment.",
        },
        {
          q: "How is the correct DGR function selected?",
          a: "From the participant's actual duties and the current function-specific CBTA task table/source set. Function 7.1 is not used as a template for the other functions.",
        },
        {
          q: "How is regulatory content approved?",
          a: "A regulatory claim remains non-production if direct current authoritative evidence is missing or conflicting. Production approval also requires the required FR verification, separate EN bilingual review where applicable, and a named qualified reviewer with a review date.",
        },
        {
          q: `Can training be organised in ${data.pays}?`,
          a: "Delivery options are confirmed case by case after the training scope, participants and operational requirements have been reviewed.",
        },
      ]
    : [
        {
          q: `Un certificat DGR / CBTA est-il automatiquement reconnu ${data.paysPreposition} ${data.pays} ?`,
          a: "Aucune reconnaissance universelle n'est revendiquée sur cette page. La reconnaissance dépend de la voie de délivrance, des exigences de l'autorité ou de l'opérateur applicable et du périmètre validé au moment concerné. Ces points doivent être vérifiés avant l'inscription.",
        },
        {
          q: "Comment la bonne fonction DGR est-elle déterminée ?",
          a: "À partir des tâches réellement exercées et de la table de tâches / du jeu de sources CBTA courant propre à la fonction. La fonction 7.1 n'est pas utilisée comme modèle automatique pour les autres fonctions.",
        },
        {
          q: "Comment le contenu réglementaire est-il approuvé ?",
          a: "Une affirmation réglementaire reste hors production si la preuve directe courante faisant autorité manque ou est contradictoire. L'approbation de production exige également la vérification FR requise, une revue EN bilingue distincte lorsqu'elle s'applique, ainsi qu'un reviewer qualifié nommé avec date de revue.",
        },
        {
          q: `Peut-on organiser une formation ${data.paysPreposition} ${data.pays} ?`,
          a: "Les modalités sont confirmées au cas par cas après revue du périmètre de formation, des participants et des contraintes opérationnelles.",
        },
      ];

  return (
    <>
      <Navbar />
      <WhatsAppSticky />

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
            DGR / CBTA · {isEnglish ? "scope validated per function" : "périmètre validé par fonction"}
          </div>
          <h1 style={{ fontSize: "clamp(26px, 5vw, 44px)", fontWeight: 800, lineHeight: 1.15, marginBottom: 16 }}>
            {t.heroTitle}
          </h1>
          <p style={{ fontSize: 16, opacity: 0.75, lineHeight: 1.7, marginBottom: 28 }}>{t.heroSub}</p>
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
              href={`https://wa.me/213542305383?text=${encodeURIComponent(
                isEnglish
                  ? `Hello, I would like information about DGR / CBTA training in ${data.pays}`
                  : `Bonjour, je souhaite des informations sur une formation DGR / CBTA ${data.paysPreposition} ${data.pays}`,
              )}`}
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

      <section style={{ background: "#FFF8E1", borderBottom: "2px solid #F59E0B", padding: "24px 20px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", gap: 14, alignItems: "flex-start" }}>
          <span style={{ fontSize: 24, flexShrink: 0 }}>⚠️</span>
          <div>
            <strong style={{ color: "#92400E", display: "block", marginBottom: 4 }}>{t.noticeTitle}</strong>
            <p style={{ color: "#78350F", fontSize: 14, lineHeight: 1.7, margin: 0 }}>{t.noticeText}</p>
          </div>
        </div>
      </section>

      <section style={{ padding: "60px 20px", background: "#fff" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#003D7A", marginBottom: 32, textAlign: "center" }}>
            {t.whyTitle}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
            {reasons.map((reason) => (
              <div key={reason.title} style={{ background: "#F8FAFC", border: "1px solid #E5E7EB", borderRadius: 12, padding: "20px 16px" }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{reason.icon}</div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#003D7A", marginBottom: 6 }}>{reason.title}</h3>
                <p style={{ fontSize: 12.5, color: "#6B7280", lineHeight: 1.65, margin: 0 }}>{reason.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "40px 20px", background: "#F8FAFC" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#003D7A", marginBottom: 8 }}>{t.functionsTitle}</h2>
          <p style={{ color: "#6B7280", fontSize: 13, lineHeight: 1.7, marginBottom: 24 }}>{t.functionsIntro}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
            {DGR_FUNCTIONS.map((fn) => (
              <div key={fn} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, padding: "14px 12px" }}>
                <div style={{ fontWeight: 800, color: "#003D7A", marginBottom: 6 }}>DGR {fn}</div>
                <div style={{ fontSize: 11.5, color: "#6B7280", lineHeight: 1.5 }}>
                  {isEnglish ? "Independent task/source set · scope on review" : "Tâches/sources indépendantes · périmètre après revue"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "60px 20px", background: "#fff" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#003D7A", marginBottom: 28 }}>{t.faqTitle}</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {faqItems.map((item) => (
              <div key={item.q} style={{ border: "1px solid #E5E7EB", borderRadius: 10, padding: "16px 18px", background: "#F8FAFC" }}>
                <div style={{ fontWeight: 700, color: "#003D7A", marginBottom: 6, fontSize: 14 }}>{item.q}</div>
                <div style={{ color: "#374151", fontSize: 13, lineHeight: 1.7 }}>{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="devis" style={{ padding: "60px 20px", background: "#F8FAFC" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#003D7A", marginBottom: 8, textAlign: "center" }}>{t.ctaTitle}</h2>
          <p style={{ textAlign: "center", color: "#6B7280", fontSize: 14, marginBottom: 28 }}>
            {isEnglish
              ? "Send the participants' duties and operational context so the appropriate training scope can be reviewed before a proposal is issued."
              : "Indiquez les tâches des participants et le contexte opérationnel afin que le périmètre de formation soit revu avant émission de la proposition."}
          </p>
          <Suspense fallback={null}>
            <LeadForm />
          </Suspense>
        </div>
      </section>

      <section style={{ padding: "40px 20px", background: "#003D7A", color: "white" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 14, opacity: 0.6, marginBottom: 16 }}>{t.resources}</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { href: "/", label: isEnglish ? "Home" : "Accueil" },
              { href: "/planning", label: "Planning" },
              { href: "/dgr-7-1", label: "DGR 7.1" },
              { href: "/dgr-7-3", label: "DGR 7.3" },
              { href: "/contact", label: "Contact" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  color: "rgba(255,255,255,0.6)",
                  textDecoration: "none",
                  fontSize: 13,
                  padding: "6px 12px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 8,
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
