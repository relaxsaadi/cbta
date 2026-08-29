// Composants d'email partagés (mission email §5) — même palette que
// lib/pdf/theme.ts (cohérence visuelle KOST Academy entre PDF et email).
// Direction visuelle §6 : professionnel, crédibilité aviation/formation,
// épuré, pas "marketing" — une plateforme d'examen, pas une newsletter.
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text as EmailText,
  Button,
  Link,
} from "@react-email/components";
import type { ReactNode } from "react";

export const COLORS = {
  navy: "#0f1f3d",
  text: "#1a1a1a",
  textMuted: "#5a5a5a",
  border: "#e2e6ed",
  bgPage: "#f4f6f9",
  bgCard: "#ffffff",
  accent: "#1d4ed8",
  securityBg: "#fef3ea",
  securityBorder: "#f2c288",
  securityText: "#7a4a12",
};

export function EmailShell({ preview, children }: { preview: string; children: ReactNode }) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: COLORS.bgPage, fontFamily: "Helvetica, Arial, sans-serif", margin: 0, padding: "24px 0" }}>
        <Container style={{ backgroundColor: COLORS.bgCard, maxWidth: "560px", borderRadius: "6px", border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
          <Section style={{ padding: "24px 32px", borderBottom: `2px solid ${COLORS.navy}` }}>
            <EmailText style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: COLORS.navy, letterSpacing: "0.02em" }}>KOST ACADEMY</EmailText>
            <EmailText style={{ margin: "2px 0 0", fontSize: "11px", color: COLORS.textMuted }}>KOST E-EXAM — Plateforme d&apos;examen DGR</EmailText>
          </Section>
          <Section style={{ padding: "28px 32px" }}>{children}</Section>
          <Hr style={{ borderColor: COLORS.border, margin: 0 }} />
          <Section style={{ padding: "18px 32px" }}>
            <EmailText style={{ margin: 0, fontSize: "11px", color: COLORS.textMuted, lineHeight: 1.5 }}>
              KOST Academy — Alger, Algérie. Cet email est envoyé automatiquement par KOST E-EXAM, la plateforme
              d&apos;examen de KOST Academy. Pour toute question, contactez{" "}
              <Link href="mailto:support@kostacademy.com" style={{ color: COLORS.accent }}>
                support@kostacademy.com
              </Link>
              .
            </EmailText>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export function Title({ children }: { children: ReactNode }) {
  return <Heading style={{ margin: "0 0 16px", fontSize: "19px", fontWeight: 700, color: COLORS.text }}>{children}</Heading>;
}

export function Paragraph({ children }: { children: ReactNode }) {
  return <EmailText style={{ margin: "0 0 14px", fontSize: "14px", lineHeight: 1.6, color: COLORS.text }}>{children}</EmailText>;
}

export function InfoCard({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <Section style={{ backgroundColor: COLORS.bgPage, border: `1px solid ${COLORS.border}`, borderRadius: "5px", padding: "14px 16px", margin: "0 0 18px" }}>
      {rows.map((r, i) => (
        <EmailText key={i} style={{ margin: i === 0 ? "0 0 6px" : "6px 0", fontSize: "13px", color: COLORS.text }}>
          <span style={{ color: COLORS.textMuted }}>{r.label} : </span>
          <strong>{r.value}</strong>
        </EmailText>
      ))}
    </Section>
  );
}

export function CTAButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Section style={{ margin: "22px 0" }}>
      <Button
        href={href}
        style={{
          backgroundColor: COLORS.navy,
          color: "#ffffff",
          fontSize: "14px",
          fontWeight: 600,
          padding: "12px 26px",
          borderRadius: "5px",
          textDecoration: "none",
          display: "inline-block",
        }}
      >
        {children}
      </Button>
    </Section>
  );
}

export function SecurityNotice({ children }: { children: ReactNode }) {
  return (
    <Section
      style={{
        backgroundColor: COLORS.securityBg,
        border: `1px solid ${COLORS.securityBorder}`,
        borderRadius: "5px",
        padding: "12px 16px",
        margin: "18px 0 0",
      }}
    >
      <EmailText style={{ margin: 0, fontSize: "12.5px", color: COLORS.securityText, lineHeight: 1.5 }}>{children}</EmailText>
    </Section>
  );
}

export function ExpiryNote({ expiresAt }: { expiresAt: string }) {
  return (
    <EmailText style={{ margin: "0 0 18px", fontSize: "12.5px", color: COLORS.textMuted }}>
      Ce lien expire le {expiresAt}. Passé ce délai, demandez un nouveau lien.
    </EmailText>
  );
}
