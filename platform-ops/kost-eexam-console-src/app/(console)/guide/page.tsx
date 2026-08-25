import Link from "next/link";
import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

type GuideSection = {
  id: string;
  title: string;
  body: React.ReactNode;
};

const SECTIONS: GuideSection[] = [
  {
    id: "role",
    title: "1. À quoi sert la plateforme",
    body: (
      <>
        <p>
          KOST E-EXAM est le dispositif d&apos;examen numérique de KOST Academy pour les formations DGR IATA
          (marchandises dangereuses). Il repose sur deux systèmes distincts, chacun avec un rôle précis.
        </p>
      </>
    ),
  },
  {
    id: "moodle-vs-console",
    title: "2. Différence entre Moodle et la console KOST E-EXAM",
    body: (
      <>
        <p>
          <strong className="text-text-primary">Moodle</strong> (exam.kostacademy.com) est le moteur
          d&apos;examen : création et configuration des quiz, inscription des candidats, passage réel de
          l&apos;examen, notation officielle. C&apos;est le système de vérité pour tout le contenu d&apos;examen.
        </p>
        <p className="mt-2">
          <strong className="text-text-primary">La console KOST E-EXAM</strong> (console.kostacademy.com,
          cette application) est un outil de <strong className="text-text-primary">supervision</strong> :
          elle lit les vraies données Moodle en lecture seule (à l&apos;exception de quelques tables propres à
          la console — incidents, retours, vérifications d&apos;identité) pour offrir un suivi opérationnel,
          des rapports, de l&apos;audit et de la conformité. Ce n&apos;est jamais une deuxième base de données
          indépendante : si une donnée n&apos;existe pas dans Moodle (ou dans une table propre à la console),
          elle n&apos;existe pas dans la console non plus.
        </p>
      </>
    ),
  },
  {
    id: "roles",
    title: "3. Rôles utilisateurs",
    body: (
      <>
        <p>
          Quatre rôles sont prévus dans le code de la console : Administrateur, Responsable d&apos;examen,
          Instructeur, Auditeur. <strong className="text-text-primary">À ce jour, seuls Administrateur et
          Auditeur sont réellement provisionnés côté Moodle</strong> — les rôles Responsable d&apos;examen et
          Instructeur existent dans le code mais n&apos;ont pas encore de rôle Moodle correspondant créé.
        </p>
        <ul className="mt-2 list-disc pl-5 flex flex-col gap-1">
          <li><strong className="text-text-primary">Administrateur</strong> : accès complet — supervision, résultats, rapports, conformité, preuves, identité, incidents.</li>
          <li><strong className="text-text-primary">Auditeur</strong> : accès de consultation adapté à l&apos;audit — preuves, conformité, traçabilité.</li>
          <li><strong className="text-text-primary">Responsable d&apos;examen / Instructeur</strong> (à venir) : gestion pédagogique et supervision de session, aujourd&apos;hui assurées directement dans Moodle.</li>
        </ul>
      </>
    ),
  },
  {
    id: "overview",
    title: "4. Vue d'ensemble",
    body: (
      <p>
        Page d&apos;accueil de la console : indicateurs clés (examens ouverts, candidats, tentatives
        terminées, taux de réussite, banque de questions), activité récente, sessions, état du système
        (sauvegardes) et présentation du rôle de la console. Un filtre « Périmètre des données » permet de
        n&apos;afficher que les données de production, ou d&apos;inclure aussi les démonstrations/entraînements —
        voir la section 8 « Périmètre des données » ci-dessous.
      </p>
    ),
  },
  {
    id: "exams",
    title: "5. Examens",
    body: (
      <p>
        Liste en lecture seule des examens Moodle Quiz réels : statut (ouvert/programmé/fermé), durée,
        seuil de réussite, nombre de questions, tentatives autorisées, fenêtre d&apos;ouverture/fermeture. La
        configuration se fait exclusivement dans Moodle — un lien « Configurer dans Moodle » ouvre l&apos;examen
        correspondant.
      </p>
    ),
  },
  {
    id: "sessions",
    title: "6. Sessions",
    body: (
      <p>
        Moodle n&apos;a pas de notion de « session » séparée : une session, ici, est dérivée de la vraie
        fenêtre d&apos;ouverture/fermeture d&apos;un examen et des tentatives réelles associées. Cette page affiche
        les compteurs en direct (candidats commencés, tentatives terminées, tentatives en cours).
      </p>
    ),
  },
  {
    id: "question-bank",
    title: "7. Banque de questions",
    body: (
      <p>
        Vue en direct des questions présentes dans Moodle, avec type, catégorie, classification par
        Fonction DGR (si un tag existe) et statut. Une classification n&apos;est jamais appliquée
        artificiellement — une question sans tag « function-7.X » s&apos;affiche « Non classée ». À la date de
        cette page, aucune des questions présentes n&apos;est un contenu réglementaire DGR de production (voir
        le bandeau d&apos;explication sur la page elle-même).
      </p>
    ),
  },
  {
    id: "candidates",
    title: "8. Candidats",
    body: (
      <p>
        Liste en lecture seule des candidats réellement inscrits dans Moodle (hors comptes techniques),
        avec leurs compteurs de tentatives. La gestion des comptes (création, mot de passe, inscription)
        reste entièrement dans Moodle — la console n&apos;écrit jamais sur les comptes candidats.
      </p>
    ),
  },
  {
    id: "results",
    title: "9. Résultats",
    body: (
      <p>
        Détail de chaque tentative réelle (candidat, examen, note officielle, réussite/échec, durée),
        directement depuis le carnet de notes Moodle — jamais recalculé par la console. Un badge
        « Périmètre » indique si la tentative appartient à un examen de production, de démonstration ou
        d&apos;entraînement.
      </p>
    ),
  },
  {
    id: "reports",
    title: "10. Rapports",
    body: (
      <p>
        Statistiques agrégées (taux de réussite, note moyenne, durée moyenne) filtrables par examen,
        Fonction DGR et périmètre de données. Utilise exactement la même définition et la même source de
        données que la Vue d&apos;ensemble et les Résultats — les chiffres ne peuvent donc pas diverger entre
        ces pages pour un même périmètre.
      </p>
    ),
  },
  {
    id: "identity-verification",
    title: "11. Vérification d'identité",
    body: (
      <p>
        Enregistrement, par un rôle autorisé (Administrateur / Responsable d&apos;examen / Instructeur), de la
        vérification d&apos;identité effectuée avant un examen (pièce d&apos;identité officielle + contrôle
        supervisé). Aucun document d&apos;identité n&apos;est jamais stocké ; l&apos;enregistrement, une fois créé, ne
        peut pas être modifié ni supprimé.
      </p>
    ),
  },
  {
    id: "incidents",
    title: "12. Incidents techniques",
    body: (
      <p>
        Suivi des incidents techniques signalés (catégorie, priorité, description, historique de statut).
        Stocké dans une table propre à la console, jamais dans Moodle. Tout utilisateur connecté peut
        signaler un incident depuis Aide &amp; support ; Administrateur et Responsable d&apos;examen peuvent
        changer le statut.
      </p>
    ),
  },
  {
    id: "audit-compliance",
    title: "13. Audit & conformité",
    body: (
      <p>
        Vue centrale des 30 contrôles de conformité suivis, chacun avec un statut (Vérifié / Partiel / Non
        configuré / Non applicable) appuyé sur une preuve technique réelle — jamais un statut « Vérifié »
        sans source contrôlée. Regroupée par catégorie (Sécurité, Accessibilité, Banque de questions,
        Gestion des examens, Performance, Rapports &amp; analytique, Conformité réglementaire, Formation &amp;
        préparation, Retours).
      </p>
    ),
  },
  {
    id: "anac-checklist",
    title: "14. Checklist KOST de préparation ANAC",
    body: (
      <p>
        Met en correspondance les 30 contrôles suivis avec les domaines d&apos;audit ANAC généraux qu&apos;ils
        visent à couvrir. C&apos;est une checklist interne KOST, appuyée par des preuves techniques
        vérifiables — <strong className="text-text-primary">pas un document officiel de l&apos;ANAC</strong>, et son
        existence ne constitue en rien une approbation ANAC déjà acquise.
      </p>
    ),
  },
  {
    id: "evidence-pack",
    title: "15. Dossier de preuves",
    body: (
      <p>
        Compile 21 groupes de preuves techniques (TLS, sauvegardes, rôles, banque de questions, etc.) en un
        seul document imprimable/exportable en PDF, prêt à être présenté lors d&apos;un audit. N&apos;inclut
        jamais de secrets (mots de passe, jetons, clés) ni de données personnelles brutes.
      </p>
    ),
  },
  {
    id: "backups",
    title: "16. Sauvegardes",
    body: (
      <p>
        La page Système affiche l&apos;état réel des sauvegardes automatisées (locale, externalisée, test de
        restauration), lu directement depuis le journal de sauvegarde du serveur — jamais une valeur
        supposée. Politique actuelle : 7 sauvegardes quotidiennes, 4 hebdomadaires, 3 mensuelles.
      </p>
    ),
  },
  {
    id: "audit-logs",
    title: "17. Journaux d'audit",
    body: (
      <p>
        Vue en lecture seule du journal d&apos;activité natif de Moodle (connexions, actions, IP), filtrable
        par utilisateur, action, composant. La console ne modifie jamais ce journal.
      </p>
    ),
  },
  {
    id: "presentation-mode",
    title: "18. Mode Présentation",
    body: (
      <p>
        Bouton en haut à droite de chaque page. Une fois activé, il masque à l&apos;écran les noms complets
        (remplacés par des initiales), les e-mails et les adresses IP — utile pour une démonstration devant
        un tiers (par ex. un auditeur ANAC) sans exposer de données personnelles réelles. Il ne modifie
        <strong className="text-text-primary"> jamais</strong> les données sous-jacentes ; désactivé, tout redevient visible
        normalement selon les droits de l&apos;utilisateur connecté.
      </p>
    ),
  },
  {
    id: "exam-procedure",
    title: "19. Procédure générale avant / pendant / après un examen",
    body: (
      <>
        <p><strong className="text-text-primary">Avant :</strong> l&apos;instructeur vérifie la fenêtre d&apos;ouverture de l&apos;examen (page Examens/Sessions), vérifie l&apos;identité du candidat (page Vérification d&apos;identité), puis le candidat se connecte à Moodle avec son propre compte.</p>
        <p className="mt-2"><strong className="text-text-primary">Pendant :</strong> le candidat passe l&apos;examen directement dans Moodle (jamais dans la console). L&apos;instructeur peut suivre les tentatives en direct sur la page Sessions.</p>
        <p className="mt-2"><strong className="text-text-primary">Après :</strong> le résultat officiel est disponible immédiatement sur la page Résultats. Tout incident technique est journalisé via Aide &amp; support → Signaler un incident technique.</p>
      </>
    ),
  },
  {
    id: "support",
    title: "20. Contact / support",
    body: (
      <>
        <p>Pour toute question ou tout problème :</p>
        <ul className="mt-2 list-disc pl-5 flex flex-col gap-1">
          <li>E-mail : <a href="mailto:cbta@kostacademy.com" className="text-accent-9 underline underline-offset-2">cbta@kostacademy.com</a></li>
          <li>WhatsApp : <a href="https://wa.me/213542305383" target="_blank" rel="noreferrer" className="text-accent-9 underline underline-offset-2">+213 542 30 53 83</a></li>
          <li>Page <Link href="/support" className="text-accent-9 underline underline-offset-2">Aide &amp; support</Link> pour les guides complets et la FAQ.</li>
        </ul>
      </>
    ),
  },
];

