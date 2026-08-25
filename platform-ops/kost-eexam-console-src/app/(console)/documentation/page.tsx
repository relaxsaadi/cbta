import { Card } from "@/components/ui/Card";
import { DocTabs } from "./DocTabs";

export const dynamic = "force-dynamic";

const DOC_META = { version: "1.0", lastUpdated: "2026-08-20", owner: "KOST Academy" };

function VersionBar() {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-1 rounded-md border border-border-subtle bg-surface-sunken/50 px-3.5 py-2.5 text-[11.5px] text-text-tertiary">
      <span>Version <strong className="text-text-secondary">{DOC_META.version}</strong></span>
      <span>Dernière mise à jour <strong className="text-text-secondary">{DOC_META.lastUpdated}</strong></span>
      <span>Propriétaire <strong className="text-text-secondary">{DOC_META.owner}</strong></span>
    </div>
  );
}

const CANDIDATE_SECTIONS = [
  { title: "1. Accéder à KOST E-EXAM", body: "Les examens se passent sur Moodle, à exam.kostacademy.com, servi en HTTPS. Vous n'utilisez pas la console du personnel (console.kostacademy.com) — c'est un outil séparé, réservé aux administrateurs." },
  { title: "2. Connexion", body: "Connectez-vous avec le compte Moodle créé pour vous (identifiant + mot de passe). Il n'y a pas de compte KOST E-EXAM séparé — l'identité est entièrement gérée par Moodle." },
  { title: "3. Avant l'examen", body: "Présentez-vous à votre session à l'heure. Un instructeur confirmera votre session et votre examen avant de vous donner accès." },
  { title: "4. Procédure de vérification d'identité", body: "Un superviseur vérifie votre identité par rapport à une pièce d'identité officielle et à votre compte Moodle avant que vous ne commenciez. Cette vérification est journalisée (candidat, examen, vérificateur, horodatage) — aucune copie de votre pièce d'identité n'est conservée." },
  { title: "5. Prérequis techniques", body: "Un navigateur récent (Chrome, Firefox, Edge ou Safari) et une connexion Internet stable pendant toute la durée de l'examen." },
  { title: "6. Démarrer l'examen", body: "Ouvrez l'examen depuis votre tableau de bord Moodle et sélectionnez « Effectuer le test ». Une boîte de dialogue de confirmation vous rappelle la limite de temps avant de commencer." },
  { title: "7. Navigation", body: "Les questions sont affichées une par page. Utilisez « Page précédente » / « Page suivante » pour vous déplacer entre elles." },
  { title: "8. Répondre aux questions", body: "Sélectionnez votre réponse en cliquant sur le bouton radio correspondant (choix multiple) ou Vrai/Faux. Votre sélection est enregistrée au fil de votre navigation entre les pages." },
  { title: "9. Signaler une question", body: "Utilisez « Marquer la question » pour repérer une question à revoir avant l'envoi final." },
  { title: "10. Chronomètre", body: "Un compte à rebours (« Temps restant ») est visible pendant toute la tentative. Il ne peut pas être mis en pause une fois démarré." },
  { title: "11. Envoi automatique", body: "Si le chronomètre atteint zéro, votre tentative est envoyée automatiquement — vous ne perdez pas vos réponses." },
  { title: "12. Envoi manuel", body: "Une fois terminé, sélectionnez « Terminer le test... » pour revoir le résumé de vos réponses, puis « Tout envoyer et terminer » pour confirmer." },
  { title: "13. Signalement d'incident technique", body: "En cas de problème, prévenez immédiatement votre instructeur — il peut le journaliser dans le suivi d'incidents de la console en votre nom." },
  { title: "14. Fin de l'examen", body: "Une fois envoyée, votre tentative est définitive. Votre résultat officiel est enregistré directement dans le carnet de notes Moodle." },
  { title: "15. Support", body: "Pour toute question générale en dehors d'une session d'examen active, les instructeurs peuvent vous orienter vers la page Aide & support de la console (e-mail / WhatsApp)." },
];

