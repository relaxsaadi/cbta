import Link from "next/link";
import {
  ShieldCheck,
  Monitor,
  Navigation,
  Timer,
  Flag,
  Send,
  AlertOctagon,
  LifeBuoy,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

const STEPS = [
  {
    icon: ShieldCheck,
    title: "Avant de commencer",
    body: "Un instructeur vérifie votre identité (pièce d'identité + feuille de présence) avant de vous donner accès, comme pour une session d'examen en présentiel. Vous vous connectez à un compte Moodle créé pour vous — la console elle-même est un outil réservé au personnel, pas l'interface de passage d'examen des candidats.",
  },
  {
    icon: Monitor,
    title: "Prérequis techniques",
    body: "Un navigateur récent (Chrome, Firefox, Edge ou Safari) et une connexion Internet stable pendant toute la durée de l'examen. L'examen est servi en HTTPS sur exam.kostacademy.com.",
  },
  {
    icon: Navigation,
    title: "Navigation dans l'examen",
    body: "Les questions sont présentées une par une. Utilisez les commandes Précédent / Suivant pour naviguer — le mode de navigation est configuré par examen dans Moodle Quiz (navigation libre sur les configurations actuelles d'échantillon et d'entraînement).",
  },
  {
    icon: Timer,
    title: "Chronomètre",
    body: "Chaque examen a une durée fixe, affichée à l'écran et décomptée. L'examen DGR d'échantillon actuel est configuré pour 60 minutes ; le Test pratique est configuré pour 10 minutes afin d'observer le même mécanisme avant un vrai examen.",
  },
  {
    icon: Flag,
    title: "Signaler une question",
    body: "Moodle Quiz permet de marquer une question pour y revenir plus tard dans la même tentative, via l'icône de drapeau sur la page de la question.",
  },
  {
    icon: Send,
    title: "Envoi de l'examen",
    body: "Vous envoyez manuellement une fois que vous avez répondu à autant de questions que vous le souhaitez. Une étape de confirmation résume les questions sans réponse avant l'envoi final.",
  },
  {
    icon: AlertOctagon,
    title: "Quand le temps est écoulé",
    body: "Si le chronomètre atteint zéro avant l'envoi, la tentative est envoyée automatiquement — c'est le comportement natif « envoi automatique en cas de dépassement » de Moodle, vérifié sur l'examen d'échantillon configuré et sur le Test pratique.",
  },
  {
    icon: LifeBuoy,
    title: "En cas de problème",
    body: "Si un problème survient pendant une session, prévenez immédiatement votre instructeur. Les incidents techniques sont journalisés via le suivi d'incidents de la console — voir Signaler un incident technique.",
  },
];

export default function ExamPreparationPage() {
  return (
    <div className="mx-auto flex max-w-[900px] flex-col gap-6">
      <div>
        <h1 className="font-display text-[22px] font-semibold tracking-tight text-text-primary">
          Préparation des examens
        </h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Ce à quoi s&apos;attendre avant de passer un vrai examen DGR — décrit uniquement le comportement réel de cette plateforme, rien d&apos;hypothétique.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <Card key={step.title} padding="sm">
              <div className="flex gap-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-soft-bg text-accent-9">
                  <Icon size={16} strokeWidth={2} />
                </div>
                <div>
                  <p className="font-display text-[13.5px] font-semibold text-text-primary">{step.title}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">{step.body}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader
          title="Essayez par vous-même"
          description="Le Test pratique permet de découvrir la navigation, le chronomètre et l'envoi avec des questions génériques, non réglementaires."
        />
        <Link
          href="/practice-test"
          className="inline-flex w-fit items-center gap-2 rounded-md bg-accent-9 px-3.5 py-2 text-[13px] font-medium text-white hover:bg-accent-10 transition-colors"
        >
          Aller au Test pratique →
        </Link>
      </Card>
    </div>
  );
}
