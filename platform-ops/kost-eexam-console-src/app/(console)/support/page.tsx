import Link from "next/link";
import { Mail, MessageCircle, AlertTriangle } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default function SupportPage() {
  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
      <div>
        <h1 className="font-display text-[22px] font-semibold tracking-tight text-text-primary">
          Aide &amp; support
        </h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Guides, prérequis techniques et vrais canaux de contact pour KOST E-EXAM.
        </p>
      </div>

      {/* Guides grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader
            title="Guide utilisateur"
            description="Orientation générale pour toute personne utilisant la console KOST E-EXAM."
          />
          <ul className="flex flex-col gap-2 text-[13px] text-text-secondary">
            <li>• Se connecter avec votre compte console Moodle</li>
            <li>• Comprendre votre rôle assigné (Administrateur, Responsable d&apos;examen, Instructeur, Auditeur)</li>
            <li>• Naviguer entre Examens, Sessions, Banque de questions et Journaux d&apos;audit</li>
            <li>• D&apos;où viennent les données — tout ce qui est affiché est lu en direct depuis Moodle, rien n&apos;est simulé</li>
          </ul>
        </Card>

        <Card>
          <CardHeader
            title="Guide candidat"
            description="Ce que les candidats doivent savoir avant de passer un vrai examen DGR."
          />
          <ul className="flex flex-col gap-2 text-[13px] text-text-secondary">
            <li>• Vérification d&apos;identité à la session (contrôle de pièce d&apos;identité, connexion supervisée)</li>
            <li>• Comment fonctionnent le chronomètre et l&apos;envoi automatique</li>
            <li>• Naviguer entre les questions avec les commandes Précédent / Suivant</li>
            <li>• Voir la page <Link href="/exam-preparation" className="text-accent-9 underline underline-offset-2">Préparation des examens</Link> pour le déroulé complet</li>
          </ul>
        </Card>

        <Card>
          <CardHeader
            title="Guide instructeur"
            description="Responsabilités du personnel qui supervise une session d'examen."
          />
          <ul className="flex flex-col gap-2 text-[13px] text-text-secondary">
            <li>• Préparer la session : vérifier que la fenêtre de l&apos;examen est ouverte dans Moodle Quiz</li>
            <li>• Vérification d&apos;identité du candidat avant d&apos;autoriser l&apos;accès</li>
            <li>• Suivre les tentatives en direct sur la page <Link href="/sessions" className="text-accent-9 underline underline-offset-2">Sessions</Link></li>
            <li>• Journaliser tout incident via <Link href="/support/report" className="text-accent-9 underline underline-offset-2">Signaler un incident technique</Link></li>
          </ul>
        </Card>

        <Card>
          <CardHeader title="Questions fréquentes" description="Questions courantes sur la plateforme." />
          <div className="flex flex-col gap-3 text-[13px]">
            <div>
              <p className="font-medium text-text-primary">Le contenu des examens est-il stocké dans cette console ?</p>
              <p className="text-text-tertiary mt-0.5">Non. La console lit les données d&apos;examens et de questions directement depuis Moodle, en lecture seule. Elle ne duplique ni ne stocke jamais de contenu réglementaire séparément.</p>
            </div>
            <div>
              <p className="font-medium text-text-primary">Que se passe-t-il si le temps est écoulé ?</p>
              <p className="text-text-tertiary mt-0.5">La tentative est envoyée automatiquement (comportement natif « autosubmit » de Moodle) — voir <Link href="/exam-preparation" className="text-accent-9 underline underline-offset-2">Préparation des examens</Link>.</p>
            </div>
            <div>
              <p className="font-medium text-text-primary">Qui peut accéder à la console ?</p>
              <p className="text-text-tertiary mt-0.5">Seuls les comptes Moodle disposant d&apos;un rôle console reconnu. Les comptes candidats classiques sont rejetés — appliqué côté serveur.</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Technical requirements */}
      <Card>
        <CardHeader title="Prérequis techniques" description="Ce qu'il faut pour faire fonctionner KOST E-EXAM de manière fiable." />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Navigateur" value="Chrome, Firefox, Edge ou Safari récent" />
          <Field label="Connexion" value="Connexion Internet stable requise pendant toute la durée de l'examen" />
          <Field label="Domaines" value="exam.kostacademy.com (moteur d'examen) et console.kostacademy.com (console du personnel) — tous deux servis en HTTPS" />
        </div>
      </Card>

      {/* Contact + report */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader title="Contacter le support technique" description="Canaux de contact réels et actuellement configurés — rien d'autre n'est publié ici." />
          <div className="flex flex-col gap-3">
            <ContactRow icon={Mail} label="E-mail" value="cbta@kostacademy.com" href="mailto:cbta@kostacademy.com" />
            <ContactRow icon={MessageCircle} label="WhatsApp" value="+213 542 30 53 83" href="https://wa.me/213542305383" />
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Signaler un incident technique"
            description="Journaliser un vrai incident — stocké dans le suivi d'incidents propre à la console, jamais dans Moodle."
          />
          <Link
            href="/support/report"
            className="inline-flex items-center gap-2 rounded-md bg-accent-9 px-3.5 py-2 text-[13px] font-medium text-white hover:bg-accent-10 transition-colors"
          >
            <AlertTriangle size={14} />
            Ouvrir le formulaire d&apos;incident
          </Link>
          <p className="mt-3 text-[12px] text-text-tertiary">
            Les administrateurs et responsables d&apos;examen peuvent consulter tous les incidents signalés sur la
            page <Link href="/incidents" className="text-accent-9 underline underline-offset-2">Incidents techniques</Link>.
          </p>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">{label}</p>
      <p className="mt-1 text-[13px] text-text-primary leading-relaxed">{value}</p>
    </div>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-3 rounded-md border border-border-subtle bg-surface-base px-3 py-2.5 hover:border-border-strong transition-colors"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent-soft-bg text-accent-9">
        <Icon size={15} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">{label}</p>
        <p className="text-[13px] font-medium text-text-primary truncate">{value}</p>
      </div>
    </a>
  );
}