const INSTRUCTOR_SECTIONS = [
  { title: "1. Préparer un examen", body: "Les examens sont configurés comme des activités Quiz Moodle. Confirmez que le quiz existe et que ses réglages sont corrects avant une session — la page Examens de la console reflète la configuration Moodle en direct." },
  { title: "2. Inscription des candidats", body: "Les candidats sont inscrits dans le cours Moodle concerné (inscription manuelle, rôle Étudiant) avant leur session." },
  { title: "3. Réglages de l'examen", body: "Durée, nombre de questions et tentatives autorisées sont tous configurés sur le Quiz dans Moodle et affichés en lecture seule sur la page Examens." },
  { title: "4. Chronomètre", body: "Vérifiez la durée configurée et le mode de dépassement de délai (envoi automatique) sur la page Examens avant le début de la session." },
  { title: "5. Seuil de réussite", body: "Le seuil de réussite est défini sur l'élément de note du Quiz dans Moodle et affiché sur les pages Examens et Résultats — jamais modifié depuis la console." },
  { title: "6. Randomisation", body: "Le mélange des réponses (shuffleanswers) est un vrai réglage Moodle Quiz, visible sur la page Examens pour chaque examen." },
  { title: "7. Fenêtres d'ouverture / fermeture", body: "La fenêtre d'ouverture/fermeture de l'examen (ou son absence) est affichée sur les pages Examens et Sessions, en direct depuis Moodle." },
  { title: "8. Préparer une session d'examen", body: "Utilisez la page Sessions pour confirmer que la fenêtre de l'examen est ouverte et suivre les compteurs de tentatives en direct avant que les candidats ne commencent." },
  { title: "9. Vérification d'identité des candidats", body: "Enregistrez la vérification d'identité de chaque candidat sur la page Vérification d'identité avant d'autoriser l'accès à l'examen." },
  { title: "10. Suivi des tentatives", body: "La page Sessions affiche des compteurs réels et en direct : commencées, en cours, terminées — issus des tentatives Moodle Quiz." },
  { title: "11. Incidents techniques", body: "Journalisez tout problème technique via Signaler un incident technique ; suivez et mettez à jour le statut sur la page Incidents techniques." },
  { title: "12. Résultats", body: "Les résultats officiels (note, résultat, réussite/échec, durée) sont disponibles sur la page Résultats immédiatement après l'envoi d'un candidat." },
  { title: "13. Journaux d'audit", body: "Toute l'activité du système est disponible en lecture seule sur la page Journaux d'audit, issue du journal natif de Moodle." },
  { title: "14. Revue des retours", body: "Consultez et traitez les retours candidats/personnel dans l'onglet Retours → Revue des retours (Administrateur / Responsable d'examen uniquement)." },
  { title: "15. Procédure d'escalade", body: "En cas d'incident de sécurité ou de violation suspectée, suivez la Procédure de réponse aux incidents de sécurité et prévenez immédiatement l'Administrateur de la plateforme." },
];

export default function DocumentationPage() {
  return (
    <div className="mx-auto flex max-w-[900px] flex-col gap-6">
      <div>
        <h1 className="font-display text-[22px] font-semibold tracking-tight text-text-primary">Documentation</h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Guides versionnés décrivant exactement ce que fait cette plateforme aujourd&apos;hui — rien d&apos;hypothétique.
        </p>
      </div>

      <DocTabs
        candidate={
          <div className="flex flex-col gap-4">
            <VersionBar />
            {CANDIDATE_SECTIONS.map((s) => (
              <Card key={s.title} padding="sm">
                <p className="font-display text-[13.5px] font-semibold text-text-primary">{s.title}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">{s.body}</p>
              </Card>
            ))}
          </div>
        }
        instructor={
          <div className="flex flex-col gap-4">
            <VersionBar />
            {INSTRUCTOR_SECTIONS.map((s) => (
              <Card key={s.title} padding="sm">
                <p className="font-display text-[13.5px] font-semibold text-text-primary">{s.title}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">{s.body}</p>
              </Card>
            ))}
          </div>
        }
      />
    </div>
  );
}
