import { z } from "zod";

export const leadSchema = z.object({
  prenom: z.string().trim().min(1, "Prénom requis").max(80),
  nom: z.string().trim().min(0, "").max(80).optional().or(z.literal("")),
  email: z.string().trim().email("Email invalide").max(160),
  whatsapp: z
    .string()
    .trim()
    .min(6, "Numéro WhatsApp requis")
    .max(30)
    .regex(/^[+0-9 ()\-]+$/, "Format invalide"),
  pays: z.string().min(1, "Pays requis").max(60),
  entreprise: z.string().max(160).optional().or(z.literal("")),
  formation: z.string().min(1, "Formation requise").max(120),
  message: z.string().max(2000).optional().or(z.literal("")),
  consent: z.literal(true, { message: "Consentement requis" }),
  // Honeypot - must stay empty
  website: z.string().max(0).optional().or(z.literal("")),
  // Meta
  sourcePage: z.string().max(200).optional().or(z.literal("")),
  // Structured UTM / click IDs
  utm_source: z.string().max(200).optional().or(z.literal("")),
  utm_medium: z.string().max(200).optional().or(z.literal("")),
  utm_campaign: z.string().max(200).optional().or(z.literal("")),
  utm_term: z.string().max(200).optional().or(z.literal("")),
  utm_content: z.string().max(200).optional().or(z.literal("")),
  gclid: z.string().max(200).optional().or(z.literal("")),
  fbclid: z.string().max(200).optional().or(z.literal("")),
});

export type LeadPayload = z.infer<typeof leadSchema>;
