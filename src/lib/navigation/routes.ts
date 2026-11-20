// ─────────────────────────────────────────────────────────────────────────────
// Inventaire des écrans de l'application.
//
// FICHIER GÉNÉRÉ — ne pas modifier à la main.
// Régénérer avec : npm run routes:generate
//
// La barre latérale ne peut pas exposer les 266 écrans sans devenir
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

export const SECTIONS_NAVIGATION: SectionNavigation[] = [
    {
        "nom": "Academy",
        "pages": [
            {
                "href": "/academy",
                "label": "Academy"
            },
            {
                "href": "/academy/lms",
                "label": "Lms"
            }
        ]
    },
    {
        "nom": "Accompagnement",
        "pages": [
            {
                "href": "/accompagnement/entreprenant",
                "label": "Entreprenant"
            }
        ]
    },
    {
        "nom": "Accueil",
        "pages": [
            {
                "href": "/",
                "label": "Accueil"
            }
        ]
    },
    {
        "nom": "Admin",
        "pages": [
            {
                "href": "/admin/saas",
                "label": "Saas"
            }
        ]
    },
    {
        "nom": "Advisory",
        "pages": [
            {
                "href": "/advisory",
                "label": "Advisory"
            },
            {
                "href": "/advisory/due-diligence",
                "label": "Due Diligence"
            },
            {
                "href": "/advisory/esg",
                "label": "Esg"
            },
            {
                "href": "/advisory/evaluation",
                "label": "Evaluation"
            }
        ]
    },
    {
        "nom": "Agenda",
        "pages": [
            {
                "href": "/agenda",
                "label": "Agenda"
            }
        ]
    },
    {
        "nom": "Analyse crédit",
        "pages": [
            {
                "href": "/credit-insights",
                "label": "Analyse crédit"
            }
        ]
    },
    {
        "nom": "Analyse financière",
        "pages": [
            {
                "href": "/analysis/cash-flow-predictive",
                "label": "Cash Flow Predictive"
            },
            {
                "href": "/analysis/cash-forecast",
                "label": "Cash Forecast"
            },
            {
                "href": "/analysis/clients/radar",
                "label": "Clients › Radar"
            },
            {
                "href": "/analysis/credit-insights",
                "label": "Credit Insights"
            },
            {
                "href": "/analysis/deep",
                "label": "Deep"
            },
            {
                "href": "/analysis/deep/war-room",
                "label": "Deep › War Room"
            },
            {
                "href": "/analysis/financial",
                "label": "Financial"
            },
            {
                "href": "/analysis/financial/health-radar",
                "label": "Financial › Health Radar"
            },
            {
                "href": "/analysis/financial/stress-simulator",
                "label": "Financial › Stress Simulator"
            },
            {
                "href": "/analysis/profitability",
                "label": "Profitability"
            },
            {
                "href": "/analysis/tax-simulator",
                "label": "Tax Simulator"
            },
            {
                "href": "/analysis/tiers",
                "label": "Tiers"
            }
        ]
    },
    {
        "nom": "Annuaire",
        "pages": [
            {
                "href": "/annuaire",
                "label": "Annuaire"
            }
        ]
    },
    {
        "nom": "Assistant",
        "pages": [
            {
                "href": "/assistant",
                "label": "Assistant"
            },
            {
                "href": "/assistant/cocounsel",
                "label": "Cocounsel"
            }
        ]
    },
    {
        "nom": "Audit",
        "pages": [
            {
                "href": "/audit/ai-assisted",
                "label": "ai Assisted"
            },
            {
                "href": "/audit/ai-reasoning",
                "label": "ai Reasoning"
            },
            {
                "href": "/audit",
                "label": "Audit"
            },
            {
                "href": "/audit/cac-suite",
                "label": "Cac Suite"
            },
            {
                "href": "/audit/circularisation",
                "label": "Circularisation"
            },
            {
                "href": "/audit/dossier-complet",
                "label": "Dossier Complet"
            },
            {
                "href": "/audit/dossier-travail",
                "label": "Dossier Travail"
            },
            {
                "href": "/audit/fixed-assets",
                "label": "Fixed Assets"
            },
            {
                "href": "/audit/fixed-assets/print",
                "label": "Fixed Assets › Print"
            },
            {
                "href": "/audit/fixed-assets/print-labels",
                "label": "Fixed Assets › Print Labels"
            },
            {
                "href": "/audit/forensic",
                "label": "Forensic"
            },
            {
                "href": "/audit/fraud-detection",
                "label": "Fraud Detection"
            },
            {
                "href": "/audit/ia-risks",
                "label": "ia Risks"
            },
            {
                "href": "/audit/intelligence",
                "label": "Intelligence"
            },
            {
                "href": "/audit/missions",
                "label": "Missions"
            },
            {
                "href": "/audit/prep-kit",
                "label": "Prep Kit"
            },
            {
                "href": "/audit/rapport-cac",
                "label": "Rapport Cac"
            }
        ]
    },
    {
        "nom": "Audit forensique",
        "pages": [
            {
                "href": "/audit-forensique",
                "label": "Audit forensique"
            }
        ]
    },
    {
        "nom": "Audit légal",
        "pages": [
            {
                "href": "/audit-legal",
                "label": "Audit légal"
            }
        ]
    },
    {
        "nom": "Aupcap",
        "pages": [
            {
                "href": "/aupcap/prevention",
                "label": "Prevention"
            }
        ]
    },
    {
        "nom": "Banque",
        "pages": [
            {
                "href": "/banking",
                "label": "Banque"
            }
        ]
    },
    {
        "nom": "Benchmarking",
        "pages": [
            {
                "href": "/benchmarking",
                "label": "Benchmarking"
            }
        ]
    },
    {
        "nom": "Bibliothèque",
        "pages": [
            {
                "href": "/library",
                "label": "Bibliothèque"
            },
            {
                "href": "/library/clause-bank",
                "label": "Clause Bank"
            },
            {
                "href": "/library/ohada-cite",
                "label": "Ohada Cite"
            }
        ]
    },
    {
        "nom": "Bibliothèque OHADA",
        "pages": [
            {
                "href": "/ohada-library",
                "label": "Bibliothèque OHADA"
            }
        ]
    },
    {
        "nom": "Business Intelligence",
        "pages": [
            {
                "href": "/bi",
                "label": "Business Intelligence"
            },
            {
                "href": "/bi/finthesis-reporting",
                "label": "Finthesis Reporting"
            },
            {
                "href": "/bi/sustainability",
                "label": "Sustainability"
            }
        ]
    },
    {
        "nom": "Cabinet",
        "pages": [
            {
                "href": "/cabinet/partner",
                "label": "Partner"
            },
            {
                "href": "/cabinet/relances",
                "label": "Relances"
            },
            {
                "href": "/cabinet/rentabilite",
                "label": "Rentabilite"
            }
        ]
    },
    {
        "nom": "Cabinet Indisponible",
        "pages": [
            {
                "href": "/cabinet-indisponible",
                "label": "Cabinet Indisponible"
            }
        ]
    },
    {
        "nom": "Clients",
        "pages": [
            {
                "href": "/clients",
                "label": "Clients"
            },
            {
                "href": "/clients/new",
                "label": "New"
            },
            {
                "href": "/clients/scoring",
                "label": "Scoring"
            }
        ]
    },
    {
        "nom": "Collaboration",
        "pages": [
            {
                "href": "/collaboration/requests",
                "label": "Requests"
            },
            {
                "href": "/collaboration/triage",
                "label": "Triage"
            },
            {
                "href": "/collaboration/workspaces",
                "label": "Workspaces"
            }
        ]
    },
    {
        "nom": "Collecte",
        "pages": [
            {
                "href": "/ingest",
                "label": "Collecte"
            },
            {
                "href": "/ingest/connectors",
                "label": "Connectors"
            }
        ]
    },
    {
        "nom": "Commercial",
        "pages": [
            {
                "href": "/commercial/proposals",
                "label": "Proposals"
            }
        ]
    },
    {
        "nom": "Communications",
        "pages": [
            {
                "href": "/communications",
                "label": "Communications"
            }
        ]
    },
    {
        "nom": "Comptabilité",
        "pages": [
            {
                "href": "/comptabilite/auxiliaire",
                "label": "Auxiliaire"
            },
            {
                "href": "/comptabilite/caisse",
                "label": "Caisse"
            },
            {
                "href": "/comptabilite/cloture-annuelle",
                "label": "Cloture Annuelle"
            },
            {
                "href": "/comptabilite",
                "label": "Comptabilité"
            },
            {
                "href": "/comptabilite/health-report",
                "label": "Health Report"
            },
            {
                "href": "/comptabilite/health-scores",
                "label": "Health Scores"
            },
            {
                "href": "/comptabilite/informel",
                "label": "Informel"
            },
            {
                "href": "/comptabilite/liasse-fiscale",
                "label": "Liasse Fiscale"
            },
            {
                "href": "/comptabilite/production",
                "label": "Production"
            },
            {
                "href": "/comptabilite/rapprochement-bancaire",
                "label": "Rapprochement Bancaire"
            },
            {
                "href": "/comptabilite/reporting",
                "label": "Reporting"
            },
            {
                "href": "/comptabilite/revision",
                "label": "Revision"
            },
            {
                "href": "/comptabilite/revision/print",
                "label": "Revision › Print"
            },
            {
                "href": "/comptabilite/revision-cycles",
                "label": "Revision Cycles"
            },
            {
                "href": "/comptabilite/smt",
                "label": "Smt"
            },
            {
                "href": "/comptabilite/stocks",
                "label": "Stocks"
            },
            {
                "href": "/comptabilite/tableau-bord-pme",
                "label": "Tableau Bord Pme"
            },
            {
                "href": "/comptabilite/tpe-dashboard",
                "label": "Tpe Dashboard"
            },
            {
                "href": "/comptabilite/tpe-processing",
                "label": "Tpe Processing"
            }
        ]
    },
    {
        "nom": "Conformite",
        "pages": [
            {
                "href": "/conformite/dashboard",
                "label": "Dashboard"
            }
        ]
    },
    {
        "nom": "Conformité",
        "pages": [
            {
                "href": "/compliance",
                "label": "Conformité"
            },
            {
                "href": "/compliance/customs",
                "label": "Customs"
            },
            {
                "href": "/compliance/financial-crime",
                "label": "Financial Crime"
            },
            {
                "href": "/compliance/governance/heatmap",
                "label": "Governance › Heatmap"
            },
            {
                "href": "/compliance/id-verify",
                "label": "id Verify"
            },
            {
                "href": "/compliance/kyc",
                "label": "Kyc"
            },
            {
                "href": "/compliance/kyc-screening",
                "label": "Kyc Screening"
            },
            {
                "href": "/compliance/tax-audit",
                "label": "Tax Audit"
            },
            {
                "href": "/compliance/uemoa-score",
                "label": "Uemoa Score"
            }
        ]
    },
    {
        "nom": "Corporate",
        "pages": [
            {
                "href": "/corporate/audit-assurance",
                "label": "Audit Assurance"
            },
            {
                "href": "/corporate/consolidation",
                "label": "Consolidation"
            },
            {
                "href": "/corporate/consolidation/audcif",
                "label": "Consolidation › Audcif"
            },
            {
                "href": "/corporate/entity-hub",
                "label": "Entity Hub"
            },
            {
                "href": "/corporate/entity-hub/print",
                "label": "Entity Hub › Print"
            },
            {
                "href": "/corporate/fusion",
                "label": "Fusion"
            },
            {
                "href": "/corporate/legal-archive",
                "label": "Legal Archive"
            },
            {
                "href": "/corporate/performance",
                "label": "Performance"
            }
        ]
    },
    {
        "nom": "Data center",
        "pages": [
            {
                "href": "/data-center",
                "label": "Data center"
            }
        ]
    },
    {
        "nom": "Déclarations",
        "pages": [
            {
                "href": "/declarations",
                "label": "Déclarations"
            },
            {
                "href": "/declarations/e-depot",
                "label": "e Depot"
            }
        ]
    },
    {
        "nom": "Dépenses",
        "pages": [
            {
                "href": "/expenses",
                "label": "Dépenses"
            }
        ]
    },
    {
        "nom": "Diagnostic",
        "pages": [
            {
                "href": "/diagnostic",
                "label": "Diagnostic"
            }
        ]
    },
    {
        "nom": "Documentation",
        "pages": [
            {
                "href": "/documentation/brochure",
                "label": "Brochure"
            },
            {
                "href": "/documentation",
                "label": "Documentation"
            },
            {
                "href": "/documentation/full",
                "label": "Full"
            },
            {
                "href": "/documentation/full-manual",
                "label": "Full Manual"
            },
            {
                "href": "/documentation/full-manual/pdf-export",
                "label": "Full Manual › Pdf Export"
            },
            {
                "href": "/documentation/lettre",
                "label": "Lettre"
            },
            {
                "href": "/documentation/manuel",
                "label": "Manuel"
            },
            {
                "href": "/documentation/release-notes",
                "label": "Release Notes"
            },
            {
                "href": "/documentation/success-stories",
                "label": "Success Stories"
            },
            {
                "href": "/documentation/success-stories/pdf-export",
                "label": "Success Stories › Pdf Export"
            },
            {
                "href": "/documentation/training-catalog",
                "label": "Training Catalog"
            },
            {
                "href": "/documentation/training-manuals",
                "label": "Training Manuals"
            },
            {
                "href": "/documentation/training-manuals/pdf-export",
                "label": "Training Manuals › Pdf Export"
            },
            {
                "href": "/documentation/welcome-pack",
                "label": "Welcome Pack"
            }
        ]
    },
    {
        "nom": "Documents",
        "pages": [
            {
                "href": "/documents",
                "label": "Documents"
            },
            {
                "href": "/documents/generation",
                "label": "Generation"
            }
        ]
    },
    {
        "nom": "Données",
        "pages": [
            {
                "href": "/data/nexus-link",
                "label": "Nexus Link"
            }
        ]
    },
    {
        "nom": "Douanes",
        "pages": [
            {
                "href": "/douanes/simulateur",
                "label": "Simulateur"
            },
            {
                "href": "/douanes/simulateur/print",
                "label": "Simulateur › Print"
            }
        ]
    },
    {
        "nom": "Emails",
        "pages": [
            {
                "href": "/emails",
                "label": "Emails"
            }
        ]
    },
    {
        "nom": "États financiers",
        "pages": [
            {
                "href": "/etats-financiers/bilan",
                "label": "Bilan"
            },
            {
                "href": "/etats-financiers/config",
                "label": "Config"
            },
            {
                "href": "/etats-financiers",
                "label": "États financiers"
            },
            {
                "href": "/etats-financiers/import",
                "label": "Import"
            },
            {
                "href": "/etats-financiers/print/bilan",
                "label": "Print › Bilan"
            },
            {
                "href": "/etats-financiers/print/resultat",
                "label": "Print › Resultat"
            },
            {
                "href": "/etats-financiers/print/tft",
                "label": "Print › Tft"
            },
            {
                "href": "/etats-financiers/resultat",
                "label": "Resultat"
            },
            {
                "href": "/etats-financiers/tft",
                "label": "Tft"
            }
        ]
    },
    {
        "nom": "Expertise judiciaire",
        "pages": [
            {
                "href": "/expert-judiciaire",
                "label": "Expertise judiciaire"
            },
            {
                "href": "/expert-judiciaire/tribunaux",
                "label": "Tribunaux"
            }
        ]
    },
    {
        "nom": "Export FEC",
        "pages": [
            {
                "href": "/fec-export",
                "label": "Export FEC"
            }
        ]
    },
    {
        "nom": "Facturation",
        "pages": [
            {
                "href": "/billing",
                "label": "Facturation"
            },
            {
                "href": "/billing/new",
                "label": "New"
            },
            {
                "href": "/billing/relances",
                "label": "Relances"
            }
        ]
    },
    {
        "nom": "Feuilles de temps",
        "pages": [
            {
                "href": "/timesheets",
                "label": "Feuilles de temps"
            }
        ]
    },
    {
        "nom": "Fintech",
        "pages": [
            {
                "href": "/fintech/credit",
                "label": "Credit"
            },
            {
                "href": "/fintech/marketplace",
                "label": "Marketplace"
            },
            {
                "href": "/fintech/mobile-money",
                "label": "Mobile Money"
            },
            {
                "href": "/fintech/payments",
                "label": "Payments"
            },
            {
                "href": "/fintech/scoring",
                "label": "Scoring"
            }
        ]
    },
    {
        "nom": "Fiscalité",
        "pages": [
            {
                "href": "/fiscalite/attestation-brs",
                "label": "Attestation Brs"
            },
            {
                "href": "/fiscalite/cadrage-tva",
                "label": "Cadrage Tva"
            },
            {
                "href": "/fiscalite/controle-defense",
                "label": "Controle Defense"
            },
            {
                "href": "/fiscalite/conventions",
                "label": "Conventions"
            },
            {
                "href": "/fiscalite/deficits-reportables",
                "label": "Deficits Reportables"
            },
            {
                "href": "/fiscalite/drop-zone",
                "label": "Drop Zone"
            },
            {
                "href": "/fiscalite/fec",
                "label": "Fec"
            },
            {
                "href": "/fiscalite",
                "label": "Fiscalité"
            },
            {
                "href": "/fiscalite/loi-finances",
                "label": "Loi Finances"
            },
            {
                "href": "/fiscalite/matrice-risques",
                "label": "Matrice Risques"
            },
            {
                "href": "/fiscalite/obligations",
                "label": "Obligations"
            },
            {
                "href": "/fiscalite/optimisation-scenarios",
                "label": "Optimisation Scenarios"
            },
            {
                "href": "/fiscalite/optimization",
                "label": "Optimization"
            },
            {
                "href": "/fiscalite/prix-transfert",
                "label": "Prix Transfert"
            },
            {
                "href": "/fiscalite/quittance-ocr",
                "label": "Quittance Ocr"
            },
            {
                "href": "/fiscalite/resultat-fiscal",
                "label": "Resultat Fiscal"
            }
        ]
    },
    {
        "nom": "Formation",
        "pages": [
            {
                "href": "/training/academy",
                "label": "Academy"
            },
            {
                "href": "/training/catalog",
                "label": "Catalog"
            },
            {
                "href": "/training/certificates",
                "label": "Certificates"
            },
            {
                "href": "/training/community",
                "label": "Community"
            },
            {
                "href": "/training/courses",
                "label": "Courses"
            },
            {
                "href": "/training/instructors",
                "label": "Instructors"
            },
            {
                "href": "/training/quiz",
                "label": "Quiz"
            },
            {
                "href": "/training/roadmaps",
                "label": "Roadmaps"
            }
        ]
    },
    {
        "nom": "Gouvernance",
        "pages": [
            {
                "href": "/governance",
                "label": "Gouvernance"
            }
        ]
    },
    {
        "nom": "Inbox",
        "pages": [
            {
                "href": "/inbox",
                "label": "Inbox"
            }
        ]
    },
    {
        "nom": "Investissement",
        "pages": [
            {
                "href": "/investment",
                "label": "Investissement"
            }
        ]
    },
    {
        "nom": "Juridique",
        "pages": [
            {
                "href": "/legal/actes",
                "label": "Actes"
            },
            {
                "href": "/legal/ag-generator",
                "label": "ag Generator"
            },
            {
                "href": "/legal/drafting",
                "label": "Drafting"
            },
            {
                "href": "/legal/recouvrement",
                "label": "Recouvrement"
            }
        ]
    },
    {
        "nom": "KYC",
        "pages": [
            {
                "href": "/kyc",
                "label": "KYC"
            }
        ]
    },
    {
        "nom": "Lettres de mission",
        "pages": [
            {
                "href": "/lettres-mission",
                "label": "Lettres de mission"
            },
            {
                "href": "/lettres-mission/new",
                "label": "New"
            }
        ]
    },
    {
        "nom": "Liasse",
        "pages": [
            {
                "href": "/liasse/bouclage",
                "label": "Bouclage"
            },
            {
                "href": "/liasse/mapping",
                "label": "Mapping"
            }
        ]
    },
    {
        "nom": "Liasse fiscale",
        "pages": [
            {
                "href": "/liasse-fiscale",
                "label": "Liasse fiscale"
            }
        ]
    },
    {
        "nom": "Login",
        "pages": [
            {
                "href": "/login",
                "label": "Login"
            }
        ]
    },
    {
        "nom": "Missions",
        "pages": [
            {
                "href": "/missions/boni-mali",
                "label": "Boni Mali"
            },
            {
                "href": "/missions/budget",
                "label": "Budget"
            },
            {
                "href": "/missions/budget-sentinel",
                "label": "Budget Sentinel"
            },
            {
                "href": "/missions/creation",
                "label": "Creation"
            },
            {
                "href": "/missions",
                "label": "Missions"
            },
            {
                "href": "/missions/new",
                "label": "New"
            },
            {
                "href": "/missions/planning",
                "label": "Planning"
            },
            {
                "href": "/missions/timesheets",
                "label": "Timesheets"
            }
        ]
    },
    {
        "nom": "Mobile Money",
        "pages": [
            {
                "href": "/mobile-money",
                "label": "Mobile Money"
            }
        ]
    },
    {
        "nom": "Nexus fiscal",
        "pages": [
            {
                "href": "/nexus-fiscal",
                "label": "Nexus fiscal"
            }
        ]
    },
    {
        "nom": "Nexus Go",
        "pages": [
            {
                "href": "/nexus-go",
                "label": "Nexus Go"
            }
        ]
    },
    {
        "nom": "Nexus IA",
        "pages": [
            {
                "href": "/nexus/chat",
                "label": "Chat"
            },
            {
                "href": "/nexus",
                "label": "Nexus IA"
            },
            {
                "href": "/nexus/whatsapp",
                "label": "Whatsapp"
            }
        ]
    },
    {
        "nom": "Nexus juridique",
        "pages": [
            {
                "href": "/nexus-legal",
                "label": "Nexus juridique"
            }
        ]
    },
    {
        "nom": "Notes de frais",
        "pages": [
            {
                "href": "/expense-notes",
                "label": "Notes de frais"
            }
        ]
    },
    {
        "nom": "Numérisation",
        "pages": [
            {
                "href": "/scan",
                "label": "Numérisation"
            }
        ]
    },
    {
        "nom": "Onboarding",
        "pages": [
            {
                "href": "/onboarding/digital",
                "label": "Digital"
            },
            {
                "href": "/onboarding",
                "label": "Onboarding"
            }
        ]
    },
    {
        "nom": "Paie",
        "pages": [
            {
                "href": "/payroll/anomaly-detection",
                "label": "Anomaly Detection"
            },
            {
                "href": "/payroll/cadrage",
                "label": "Cadrage"
            },
            {
                "href": "/payroll/indemnites",
                "label": "Indemnites"
            },
            {
                "href": "/payroll",
                "label": "Paie"
            }
        ]
    },
    {
        "nom": "Paramètres",
        "pages": [
            {
                "href": "/settings/admin",
                "label": "Admin"
            },
            {
                "href": "/settings/ai",
                "label": "ai"
            },
            {
                "href": "/settings/api-keys",
                "label": "Api Keys"
            },
            {
                "href": "/settings",
                "label": "Paramètres"
            },
            {
                "href": "/settings/security",
                "label": "Security"
            }
        ]
    },
    {
        "nom": "Pilotage",
        "pages": [
            {
                "href": "/management/capacity-planning",
                "label": "Capacity Planning"
            },
            {
                "href": "/management/controlling",
                "label": "Controlling"
            },
            {
                "href": "/management/practice",
                "label": "Practice"
            }
        ]
    },
    {
        "nom": "Plan",
        "pages": [
            {
                "href": "/plan",
                "label": "Plan"
            }
        ]
    },
    {
        "nom": "Portail client",
        "pages": [
            {
                "href": "/portal/custom-dashboard",
                "label": "Custom Dashboard"
            },
            {
                "href": "/portal/dashboard",
                "label": "Dashboard"
            },
            {
                "href": "/portal",
                "label": "Portail client"
            },
            {
                "href": "/portal/saisie",
                "label": "Saisie"
            },
            {
                "href": "/portal/tpe-client",
                "label": "Tpe Client"
            }
        ]
    },
    {
        "nom": "Préparation",
        "pages": [
            {
                "href": "/preparation",
                "label": "Préparation"
            }
        ]
    },
    {
        "nom": "Présentation",
        "pages": [
            {
                "href": "/presentation",
                "label": "Présentation"
            }
        ]
    },
    {
        "nom": "Procédures",
        "pages": [
            {
                "href": "/procedures",
                "label": "Procédures"
            }
        ]
    },
    {
        "nom": "Production",
        "pages": [
            {
                "href": "/production/analytics",
                "label": "Analytics"
            },
            {
                "href": "/production/dashboard",
                "label": "Dashboard"
            },
            {
                "href": "/production/planning",
                "label": "Planning"
            },
            {
                "href": "/production",
                "label": "Production"
            }
        ]
    },
    {
        "nom": "Prospects",
        "pages": [
            {
                "href": "/prospects",
                "label": "Prospects"
            }
        ]
    },
    {
        "nom": "Rapprochement bancaire",
        "pages": [
            {
                "href": "/bank-reconciliation",
                "label": "Rapprochement bancaire"
            }
        ]
    },
    {
        "nom": "Rédaction",
        "pages": [
            {
                "href": "/writing",
                "label": "Rédaction"
            }
        ]
    },
    {
        "nom": "Reporting",
        "pages": [
            {
                "href": "/reporting/pdf-generator",
                "label": "Pdf Generator"
            },
            {
                "href": "/reporting",
                "label": "Reporting"
            }
        ]
    },
    {
        "nom": "Saisie des temps",
        "pages": [
            {
                "href": "/time-entry",
                "label": "Saisie des temps"
            }
        ]
    },
    {
        "nom": "Secteurs",
        "pages": [
            {
                "href": "/industries/manufacturing",
                "label": "Manufacturing"
            },
            {
                "href": "/industries/manufacturing/costing",
                "label": "Manufacturing › Costing"
            },
            {
                "href": "/industries/manufacturing/machinery",
                "label": "Manufacturing › Machinery"
            }
        ]
    },
    {
        "nom": "Signature",
        "pages": [
            {
                "href": "/signature/lettres-mission",
                "label": "Lettres Mission"
            },
            {
                "href": "/signature",
                "label": "Signature"
            }
        ]
    },
    {
        "nom": "Simulateur",
        "pages": [
            {
                "href": "/simulator",
                "label": "Simulateur"
            }
        ]
    },
    {
        "nom": "Stratégie",
        "pages": [
            {
                "href": "/strategy/business-plan",
                "label": "Business Plan"
            },
            {
                "href": "/strategy/devises",
                "label": "Devises"
            },
            {
                "href": "/strategy/fiscal-mirror",
                "label": "Fiscal Mirror"
            },
            {
                "href": "/strategy/fundraising",
                "label": "Fundraising"
            },
            {
                "href": "/strategy/radar",
                "label": "Radar"
            },
            {
                "href": "/strategy/simulator",
                "label": "Simulator"
            },
            {
                "href": "/strategy/wealth",
                "label": "Wealth"
            },
            {
                "href": "/strategy/zone-franche",
                "label": "Zone Franche"
            }
        ]
    },
    {
        "nom": "Supervision",
        "pages": [
            {
                "href": "/supervision",
                "label": "Supervision"
            },
            {
                "href": "/supervision/timeline",
                "label": "Timeline"
            }
        ]
    },
    {
        "nom": "Tableaux de bord",
        "pages": [
            {
                "href": "/dashboard/confidentiel",
                "label": "Confidentiel"
            },
            {
                "href": "/dashboard/executive",
                "label": "Executive"
            },
            {
                "href": "/dashboard/morning-brief",
                "label": "Morning Brief"
            },
            {
                "href": "/dashboard/partner",
                "label": "Partner"
            },
            {
                "href": "/dashboard",
                "label": "Tableaux de bord"
            },
            {
                "href": "/dashboard/whatsapp-bot",
                "label": "Whatsapp Bot"
            }
        ]
    },
    {
        "nom": "Valorisation",
        "pages": [
            {
                "href": "/valorisation/transmission",
                "label": "Transmission"
            },
            {
                "href": "/valorisation/transmission/print",
                "label": "Transmission › Print"
            },
            {
                "href": "/valorisation",
                "label": "Valorisation"
            }
        ]
    },
    {
        "nom": "Workflows",
        "pages": [
            {
                "href": "/workflows",
                "label": "Workflows"
            }
        ]
    }
];

/** Liste à plat de tous les écrans inventoriés. */
export const TOUS_LES_ECRANS: Ecran[] = SECTIONS_NAVIGATION.flatMap((s) => s.pages);
