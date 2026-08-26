import { guardPage } from "@/lib/rbac";
import { Card, CardHeader } from "@/components/ui/Card";
import Link from "next/link";

const SECTIONS = [
  { href: "/users", label: "Utilisateurs", description: "Créer des comptes, attribuer un rôle, suspendre/réactiver." },
  { href: "/question-bank", label: "Banque de questions", description: "Ajouter des questions vérifiées, consulter le statut source de chaque fonction." },
  { href: "/exam-preparation", label: "Examens", description: "Créer, publier, suspendre, réouvrir, clôturer des évaluations." },
  { href: "/results", label: "Résultats", description: "Filtrer, exporter en CSV, consulter le détail de chaque tentative." },
  { href: "/incidents", label: "Sécurité — Incidents", description: "Déclarer un incident et agir réellement : suspendre un compte, révoquer des sessions, suspendre un examen." },
  { href: "/audit-logs", label: "Journal d'audit", description: "Consultation seule, insert-only — jamais modifiable." },
  { href: "/system", label: "Sauvegarde & restauration", description: "État des dernières sauvegardes et tests de restauration." },
];

export default async function GuideAdminPage() {
  await guardPage("administrator", "auditor");
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-[20px] font-semibold text-text-primary">Guide — Administrateur</h1>
      <Card>
        <CardHeader title="Domaines de responsabilité" />
        <div className="flex flex-col gap-2">
          {SECTIONS.map((s) => (
            <Link key={s.href} href={s.href} className="rounded-md border border-border-subtle px-3.5 py-2.5 hover:border-border-strong">
              <p className="text-[13.5px] font-medium text-text-primary">{s.label}</p>
              <p className="text-[12px] text-text-tertiary">{s.description}</p>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
