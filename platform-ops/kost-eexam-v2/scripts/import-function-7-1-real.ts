// Importeur contrôlé — Fonction 7.1, contenu réel FROZEN FR / SOURCE VERIFIED
// UNIQUEMENT. §31 de la mission originale + phase "STAGING DEPLOY + REAL
// DGR PILOT" : ne jamais fabriquer de contenu réglementaire, importer
// uniquement ce qui est déjà vérifié et dont le texte complet est
// récupérable.
//
// Source : docs/DGR_PRODUCTION_BANK_7.1.md sur la branche
// `ai/dgr-stage2b-handoff` (programme de vérification Tier A séparé, non
// touché — §32), commit 759da21 (2026-08-25), lu en lecture seule via
// `git show origin/ai/dgr-stage2b-handoff:docs/DGR_PRODUCTION_BANK_7.1.md`,
// sans checkout ni fusion de cette branche.
//
// Périmètre réel de ce qui est importable depuis CET environnement :
// - Fonction 7.1 compte 19 items au total (Q-7.1-001 à Q-7.1-019).
// - 18 sont FROZEN FR / SOURCE VERIFIED ; 1 (Q-7.1-001) est
//   FR SOURCE GAP CONFIRMED (exclu, non FROZEN).
// - Parmi les 18 FROZEN, seuls CES 7 (Q-7.1-013 à Q-7.1-019) ont un texte
//   complet (énoncé + choix + réponse) récupérable DEPUIS CE DÉPÔT GIT.
// - Les 10 autres FROZEN (partie du "pilote" Q-7.1-002–012) ont leur texte
//   complet uniquement dans la base Moodle en production (catégorie 18,
//   déplacés depuis la catégorie 16 lors du pilote du 25/08/2026) — non
//   accessible depuis cet environnement (aucun accès direct à la base
//   MySQL Moodle depuis ce sandbox). Non importés ici — pas une omission
//   silencieuse, documentée explicitement dans le rapport final de phase.
// - 5 FROZEN supplémentaires (Q-7.1-005/007/008/010/012) n'ont de texte
//   complet récupérable nulle part dans ce dépôt (constat déjà établi par
//   une session précédente, cf. docs/DGR_MOODLE_BANK_INTEGRATION_PLAN.md
//   §5bis) — non importés, jamais reconstruits par inférence.
//
// AUCUNE approbation réviseur qualifié (4e palier) n'existe encore pour ces
// items — chaque champ `reviewer_status` reste 'PENDING' ici, jamais
// 'APPROVED' silencieusement. Voir docs/DGR_SOURCE_REGISTER.md (branche
// ai/dgr-stage2b-handoff) pour les citations complètes.
import { getDb, closeDb } from "../lib/db";
import { createQuestion, type Choice } from "../lib/questions";

interface RealItem {
  id: string;
  subtask: string;
  qtype: "mcq_single" | "true_false";
  stem: string;
  choices: Choice[];
  correct: string[];
  reference: string;
  verificationDate: string;
  explanation: string;
}