const SCOPE_NOTE = {
  id: "data-scope",
  title: "Note — Périmètre des données (Production / Démo / Entraînement)",
  body: (
    <>
      <p>
        Cette console classe automatiquement chaque examen, session, résultat et question en Production,
        Démo ou Entraînement — uniquement à partir du nom réel du cours/examen dans Moodle (par exemple
        « ANAC AUDIT DEMO » ou « Practice Test »), jamais par supposition. Les KPI destinés au pilotage
        (Vue d&apos;ensemble, Rapports) affichent par défaut les données de production uniquement ; un filtre
        explicite « Toutes les données » permet d&apos;inclure aussi les démonstrations et entraînements —
        aucune donnée réelle n&apos;est jamais supprimée, seulement filtrée par défaut.
      </p>
    </>
  ),
};

export default function GuidePage() {
  const allSections = [...SECTIONS.slice(0, 10), SCOPE_NOTE, ...SECTIONS.slice(10)];

  return (
    <div className="mx-auto flex max-w-[1100px] gap-8">
      <nav className="no-print hidden lg:block sticky top-[calc(var(--topbar-height)+24px)] h-fit w-[220px] shrink-0">
        <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">Sommaire</p>
        <ul className="flex flex-col gap-0.5">
          {allSections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="block rounded px-2 py-1 text-[12px] text-text-tertiary hover:text-text-primary hover:bg-surface-sunken transition-colors"
              >
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex-1 min-w-0 flex flex-col gap-6">
        <div>
          <h1 className="font-display text-[22px] font-semibold tracking-tight text-text-primary">
            Guide d&apos;utilisation — Console KOST E-EXAM
          </h1>
          <p className="mt-1 text-[13px] text-text-tertiary">
            Explique simplement ce que fait chaque page, à qui elle s&apos;adresse, et d&apos;où viennent les
            données affichées.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {allSections.map((s) => (
            <Card key={s.id} padding="sm" className="scroll-mt-[calc(var(--topbar-height)+16px)]">
              <h2 id={s.id} className="font-display text-[14px] font-semibold text-text-primary mb-2">
                {s.title}
              </h2>
              <div className="text-[13px] leading-relaxed text-text-secondary">{s.body}</div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
