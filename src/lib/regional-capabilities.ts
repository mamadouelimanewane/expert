import { PAYS_SUPPORTES, REGLES_PAIE } from "@/lib/payroll/engines";

export const UEMOA_COUNTRIES = [
  { code: "BJ", name: "Bénin" },
  { code: "BF", name: "Burkina Faso" },
  { code: "CI", name: "Côte d’Ivoire" },
  { code: "GW", name: "Guinée-Bissau" },
  { code: "ML", name: "Mali" },
  { code: "NE", name: "Niger" },
  { code: "SN", name: "Sénégal" },
  { code: "TG", name: "Togo" },
] as const;

export type CapabilityState = "Disponible dans le code" | "Partiel" | "Non connecté" | "À cadrer";

export type RegionalCapability = {
  id: string;
  name: string;
  state: CapabilityState;
  summary: string;
  href: string;
};

/**
 * Catalogue d'intégration, pas une déclaration de conformité juridique.
 * Les états décrivent uniquement les modules et connexions recensés dans le
 * dépôt; ils doivent évoluer avec les intégrations effectivement livrées.
 */
export function getRegionalCapabilities(countryCode: string): RegionalCapability[] {
  const payrollEnabled = (PAYS_SUPPORTES as readonly string[]).includes(countryCode);
  const payrollRule = payrollEnabled
    ? REGLES_PAIE[countryCode as keyof typeof REGLES_PAIE]
    : null;

  return [
    {
      id: "accounting",
      name: "Comptabilité SYSCOHADA",
      state: "Disponible dans le code",
      summary: "Moteurs et états présents. La recette de chaque dossier et la validation professionnelle restent nécessaires.",
      href: "/comptabilite/production",
    },
    {
      id: "payroll",
      name: "Paie locale",
      state: payrollEnabled ? "Partiel" : "À cadrer",
      summary: payrollRule
        ? `${payrollRule.version} · revue par un expert local requise avant déclaration.`
        : "Aucun moteur de paie n'est activé pour ce pays. Le calcul est refusé plutôt que remplacé par le barème d'un autre pays.",
      href: "/payroll",
    },
    {
      id: "compliance",
      name: "Obligations fiscales et sociales",
      state: "Partiel",
      summary: "Les modules existent, mais les calendriers et règles doivent être sourcés, versionnés et validés pays par pays.",
      href: "/compliance",
    },
    {
      id: "banking",
      name: "Banques et mobile money",
      state: "Partiel",
      summary: "Import et rapprochement manuel disponibles. Les pistes sont maintenant classées avec leurs motifs, mais aucune association n'est validée automatiquement.",
      href: "/banking",
    },
    {
      id: "audit-analytics",
      name: "Analyses d'audit",
      state: "Disponible dans le code",
      summary: "Analyses FEC, détection d'anomalies et dossiers d'audit sont déjà présents ; chaque signal reste à examiner et documenter.",
      href: "/audit/intelligence",
    },
    {
      id: "client-portal",
      name: "Portail et collecte client",
      state: "Partiel",
      summary: "Portail, demandes de pièces et échanges existent. L'étendue des intégrations de signature et d'identité dépend des fournisseurs configurés.",
      href: "/portal",
    },
    {
      id: "ai",
      name: "Assistance IA traçable",
      state: "Partiel",
      summary: "Assistants et agents existent. Les propositions doivent rester sourcées, révisables et soumises à validation humaine.",
      href: "/assistant",
    },
    {
      id: "mobile",
      name: "Accès mobile et mode hors connexion",
      state: "Partiel",
      summary: "L'application dispose d'une base PWA. Les données comptables et pages authentifiées ne sont pas conservées hors ligne afin d'éviter d'exposer des dossiers sur un appareil partagé.",
      href: "/plan",
    },
    {
      id: "advisory",
      name: "Conseil, devises et rentabilité",
      state: "Disponible dans le code",
      summary: "Prévisions, valorisation, analyse de mission et outils de change sont présents ; les hypothèses doivent être explicites et validées.",
      href: "/analysis",
    },
    {
      id: "pispi",
      name: "PI-SPI UEMOA",
      state: "Non connecté",
      summary: "Aucun connecteur de production dans le dépôt. Une connexion passe par un participant, des certificats et l'homologation requise.",
      href: "/fintech/payments",
    },
    {
      id: "e-invoicing",
      name: "Facturation électronique",
      state: "À cadrer",
      summary: "À activer par adaptateur officiel propre au pays ; un PDF de facture ne constitue pas à lui seul une intégration réglementaire.",
      href: "/billing",
    },
    {
      id: "cash",
      name: "Prévision de trésorerie",
      state: "Partiel",
      summary: "Les prévisions exploitent les encaissements de factures ; les charges récurrentes non suivies ne sont pas inventées.",
      href: "/analysis/cash-forecast",
    },
    {
      id: "audit",
      name: "Audit et clôture",
      state: "Disponible dans le code",
      summary: "Dossier d'audit, analyses et contrôles de clôture existent et doivent être alimentés par les données réelles du dossier.",
      href: "/audit",
    },
  ];
}

export function countryName(code: string): string {
  return UEMOA_COUNTRIES.find((country) => country.code === code)?.name ?? code;
}