// Transcription fidèle depuis docs/DGR_PRODUCTION_BANK_7.1.md — aucun mot
// modifié par rapport à la source. Les choix sont dans l'ordre du document
// source ; le mélange candidat par candidat se fait ailleurs (par
// tentative), jamais en modifiant l'ordre canonique stocké ici.
const ITEMS: RealItem[] = [
  {
    id: "Q-7.1-013",
    subtask: "0.1.1 Comprendre la définition",
    qtype: "mcq_single",
    stem: "Au-delà du critère de danger pour la santé, la sécurité, la propriété ou l'environnement, quel second critère permet de qualifier un produit, article ou substance de « marchandise dangereuse » au sens du DGR ?",
    choices: [
      { key: "A", text: "Il figure dans la liste des marchandises dangereuses du règlement, ou il est classé conformément à ce règlement." },
      { key: "B", text: "Il est transporté par voie aérienne commerciale." },
      { key: "C", text: "Il nécessite un emballage de spécification ONU." },
      { key: "D", text: "Il est accompagné d'une fiche de données de sécurité (SDS)." },
    ],
    correct: ["A"],
    reference: "DGR 67e éd. 2026, §1.0 Définition des marchandises dangereuses (Partie 1)",
    verificationDate: "2026-08-25",
    explanation:
      "DGR 67e Ed. 2026 §1.0 : une marchandise dangereuse doit à la fois présenter un danger (santé/sécurité/propriété/environnement) ET figurer dans la liste du règlement ou être classée conformément à celui-ci.",
  },
  {
    id: "Q-7.1-014",
    subtask: "0.1.2 Reconnaître le cadre juridique (mondial, national)",
    qtype: "mcq_single",
    stem: "Selon la hiérarchie réglementaire présentée dans le cours, quel organisme élabore la réglementation pour le transport aérien sécuritaire des marchandises dangereuses, codifiée dans l'Annexe 18 et les Instructions techniques (IT) de l'OACI ?",
    choices: [
      { key: "A", text: "OACI — Organisation de l'Aviation Civile Internationale" },
      { key: "B", text: "IATA — Association Internationale du Transport Aérien" },
      { key: "C", text: "SCoETDG — Sous-comité d'experts du Conseil économique et social des Nations Unies" },
      { key: "D", text: "AIEA — Agence internationale de l'énergie atomique" },
    ],
    correct: ["A"],
    reference: "DGR 67e éd. 2026, §1.1.1–1.1.4 (Partie 1)",
    verificationDate: "2026-08-25",
    explanation:
      "L'OACI codifie la réglementation du transport aérien des marchandises dangereuses dans l'Annexe 18 et les IT (Doc 9284). L'IATA DGR reprend et renforce ces spécifications, sans en être la source de codification.",
  },
  {
    id: "Q-7.1-015",
    subtask: "0.1.3 Déterminer l'application et la portée",
    qtype: "true_false",
    stem: "Vrai ou Faux : le champ d'application du DGR de l'IATA (DGR 1.2.1) inclut les expéditeurs et agents qui proposent des envois de marchandises dangereuses à un exploitant d'aéronef, en plus des exploitants membres ou membres associés de l'IATA et des parties à l'accord multilatéral de trafic intercompagnies de l'IATA-fret.",
    choices: [
      { key: "A", text: "Vrai" },
      { key: "B", text: "Faux" },
    ],
    correct: ["A"],
    reference: "DGR 67e éd. 2026, §1.2.1 Application (Partie 1)",
    verificationDate: "2026-08-25",
    explanation:
      "Le DGR IATA s'applique aux exploitants membres/membres associés, aux parties à l'accord multilatéral de trafic intercompagnies, ET aux expéditeurs/agents proposant des envois de MD — les trois catégories sont explicitement listées.",
  },
  {
    id: "Q-7.1-016",
    subtask: "0.2.2 Reconnaître les marchandises dangereuses potentiellement cachées",
    qtype: "mcq_single",
    stem: "D'après la liste d'exemples de marchandises dangereuses potentiellement cachées présentée dans le cours (DGR 2.2.4), lequel des éléments suivants y figure explicitement ?",
    choices: [
      { key: "A", text: "Échantillons de diagnostic" },
      { key: "B", text: "Vêtements neufs sous emballage plastique" },
      { key: "C", text: "Livres et documents imprimés" },
      { key: "D", text: "Denrées alimentaires non réfrigérées" },
    ],
    correct: ["A"],
    reference: "DGR 67e éd. 2026, §2.2.4 (Partie 2)",
    verificationDate: "2026-08-25",
    explanation:
      "La liste DGR 2.2.4 inclut explicitement les échantillons diagnostiques, parmi d'autres exemples de marchandises dangereuses cachées (pièces AOG, régulateurs de carburant, réfrigérateurs, kits de réparation, échantillons pour essais).",
  },
  {
    id: "Q-7.1-017",
    subtask: "0.2.3 Être au courant des dispositions s'appliquant aux passagers",
    qtype: "true_false",
    stem: "Vrai ou Faux : selon le cours (DGR 2.3), les marchandises dangereuses, y compris les colis exceptés de matières radioactives, sont interdites au transport par les passagers ou l'équipage — que ce soit comme ou dans les bagages enregistrés, en bagage à main, ou sur leur personne — sauf dans les cas expressément autorisés par le règlement pour un usage personnel.",
    choices: [
      { key: "A", text: "Vrai" },
      { key: "B", text: "Faux" },
    ],
    correct: ["A"],
    reference: "DGR 67e éd. 2026, §2.3.0.1 (Partie 2)",
    verificationDate: "2026-08-25",
    explanation:
      "Le DGR interdit le transport de MD par les passagers/équipage (bagages enregistrés, bagage à main, ou sur soi), sauf exceptions prévues aux §2.3.2 à 2.3.5 pour usage personnel.",
  },
  {
    id: "Q-7.1-018",
    subtask: "0.4.1 Trouver de l'information générale sur les classes et les divisions",
    qtype: "mcq_single",
    stem: "Selon le cours (DGR 3.0.2), à quelle classe de marchandises dangereuses appartiennent l'acide sulfurique et l'acide de batterie ?",
    choices: [
      { key: "A", text: "Classe 8 — Matières corrosives" },
      { key: "B", text: "Classe 3 — Liquides inflammables" },
      { key: "C", text: "Division 6.1 — Substances toxiques" },
      { key: "D", text: "Classe 9 — Matières et objets dangereux divers" },
    ],
    correct: ["A"],
    reference: "DGR 67e éd. 2026, Table 4.2 UN1830 (Partie 4) + Appendice A",
    verificationDate: "2026-08-25",
    explanation:
      "UN1830 (acide sulfurique, >51%) est classé Classe 8, étiquette « Corrosif » (Table 4.2). Citation corrigée par rapport au support de cours original : §3.0.2 est une taxonomie sans exemples de substances, la preuve réelle est en Table 4.2 + Appendice A.",
  },
  {
    id: "Q-7.1-019",
    subtask: "0.5.1 Reconnaître les prescriptions de base concernant le marquage",
    qtype: "mcq_single",
    stem: "D'après le DGR 67e édition (§7.1.3.2 Qualité), quelles sont les quatre caractéristiques que doivent respecter les marques apposées sur un colis de marchandises dangereuses ?",
    choices: [
      { key: "A", text: "Durables, facilement visibles et lisibles, pouvant être exposées aux intempéries sans dégradation notable, et apposées sur un fond de couleur contrastante." },
      { key: "B", text: "Colorées, numérotées, plastifiées et amovibles." },
      { key: "C", text: "Imprimées uniquement en anglais, certifiées ISO, et scellées." },
      { key: "D", text: "Visibles et lisibles, mais sans exigence de durabilité ni de résistance aux intempéries." },
    ],
    correct: ["A"],
    reference: "DGR 67e éd. 2026, §7.1.3.2 Qualité (Partie 7 — Marquage et Étiquetage)",
    verificationDate: "2026-08-25",
    explanation:
      "§7.1.3.2 : les marques doivent être (a) durables, (b) facilement visibles et lisibles, (c) pouvoir être exposées aux intempéries sans dégradation notable, et (d) apposées sur un fond de couleur contrastante. Contenu corrigé par rapport au support de cours original (citation « DGR 6.0.4.2.1(c) » inexistante dans l'édition actuelle ; le cours omettait le 4e critère).",
  },
];

