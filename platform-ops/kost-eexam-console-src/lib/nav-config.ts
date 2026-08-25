// Source unique de la navigation — utilisée par la Sidebar (menu complet,
// groupé) et par le Topbar (fil d'ariane, à partir du même libellé). Évite
// d'avoir deux listes de libellés qui peuvent diverger silencieusement.
import {
  LayoutGrid,
  FileCheck2,
  CalendarClock,
  Library,
  Users,
  ListChecks,
  BarChart3,
  ShieldCheck,
  Cpu,
  LifeBuoy,
  AlertTriangle,
  BookOpen,
  GraduationCap,
  MessageSquareHeart,
  BadgeCheck,
  FileWarning,
  BookMarked,
  ClipboardCheck,
  Archive,
  ListTree,
  ScrollText,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Opérations",
    items: [
      { label: "Vue d'ensemble", href: "/overview", icon: LayoutGrid },
      { label: "Examens", href: "/exams", icon: FileCheck2 },
      { label: "Sessions", href: "/sessions", icon: CalendarClock },
      { label: "Banque de questions", href: "/question-bank", icon: Library },
      { label: "Candidats", href: "/candidates", icon: Users },
      { label: "Résultats", href: "/results", icon: ListChecks },
      { label: "Rapports", href: "/reports", icon: BarChart3 },
    ],
  },
  {
    title: "Conformité & audit",
    items: [
      { label: "Audit & conformité", href: "/audit-compliance", icon: ShieldCheck },
      { label: "Préparation à l'audit", href: "/audit-readiness", icon: ClipboardCheck },
      { label: "Checklist KOST — préparation ANAC", href: "/anac-checklist", icon: ListTree },
      { label: "Dossier de preuves", href: "/evidence-pack", icon: Archive },
      { label: "Vérification d'identité", href: "/identity-verification", icon: BadgeCheck },
      { label: "Incidents techniques", href: "/incidents", icon: AlertTriangle },
    ],
  },
  {
    title: "Administration",
    items: [
      { label: "Préparation des examens", href: "/exam-preparation", icon: BookOpen },
      { label: "Test pratique", href: "/practice-test", icon: GraduationCap },
      { label: "Système", href: "/system", icon: Cpu },
      { label: "Journaux d'audit", href: "/audit-logs", icon: ScrollText },
    ],
  },
  {
    title: "Aide & documentation",
    items: [
      { label: "Guide d'utilisation", href: "/guide", icon: HelpCircle },
      { label: "Documentation", href: "/documentation", icon: BookMarked },
      { label: "Procédure de sécurité", href: "/security-procedure", icon: FileWarning },
      { label: "Aide & support", href: "/support", icon: LifeBuoy },
      { label: "Retours", href: "/feedback", icon: MessageSquareHeart },
    ],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

// Libellé pour un segment d'URL donné (premier segment du pathname) — pour
// le fil d'ariane du Topbar. Inclut aussi les routes réelles qui ne sont
// pas dans le menu (ex. /results/[id], /support/report).
export const SEGMENT_LABELS: Record<string, string> = Object.fromEntries(
  NAV_ITEMS.map((item) => [item.href.replace("/", ""), item.label])
);
SEGMENT_LABELS["support"] = "Aide & support";
