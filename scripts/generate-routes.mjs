// Génère src/lib/navigation/routes.ts à partir de l'arborescence de src/app.
import fs from "node:fs";
import path from "node:path";

const APP = "src/app";

const SECTIONS = {
  academy: "Academy",
  accompagnement: "Accompagnement",
  advisory: "Advisory",
  agenda: "Agenda",
  analysis: "Analyse financière",
  annuaire: "Annuaire",
  assistant: "Assistant",
  audit: "Audit",
  "audit-forensique": "Audit forensique",
  "audit-legal": "Audit légal",
  banking: "Banque",
  "bank-reconciliation": "Rapprochement bancaire",
  benchmarking: "Benchmarking",
  bi: "Business Intelligence",
  billing: "Facturation",
  clients: "Clients",
  collaboration: "Collaboration",
  commercial: "Commercial",
  communications: "Communications",
  compliance: "Conformité",
  comptabilite: "Comptabilité",
  corporate: "Corporate",
  "credit-insights": "Analyse crédit",
  dashboard: "Tableaux de bord",
  data: "Données",
  "data-center": "Data center",
  declarations: "Déclarations",
  diagnostic: "Diagnostic",
  documentation: "Documentation",
  documents: "Documents",
  douanes: "Douanes",
  emails: "Emails",
  "etats-financiers": "États financiers",
  "expense-notes": "Notes de frais",
  expenses: "Dépenses",
  "expert-judiciaire": "Expertise judiciaire",
  "fec-export": "Export FEC",
  fintech: "Fintech",
  fiscalite: "Fiscalité",
  governance: "Gouvernance",
  home: "Accueil",
  industries: "Secteurs",
  ingest: "Collecte",
  investment: "Investissement",
  kyc: "KYC",
  legal: "Juridique",
  "lettres-mission": "Lettres de mission",
  "liasse-fiscale": "Liasse fiscale",
  library: "Bibliothèque",
  management: "Pilotage",
  missions: "Missions",
  "mobile-money": "Mobile Money",
  nexus: "Nexus IA",
  "nexus-fiscal": "Nexus fiscal",
  "nexus-go": "Nexus Go",
  "nexus-legal": "Nexus juridique",
  "ohada-library": "Bibliothèque OHADA",
  onboarding: "Onboarding",
  payroll: "Paie",
  portal: "Portail client",
  preparation: "Préparation",
  presentation: "Présentation",
  procedures: "Procédures",
  production: "Production",
  prospects: "Prospects",
  reporting: "Reporting",
  scan: "Numérisation",
  settings: "Paramètres",
  signature: "Signature",
  simulator: "Simulateur",
  strategy: "Stratégie",
  supervision: "Supervision",
  "time-entry": "Saisie des temps",
  timesheets: "Feuilles de temps",
  training: "Formation",
  valorisation: "Valorisation",
  workflows: "Workflows",
  writing: "Rédaction",
};

function libelle(segment) {
  return segment
    .split("-")
    .map((m) => (m.length > 2 ? m[0].toUpperCase() + m.slice(1) : m))
    .join(" ");
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (e.name === "page.tsx") out.push(full);
  }
  return out;
}

const routes = walk(APP)
  .map((f) => f.split(path.sep).join("/").replace(/^src\/app/, "").replace(/\/page\.tsx$/, "") || "/")
  // Les routes dynamiques ne sont pas listables : elles exigent un identifiant.
  .filter((r) => !r.includes("["))
  .sort();

const parSection = new Map();

for (const route of routes) {
  const segments = route.split("/").filter(Boolean);
  const cle = segments[0] ?? "";
  const section = cle === "" ? "Accueil" : (SECTIONS[cle] ?? libelle(cle));

  const reste = segments.slice(1);
  const label = reste.length === 0 ? section : reste.map(libelle).join(" › ");

  if (!parSection.has(section)) parSection.set(section, []);
  parSection.get(section).push({ href: route, label });
}

const sections = [...parSection.entries()]
  .sort(([a], [b]) => a.localeCompare(b, "fr"))
  .map(([nom, pages]) => ({ nom, pages: pages.sort((a, b) => a.label.localeCompare(b.label, "fr")) }));

const contenu = `// ─────────────────────────────────────────────────────────────────────────────
// Inventaire des écrans de l'application.
//
// FICHIER GÉNÉRÉ — ne pas modifier à la main.
// Régénérer avec : npm run routes:generate
//
// La barre latérale ne peut pas exposer les ${routes.length} écrans sans devenir
// illisible : elle en présente une sélection. Cet inventaire alimente la page
// « Plan de l'application » (/plan), qui rend chacun d'eux atteignable.
//
// Le test tests/navigation.test.ts échoue si une page existe sans figurer ici,
// ce qui empêche l'inventaire de dériver au fil des ajouts.
// ─────────────────────────────────────────────────────────────────────────────

export type Ecran = {
    href: string;
    label: string;
};

export type SectionNavigation = {
    nom: string;
    pages: Ecran[];
};

export const SECTIONS_NAVIGATION: SectionNavigation[] = ${JSON.stringify(sections, null, 4)};

/** Liste à plat de tous les écrans inventoriés. */
export const TOUS_LES_ECRANS: Ecran[] = SECTIONS_NAVIGATION.flatMap((s) => s.pages);
`;

fs.mkdirSync("src/lib/navigation", { recursive: true });
fs.writeFileSync("src/lib/navigation/routes.ts", contenu, "utf8");

console.log(`${routes.length} écrans inventoriés dans ${sections.length} sections.`);
