// Source unique de navigation, comme en V1 (lib/nav-config.ts) — mais ici
// explicitement PAR RÔLE : un candidat n'a jamais accès au même menu qu'un
// membre du staff, appliqué dès le rendu du menu (en plus des gardes
// serveur réelles sur chaque route — jamais une sécurité par simple
// masquage de lien).
import {
  LayoutGrid,
  Building2,
  Users2,
  UserCircle,
  Library,
  BookOpenCheck,
  ListChecks,
  ShieldCheck,
  AlertTriangle,
  ScrollText,
  KeySquare,
  DatabaseBackup,
  HelpCircle,
  FileClock,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import type { ConsoleRole } from "./session";

export type NavItem = { label: string; href: string; icon: LucideIcon };
export type NavGroup = { title: string; items: NavItem[] };

const STAFF_SHARED: NavGroup[] = [
  {
    title: "Opérations",
    items: [
      { label: "Vue d'ensemble", href: "/overview", icon: LayoutGrid },
      { label: "Clients", href: "/companies", icon: Building2 },
      { label: "Groupes", href: "/groups", icon: Users2 },
      { label: "Banque de questions", href: "/question-bank", icon: Library },
      { label: "Préparation des examens", href: "/exam-preparation", icon: BookOpenCheck },
      { label: "Familiarisation", href: "/familiarisation", icon: GraduationCap },
      { label: "Résultats", href: "/results", icon: ListChecks },
    ],
  },
];

const ADMIN_ONLY: NavGroup[] = [
  {
    title: "Sécurité & conformité",
    items: [
      { label: "Utilisateurs", href: "/users", icon: UserCircle },
      { label: "Incidents", href: "/incidents", icon: AlertTriangle },
      { label: "Sessions actives", href: "/sessions", icon: KeySquare },
      { label: "Journal d'audit", href: "/audit-logs", icon: ScrollText },
      { label: "Sauvegarde & restauration", href: "/system", icon: DatabaseBackup },
    ],
  },
];

const AUDITOR_ONLY: NavGroup[] = [
  {
    title: "Conformité (lecture seule)",
    items: [
      { label: "Incidents", href: "/incidents", icon: AlertTriangle },
      { label: "Journal d'audit", href: "/audit-logs", icon: ScrollText },
      { label: "Sauvegarde & restauration", href: "/system", icon: DatabaseBackup },
    ],
  },
];

const HELP: NavGroup = {
  title: "Aide",
  items: [{ label: "Guide", href: "/guide", icon: HelpCircle }],
};

const CANDIDATE_NAV: NavGroup[] = [
  {
    title: "Mon espace",
    items: [
      { label: "Mes examens", href: "/mes-examens", icon: LayoutGrid },
      { label: "Mes résultats", href: "/mes-resultats", icon: FileClock },
    ],
  },
  HELP,
];

export function navForRole(role: ConsoleRole): NavGroup[] {
  switch (role) {
    case "candidate":
      return CANDIDATE_NAV;
    case "pedagogical_manager":
      return [...STAFF_SHARED, HELP];
    case "administrator":
      return [...STAFF_SHARED, ...ADMIN_ONLY, HELP];
    case "auditor":
      return [...STAFF_SHARED, ...AUDITOR_ONLY, HELP];
  }
}

export function segmentLabels(role: ConsoleRole): Record<string, string> {
  const items = navForRole(role).flatMap((g) => g.items);
  return Object.fromEntries(items.map((i) => [i.href.replace("/", ""), i.label]));
}
