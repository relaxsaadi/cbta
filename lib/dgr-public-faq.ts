/**
 * Public-facing DGR FAQ source of truth.
 *
 * Keep both the visible FAQ and FAQPage JSON-LD aligned by consuming this
 * single dataset. Claims about accreditation, compulsory certification,
 * universal acceptance, examinations, fees and recurrence remain on evidence
 * hold until confirmed for the relevant course and jurisdiction.
 */
export const PUBLIC_DGR_FAQ = [
  {
    q: "La formation IATA DGR est-elle obligatoire pour tous les transitaires ?",
    a: "Les exigences de formation aux marchandises dangereuses dépendent des tâches réellement exercées, du transport concerné et des règles applicables. L'obligation de suivre un cours ou d'obtenir un certificat commercial précis ne doit pas être présumée pour tous les transitaires. Le besoin est à vérifier avec l'employeur et l'autorité ou l'exploitant concernés.",
  },
  {
    q: "Comment choisir une fonction CBTA entre 7.1 et 7.10 ?",
    a: "La fonction et le programme de formation sont déterminés par l'analyse des tâches et compétences du poste, puis vérifiés à partir du référentiel CBTA applicable. Un secteur d'activité ou un intitulé de poste ne suffit pas à attribuer automatiquement une fonction.",
  },
  {
    q: "Le certificat est-il reconnu dans mon pays et par toutes les compagnies aériennes ?",
    a: "La reconnaissance d'un document de formation dépend de sa nature, de l'émetteur, des exigences de l'autorité compétente et de celles de l'exploitant ou de l'employeur. Nous ne présumons aucune reconnaissance universelle ; demandez la description écrite du document délivré et vérifiez son acceptation auprès des organismes concernés.",
  },
  {
    q: "S'agit-il d'un examen officiel IATA ?",
    a: "Les modalités d'évaluation et la nature exacte du document délivré doivent être précisées dans le programme et la proposition de formation. Une évaluation organisée par un centre ne doit pas être présentée automatiquement comme un examen officiel ou comme une certification directement délivrée par IATA.",
  },
  {
    q: "Combien de temps la qualification reste-t-elle valable ?",
    a: "Les échéances de formation périodique ou de remise à niveau doivent être établies d'après les exigences réglementaires, de l'autorité et de l'exploitant applicables au poste. Aucune durée unique n'est annoncée ici pour tous les participants et tous les pays.",
  },
  {
    q: "Quelle est la différence entre une formation HSE générale et une formation DGR aérien ?",
    a: "Les formations HSE, routières et de marchandises dangereuses par voie aérienne couvrent des besoins et des référentiels différents. Le choix dépend des tâches et du mode de transport ; une formation générale ne remplace pas nécessairement les compétences particulières exigées pour le fret aérien.",
  },
  {
    q: "Peut-on suivre les sessions en français ou en anglais ?",
    a: "La langue d'enseignement, les supports et la langue de l'évaluation sont à confirmer pour chaque session. Les contenus réglementaires français et anglais doivent être vérifiés séparément avant utilisation en examen.",
  },
  {
    q: "Proposez-vous des formations intra-entreprise ou à distance ?",
    a: "La possibilité d'une session intra-entreprise, du déplacement du formateur ou d'un parcours à distance se confirme au cas par cas, selon le programme, les exigences applicables et l'organisation de la session.",
  },
  {
    q: "Comment connaître les tarifs, prérequis et dates de formation ?",
    a: "Demandez une proposition écrite précisant les tâches couvertes, les prérequis, les dates, la langue, l'évaluation, la nature du document remis et le prix. Aucun tarif, calendrier ou disponibilité n'est garanti par cette FAQ.",
  },
] as const;
