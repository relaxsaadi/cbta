// Procédure incident / cyberattaque / interruption de service (addendum
// §9-11). Document de POLITIQUE — texte statique, mais décrivant
// EXCLUSIVEMENT des capacités réellement implémentées (lib/incidents.ts,
// lib/platform-settings.ts, app/(app)/incidents/) — jamais une capacité
// aspirationnelle. Toute modification de ces fichiers doit se répercuter
// ici.
import { Document, Page, View, Text } from "@react-pdf/renderer";
import { pdfStyles, pdfSafeText } from "./theme";
import { PdfHeader, PdfFooter, type DocumentMeta } from "./DocumentChrome";

const P = { fontSize: 9, color: "#1a1a1a", marginBottom: 6, lineHeight: 1.4 } as const;
const LI = { fontSize: 9, color: "#1a1a1a", marginBottom: 4, lineHeight: 1.4, marginLeft: 10 } as const;
const H3 = { fontSize: 10, fontWeight: 700, color: "#0f1f3d", marginTop: 10, marginBottom: 5 } as const;

export function IncidentProcedureDocument({ meta }: { meta: DocumentMeta }) {
  return (
    <Document title={meta.docTitle} author="KOST E-EXAM" creator="KOST E-EXAM">
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader meta={meta} />

        <Text style={pdfStyles.h2}>1. Objet et portée</Text>
        <Text style={P}>
          Cette procédure décrit la réponse à un incident affectant KOST E-EXAM : anomalie technique, tentative
          d&apos;intrusion ou cyberattaque, interruption de service, ou tout événement compromettant l&apos;intégrité
          d&apos;une session d&apos;examen. Elle décrit uniquement des capacités réellement implémentées dans
          l&apos;application — chaque action listée en section 4 est un bouton réel, avec un effet réel et une trace
          automatique, pas une simple recommandation textuelle.
        </Text>

        <Text style={pdfStyles.h2}>2. Détection et déclaration</Text>
        <Text style={P}>
          Tout responsable pédagogique ou administrateur peut déclarer un incident via l&apos;écran « Incidents »
          {" "}{pdfSafeText("→")}{" "}
          « Déclarer un incident ». Le formulaire capture : le type d&apos;incident, la sévérité, une description, le
          système concerné, les personnes concernées, et — pour un responsable pédagogique — le groupe/client concerné
          (obligatoire, restreint à son propre périmètre). Un administrateur peut en plus déclarer un incident «
          plateforme » (sans client spécifique), visible de tous les responsables. La déclaration crée un
          enregistrement horodaté, tracé dans le journal d&apos;audit (action <Text style={{ fontWeight: 700 }}>incident_declare</Text>).
        </Text>

        <Text style={pdfStyles.h2}>3. Classification</Text>
        <Text style={P}>Chaque incident porte une sévérité parmi quatre niveaux, choisie à la déclaration et consultable à tout moment sur la fiche incident :</Text>
        <Text style={LI}>• <Text style={{ fontWeight: 700 }}>Faible (low)</Text> — impact limité, aucune action immédiate requise, suivi normal.</Text>
        <Text style={LI}>• <Text style={{ fontWeight: 700 }}>Moyenne (medium)</Text> — impact circonscrit (un examen, un compte), investigation à mener.</Text>
        <Text style={LI}>• <Text style={{ fontWeight: 700 }}>Élevée (high)</Text> — impact sur plusieurs candidats/examens, action immédiate probable.</Text>
        <Text style={LI}>• <Text style={{ fontWeight: 700 }}>Critique (critical)</Text> — impact plateforme (ex. cyberattaque, compromission), mode maintenance à envisager.</Text>

        <Text style={pdfStyles.h2}>4. Actions immédiates disponibles</Text>
        <Text style={P}>
          Depuis la fiche incident, un administrateur dispose des actions réelles suivantes (chacune génère un effet
          immédiat ET une trace dans « Actions tracées » sur cette même fiche, ainsi qu&apos;une entrée dans le journal
          d&apos;audit global) :
        </Text>

        <Text style={H3}>4.1 Actions plateforme (portée globale)</Text>
        <Text style={LI}>• <Text style={{ fontWeight: 700 }}>Activer / désactiver le mode maintenance</Text> — bloque en un seul geste les nouvelles connexions ET le démarrage de nouvelles tentatives, pour tous les rôles sauf administrateur (qui reste toujours en mesure de se connecter pour lever le blocage).</Text>
        <Text style={LI}>• <Text style={{ fontWeight: 700 }}>Bloquer / débloquer les nouvelles connexions</Text> — action indépendante, pour une réponse plus ciblée sans passer par le mode maintenance complet.</Text>
        <Text style={LI}>• <Text style={{ fontWeight: 700 }}>Bloquer / débloquer les nouvelles tentatives</Text> — empêche le démarrage de toute NOUVELLE tentative d&apos;examen sur la plateforme (voir règle de continuité, section 5).</Text>

        <Text style={H3}>4.2 Actions ciblées (compte / examen)</Text>
        <Text style={LI}>• <Text style={{ fontWeight: 700 }}>Suspendre / réactiver un compte</Text> — bloque immédiatement toute nouvelle connexion de ce compte ; la suspension révoque en même temps toutes ses sessions actives.</Text>
        <Text style={LI}>• <Text style={{ fontWeight: 700 }}>Révoquer les sessions</Text> — déconnecte immédiatement un compte de tous ses appareils, sans le suspendre.</Text>
        <Text style={LI}>• <Text style={{ fontWeight: 700 }}>Suspendre / réouvrir un examen</Text> — bloque l&apos;accès à un examen précis sans affecter les autres.</Text>

        <Text style={H3}>4.3 Investigation et traçabilité</Text>
        <Text style={LI}>• <Text style={{ fontWeight: 700 }}>Rattacher une preuve</Text> — consigne une référence/description de preuve (capture, journal externe, témoignage) horodatée sur la fiche incident.</Text>
        <Text style={LI}>• <Text style={{ fontWeight: 700 }}>Ajouter une note d&apos;investigation</Text> — consigne l&apos;avancement de l&apos;investigation.</Text>
        <Text style={LI}>• <Text style={{ fontWeight: 700 }}>Consigner une mesure corrective</Text> — documente la correction apportée.</Text>
        <Text style={LI}>• <Text style={{ fontWeight: 700 }}>Clôturer l&apos;incident</Text> — passe le statut à « clôturé » ; aucune action supplémentaire n&apos;est ensuite proposée sur cette fiche.</Text>

        <PdfFooter meta={meta} />
      </Page>

      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader meta={meta} />

        <Text style={pdfStyles.h2}>5. Règles de continuité d&apos;examen</Text>
        <Text style={P}>
          Principe directeur : une tentative DÉJÀ EN COURS n&apos;est jamais interrompue par une action de confinement.
          Seul le démarrage de NOUVELLES tentatives peut être bloqué.
        </Text>
        <Text style={LI}>• <Text style={{ fontWeight: 700 }}>Mode maintenance / blocage des nouvelles tentatives actif</Text> — un candidat déjà en train de composer peut continuer et soumettre normalement ; seul un candidat qui n&apos;a pas encore démarré reçoit un message explicite l&apos;informant que le démarrage est temporairement suspendu.</Text>
        <Text style={LI}>• <Text style={{ fontWeight: 700 }}>Examen suspendu individuellement</Text> — seul cet examen devient inaccessible (candidats non affectés sur d&apos;autres examens) ; sa réouverture restaure l&apos;accès sans recréer les tentatives déjà notées.</Text>
        <Text style={LI}>• <Text style={{ fontWeight: 700 }}>Compte suspendu</Text> — ses sessions actives sont révoquées immédiatement ; une tentative en cours sur ce compte devient donc inaccessible à l&apos;utilisateur (cas volontairement différent : la suspension de compte cible une personne, pas la continuité d&apos;un examen).</Text>

        <Text style={pdfStyles.h2}>6. Scénarios de panne — conduite à tenir</Text>
        <Text style={H3}>Panne infrastructure générale (serveur, réseau)</Text>
        <Text style={P}>Déclarer un incident plateforme (sévérité élevée/critique). Activer le mode maintenance dès que la cause n&apos;est pas immédiatement résolue, pour éviter que de nouveaux candidats démarrent une tentative vouée à échouer. Les tentatives déjà en cours reprennent normalement dès le retour du service (aucune donnée de tentative n&apos;est perdue — voir §13 sauvegarde/restauration, documenté séparément sur l&apos;écran Système).</Text>
        <Text style={H3}>Suspicion de fraude / tentative d&apos;intrusion sur un compte</Text>
        <Text style={P}>Suspendre le compte concerné (révoque ses sessions dans le même geste). Rattacher les preuves disponibles. Consigner l&apos;investigation en notes. Ne réactiver qu&apos;après conclusion de l&apos;investigation.</Text>
        <Text style={H3}>Anomalie sur un examen précis (question erronée détectée, fuite suspectée)</Text>
        <Text style={P}>Suspendre cet examen précis (n&apos;affecte pas les autres). Investiguer et corriger le contenu si nécessaire (l&apos;édition d&apos;une question après publication ne modifie jamais rétroactivement les tentatives déjà notées — versionnage figé à la publication). Réouvrir une fois la correction validée.</Text>

        <Text style={pdfStyles.h2}>7. Reprise et clôture</Text>
        <Text style={P}>
          La reprise consiste à désactiver le mode maintenance et/ou les blocages ciblés, et à réouvrir tout examen
          suspendu individuellement. La clôture de l&apos;incident (bouton « Clôturer l&apos;incident ») fige son statut
          à « clôturé » et retire les contrôles d&apos;action de la fiche — l&apos;historique complet (actions + notes +
          preuves) reste consultable indéfiniment.
        </Text>

        <Text style={pdfStyles.h2}>8. Traçabilité complète</Text>
        <Text style={P}>
          Chaque action décrite en section 4 écrit systématiquement DEUX traces : une ligne dans l&apos;historique de la
          fiche incident (candidat concerné, examen concerné, horodatage, détail) et une entrée dans le journal
          d&apos;audit global de la plateforme (acteur, rôle, horodatage, résultat succès/échec) — consultable sur
          l&apos;écran « Journal d&apos;audit ». Aucune action de ce document ne modifie ni ne supprime une trace déjà
          écrite (le journal d&apos;audit est en écriture seule par conception).
        </Text>

        <PdfFooter meta={meta} />
      </Page>
    </Document>
  );
}
