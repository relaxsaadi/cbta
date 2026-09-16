// Source unique des 5 guides KOST E-EXAM (addendum §12-17) — consommée à
// la fois par les écrans /guide/* (app/(app)/guide/) ET par le PDF
// téléchargeable (lib/pdf/GuideDocument.tsx, app/api/reports/guide/[slug]),
// pour qu'écran et PDF ne divergent jamais. Ces guides décrivent les
// workflows disponibles. Les garanties d'intégrité/sécurité encore sous
// audit ne doivent pas être présentées comme clôturées ; vérifier l'état de
// readiness avant tout usage production.
export interface GuideSection {
  heading: string;
  steps?: string[];
  paragraphs?: string[];
}

export interface Guide {
  slug: string;
  title: string;
  audience: string;
  intro: string;
  sections: GuideSection[];
}

export const GUIDES: Record<string, Guide> = {
  candidat: {
    slug: "candidat",
    title: "Guide candidat",
    audience: "Candidat",
    intro: "Ce guide décrit le parcours complet d'un candidat sur KOST E-EXAM, de la connexion à la consultation de son résultat.",
    sections: [
      {
        heading: "Passer un examen",
        steps: [
          "Se connecter avec votre identifiant et mot de passe.",
          "« Mes examens » — la liste de vos examens affectés apparaît sur cette page (affectés soit à tout votre groupe, soit individuellement à vous).",
          "Ouvrir un examen disponible.",
          "Lire attentivement les instructions (durée, nombre de questions, tentatives autorisées).",
          "Cliquer sur « Commencer l'examen » — le chronomètre démarre alors, calculé côté serveur (pas votre navigateur) : fermer l'onglet ou perdre la connexion ne l'arrête pas.",
          "Répondre aux questions, naviguer librement entre elles avant de soumettre.",
          "Soumettre — manuellement, ou automatiquement si le temps est écoulé.",
        ],
      },
      {
        heading: "Consulter son résultat",
        paragraphs: [
          "« Mes résultats » liste vos tentatives. Le score, le détail question par question et le téléchargement PDF ne sont visibles que si l'examen a été configuré pour les révéler, et — pour un examen à correction différée — seulement une fois la date d'ouverture des résultats atteinte.",
        ],
        steps: [
          "« Mes résultats » — consulter le score et le statut (ADMIS/ÉCHEC) si autorisé.",
          "Cliquer « PDF » (quand disponible) pour télécharger votre propre rapport individuel, simple ou détaillé selon ce que l'examen autorise.",
        ],
      },
      {
        heading: "Ce que vous ne pouvez jamais faire",
        paragraphs: [
          "Voir le résultat ou le rapport d'un autre candidat, même en devinant une URL — chaque accès est vérifié côté serveur, pas seulement masqué à l'écran.",
          "Dépasser le nombre de tentatives autorisées, ni rouvrir une tentative déjà soumise.",
          "Démarrer une nouvelle tentative pendant une maintenance plateforme déclarée — une tentative déjà en cours, elle, n'est jamais interrompue.",
        ],
      },
    ],
  },

  "responsable-pedagogique": {
    slug: "responsable-pedagogique",
    title: "Guide responsable pédagogique",
    audience: "Responsable pédagogique",
    intro: "Ce guide décrit le parcours complet, de la création d'un client jusqu'aux rapports et exports, dans le périmètre de vos propres clients/groupes.",
    sections: [
      {
        heading: "Mettre en place un client et un groupe",
        steps: [
          "Créer le client (page « Clients »).",
          "Créer un groupe pour ce client (page « Groupes ») — un groupe correspond à une session/promotion de candidats.",
          "Ajouter les candidats au groupe.",
        ],
      },
      {
        heading: "Créer et publier une évaluation",
        steps: [
          "« Préparation des examens » → choisir le type : Exercice, Test ou Examen (chacun avec des réglages par défaut différents — tentatives, correction immédiate ou différée).",
          "Choisir la fonction DGR concernée et vérifier le nombre de questions admissibles disponibles avant de fixer le nombre à tirer.",
          "Définir la durée et le seuil de réussite.",
          "Publier — à cet instant, le contenu principal de la question (énoncé, choix, réponse correcte, explication et points) est snapshoté pour l'examen. L'immuabilité complète du type de question et de la provenance réglementaire/reviewer reste un gate de readiness avant usage production ; ne pas présenter cette garantie comme acquise tant que ces gates ne sont pas clôturés.",
        ],
      },
      {
        heading: "Affecter les candidats (§1-2)",
        paragraphs: [
          "À la publication, l'écran demande explicitement : « À qui affecter cet examen ? » — trois choix possibles : tout le groupe, certains candidats du groupe, ou un candidat individuel. Un candidat hors du groupe ou hors de votre périmètre est toujours rejeté avec un message explicite ; aucune affectation partielle n'est jamais créée.",
          "Après publication, la fiche de l'évaluation permet d'affecter d'autres candidats du groupe, ou de retirer un candidat qui n'a pas encore commencé.",
        ],
      },
      {
        heading: "Suivre et consulter les résultats",
        steps: [
          "Suivre les candidats depuis la fiche de l'évaluation (non commencé / en cours / terminé).",
          "« Résultats » — filtrer par client, groupe, fonction, examen, candidat, date ou réussite/échec.",
          "Cliquer sur un candidat pour voir le détail complet d'une tentative : identité, tentative, résultat, question par question.",
        ],
      },
      {
        heading: "Rapports et exports (§5-8)",
        steps: [
          "« Rapport global » (sur la fiche d'une évaluation publiée) — statistiques agrégées (admis/échecs, moyenne, taux de réussite), avec avertissement si trop peu de candidats pour être représentatif.",
          "« Liste officielle CSV/PDF » — liste nominative des résultats, prête à archiver ou faire signer.",
          "Rapport individuel PDF (simple ou détaillé) — depuis le détail d'une tentative.",
          "Export CSV résumé ou détaillé — depuis « Résultats », avec les mêmes filtres que l'écran.",
        ],
      },
      {
        heading: "Familiarisation (§18-21)",
        paragraphs: [
          "Avant l'examen réel, une session de familiarisation peut être déclarée sur « Familiarisation » : elle crée automatiquement une ligne de présence pour chaque candidat actuellement dans le groupe. La présence se coche individuellement sur la fiche de la session, qui affiche aussi l'historique de familiarisation déjà connu pour chaque candidat (nombre de sessions précédentes, date et statut de la dernière).",
          "La feuille de présence (PDF) liste nominativement chaque candidat avec sa propre zone de signature — document distinct de la liste officielle des résultats, à faire signer le jour de la familiarisation.",
        ],
      },
      {
        heading: "Sécurité et incidents",
        paragraphs: [
          "Vous pouvez déclarer un incident pour l'un de vos groupes (jamais un incident « plateforme », réservé à l'administrateur). Voir le « Guide de session » pour la conduite à tenir en cas d'incident pendant une session en cours, et la procédure incident (PDF) pour le détail complet des actions disponibles.",
        ],
      },
    ],
  },

  administrateur: {
    slug: "administrateur",
    title: "Guide administrateur",
    audience: "Administrateur",
    intro: "L'administrateur dispose d'un périmètre global (tous les clients) et des actions réservées de sécurité/plateforme, en plus de tout ce que peut faire un responsable pédagogique.",
    sections: [
      {
        heading: "Domaines de responsabilité",
        steps: [
          "« Utilisateurs » — créer des comptes, attribuer un rôle, suspendre/réactiver.",
          "« Banque de questions » — ajouter des questions vérifiées, consulter le statut source de chaque fonction.",
          "« Examens » — créer, publier, suspendre, réouvrir, clôturer n'importe quelle évaluation, tous clients confondus.",
          "« Familiarisation » — déclarer des sessions et suivre la présence, tous clients confondus.",
          "« Résultats » — mêmes filtres et exports qu'un responsable, sans restriction de périmètre.",
          "« Journal d'audit » — consultation seule, en écriture seule par conception (aucune entrée n'est jamais modifiée ni supprimée). La complétude transactionnelle des événements critiques reste un gate de readiness tant que les blockers d'audit ouverts ne sont pas clôturés.",
          "« Sauvegarde & restauration » — état des dernières sauvegardes et tests de restauration.",
        ],
      },
      {
        heading: "Sécurité — Incidents (§9-11)",
        paragraphs: [
          "Seul l'administrateur dispose des actions plateforme : activer/désactiver le mode maintenance, bloquer/débloquer les nouvelles connexions, bloquer/débloquer les nouvelles tentatives. Le mode maintenance bloque les deux en un seul geste ; l'administrateur reste toujours exempté du blocage de connexion, pour pouvoir le lever. Une tentative déjà en cours n'est jamais interrompue par ces actions.",
          "Actions ciblées disponibles pour tout incident : suspendre/réactiver un compte, révoquer ses sessions, suspendre/réouvrir un examen précis, rattacher une preuve, consigner une note ou une mesure corrective, clôturer l'incident.",
          "Voir la « Procédure incident » (PDF, téléchargeable depuis « Incidents ») pour le détail complet : classification, scénarios de panne, continuité, reprise, clôture.",
        ],
      },
    ],
  },

  auditeur: {
    slug: "auditeur",
    title: "Guide auditeur",
    audience: "Auditeur",
    intro: "L'auditeur a un accès en lecture sur l'ensemble du périmètre (tous les clients), sans jamais pouvoir modifier quoi que ce soit — appliqué côté serveur, pas seulement masqué à l'écran.",
    sections: [
      {
        heading: "Accès",
        paragraphs: [
          "Chaque page consultable applique le même filtrage de périmètre qu'un responsable/administrateur, mais sans jamais afficher ni accepter de bouton d'écriture. Une tentative d'appel serveur direct sur une action réservée à l'écriture est refusée, même en la déclenchant hors de l'écran normal.",
        ],
      },
      {
        heading: "Sections consultables",
        steps: [
          "Clients, Groupes — vue globale, tous clients confondus.",
          "Examens et paramètres — vue globale.",
          "Familiarisation — sessions et présence, feuille de présence PDF.",
          "Résultats et réponses — mêmes filtres et exports CSV qu'un responsable/administrateur.",
          "Rapport global de session, liste officielle des résultats, rapports individuels — tous téléchargeables en PDF.",
          "Incidents — historique complet, y compris la procédure incident (PDF).",
          "Journal d'audit — consultation de la traçabilité enregistrée. La complétude failure-atomic des événements critiques reste un gate de readiness avant production tant que les blockers d'audit ouverts ne sont pas clôturés.",
          "Sauvegardes / restauration — état de la politique de continuité.",
        ],
      },
    ],
  },

  session: {
    slug: "session",
    title: "Guide de session",
    audience: "Responsable pédagogique / Administrateur",
    intro:
      "Ce guide décrit le déroulement opérationnel d'une session d'examen réelle — du jour de préparation au jour de clôture — en s'appuyant sur les capacités déjà décrites dans les autres guides. C'est un guide de conduite, pas un nouveau module : chaque étape renvoie à l'écran réel qui la réalise.",
    sections: [
      {
        heading: "Avant la session — préparation",
        steps: [
          "Vérifier que le groupe/session est complet (tous les candidats attendus sont ajoutés au groupe).",
          "Si une familiarisation est prévue, l'enregistrer (voir « Familiarisation ») et faire signer la feuille de présence correspondante — distincte de la présence à l'examen lui-même.",
          "Créer et publier l'évaluation, avec le mode d'affectation adapté (tout le groupe / certains candidats / un candidat individuel).",
          "Vérifier le nombre de questions admissibles disponibles pour la fonction DGR concernée avant de fixer les paramètres définitifs.",
        ],
      },
      {
        heading: "Le jour de la session",
        steps: [
          "Vérifier sur « Sessions actives » que les candidats attendus se connectent normalement, dans votre périmètre.",
          "Suivre la progression depuis la fiche de l'évaluation (non commencé / en cours / terminé) en temps réel.",
          "En cas d'anomalie touchant UN candidat ou UN examen précis (question contestée, problème de connexion isolé) : ne pas bloquer toute la session — utiliser les actions ciblées (suspendre cet examen précis, révoquer les sessions d'un compte) plutôt qu'une action plateforme.",
          "En cas d'anomalie touchant TOUTE la plateforme (panne, cyberattaque suspectée) : déclarer un incident, envisager le mode maintenance — voir « Procédure incident » (PDF) pour la conduite complète. Les tentatives déjà en cours ne sont jamais interrompues par cette décision.",
        ],
      },
      {
        heading: "Après la session — clôture",
        steps: [
          "Une fois toutes les tentatives terminées, consulter le « Rapport global » de l'évaluation (statistiques, avertissement si échantillon trop petit pour être représentatif).",
          "Télécharger la « Liste officielle » (PDF et/ou CSV) pour archivage.",
          "Exporter le CSV détaillé si une analyse plus fine est nécessaire (filtrable par candidat, date, résultat).",
          "Si un incident a été ouvert pendant la session, le clôturer une fois l'investigation et les mesures correctives consignées.",
        ],
      },
    ],
  },
};

export function listGuides(): Guide[] {
  return Object.values(GUIDES);
}

export function getGuide(slug: string): Guide | undefined {
  return GUIDES[slug];
}