function main() {
  const db = getDb();
  const adminRow = db.prepare(`SELECT u.id AS id FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id WHERE r.code='administrator' ORDER BY u.id LIMIT 1`).get() as { id: number } | undefined;
  if (!adminRow) {
    console.error("Aucun compte administrateur trouvé — créer les comptes de rôle avant d'importer (scripts/seed-staging.ts).");
    process.exit(1);
  }
  const adminId = adminRow.id;

  let imported = 0;
  let skipped = 0;
  for (const item of ITEMS) {
    const existing = db.prepare(`SELECT id FROM questions WHERE kost_question_id = ?`).get(item.id);
    if (existing) {
      console.log(`${item.id} — déjà présent, ignoré (pas de doublon).`);
      skipped++;
      continue;
    }
    createQuestion({
      kostQuestionId: item.id,
      functionCode: "7.1",
      subtask: item.subtask,
      qtype: item.qtype,
      language: "fr",
      sourceStatus: "FROZEN_SOURCE_VERIFIED",
      regulatoryReference: item.reference,
      stem: item.stem,
      choices: item.choices,
      correctAnswer: item.correct,
      explanation: item.explanation,
      createdBy: adminId,
    });
    // verification_date et reviewer_status ('PENDING' par défaut, jamais
    // 'APPROVED' silencieusement) — le champ verification_date est posé
    // séparément ici car createQuestion() ne le déduit que du statut source
    // au moment de la création (voir lib/questions.ts) ; on le fixe à la
    // date réelle de vérification Tier A documentée dans la source, pas la
    // date d'exécution de ce script.
    db.prepare(`UPDATE questions SET verification_date = ? WHERE kost_question_id = ?`).run(item.verificationDate, item.id);
    console.log(`${item.id} importé — FROZEN_SOURCE_VERIFIED, réviseur: PENDING (pas encore approuvé).`);
    imported++;
  }

  console.log(`\n${imported} question(s) réelle(s) importée(s), ${skipped} déjà présente(s).`);
  console.log("Statut réviseur qualifié : PENDING pour les 7 — l'approbation à 4 paliers reste une étape séparée, non complétée.");
  closeDb();
}

main();
