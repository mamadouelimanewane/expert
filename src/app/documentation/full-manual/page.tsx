"use client";

import React, { useState } from 'react';
import {
    LayoutDashboard,
    Users,
    Mail,
    Briefcase,
    FileText,
    Book,
    Settings,
    LogOut,
    BarChart3,
    Sparkles,
    ShieldAlert,
    MessageSquare,
    Workflow,
    Calendar,
    Activity,
    Calculator,
    Receipt,
    PenTool,
    Gavel,
    Rocket,
    Library,
    Wallet,
    TrendingUp,
    ArrowRightLeft,
    FileSpreadsheet,
    CalendarDays,
    DollarSign,
    Building,
    ChevronRight,
    Search,
    HelpCircle,
    CheckCircle2,
    PlayCircle,
    ArrowRight,
    MousePointer2,
    Eye,
    Zap,
    Plane,
    Calendar as CalendarIcon,
    BrainCircuit,
    Printer,
    FileDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ChapterContent } from "./chapter-content";

const CHAPTERS = [
    {
        id: "dashboard",
        label: "Tableau de Bord",
        icon: LayoutDashboard,
        title: "Le Centre de Pilotage Stratégique",
        description: "Votre tableau de bord est le cœur opérationnel de Cabinet 360. Il offre une vue panoramique en temps réel sur la santé de votre cabinet et des dossiers clients.",
        sections: [
            {
                title: "Fonctions Principales",
                items: [
                    {
                        name: "Bouton 'Nouveau Dossier'",
                        function: "Permet d'initier la création d'une nouvelle fiche client ou mission complexe.",
                        result: "Ouvre un formulaire de création assistée par IA pour renseigner les données légales."
                    },
                    {
                        name: "Bouton 'Scanner Pièce'",
                        function: "Active le module d'OCR (Reconnaissance Optique de Caractères) pour numériser des pièces comptables.",
                        result: "Les données (date, montant, TVA, tiers) sont extraites automatiquement pour pré-saisie."
                    }
                ]
            },
            {
                title: "Indicateurs de Performance (KPI)",
                items: [
                    {
                        name: "Chiffre d'Affaires",
                        function: "Cumul des honoraires encaissés sur la période en cours.",
                        result: "Visualisation immédiate de la rentabilité avec comparaison N-1."
                    },
                    {
                        name: "Alertes Fiscales",
                        function: "Surveillance automatique des dates limites de déclaration (TVA, IS, RF).",
                        result: "Affiche le nombre d'échéances critiques à traiter sous 7 jours."
                    }
                ]
            }
        ]
    },
    {
        id: "clients",
        label: "Clients (CRM 360°)",
        icon: Users,
        title: "Gestion de la Relation Client (CRM)",
        description: "Un CRM conçu spécifiquement pour les experts-comptables, centralisant les aspects KYC, juridiques et financiers.",
        sections: [
            {
                title: "Interface de Gestion",
                items: [
                    {
                        name: "Sélecteur de Vue (Grille/Liste)",
                        function: "Alterne entre une vue visuelle par cartes et une vue tabulaire condensée.",
                        result: "Optimise l'affichage selon le volume de clients à gérer."
                    },
                    {
                        name: "Barre de Recherche Intelligente",
                        function: "Filtre instantanément la base client par nom, RCCM, NINEA ou ville.",
                        result: "Accès ultra-rapide aux dossiers, même avec des milliers de références."
                    }
                ]
            },
            {
                title: "Fiche Client IA",
                items: [
                    {
                        name: "Score de Santé Client",
                        function: "Algorithme calculant le risque client basé sur les impayés et les retards de documents.",
                        result: "Indicateur colorimétrique (Vert/Orange/Rouge) pour prioriser la relance."
                    },
                    {
                        name: "Boutons d'Action Rapide",
                        function: "Appel, message ou accès GED direct depuis la carte client.",
                        result: "Gain de temps en évitant d'entrer dans les détails pour des tâches simples."
                    }
                ]
            }
        ]
    },
    {
        id: "missions",
        label: "Missions & Tâches",
        icon: Briefcase,
        title: "Management de la Production",
        description: "Pilotez vos missions de tenue, révision et commissariat aux comptes via un système Kanban intuitif.",
        sections: [
            {
                title: "Tableau Kanban",
                items: [
                    {
                        name: "Colonnes de Flux",
                        function: "Catégorise les missions : À Faire, En Cours, Révision Expert, Terminé.",
                        result: "Suivi visuel de l'avancement de la production du cabinet."
                    },
                    {
                        name: "Bouton 'Nouvelle Mission'",
                        function: "Crée une tâche planifiée associée à un client spécifique.",
                        result: "Assignation automatique aux collaborateurs et définition des échéances."
                    }
                ]
            },
            {
                title: "Cartes de Mission",
                items: [
                    {
                        name: "Indicateur d'Échéance",
                        function: "Alerte de proximité de la deadline avec changement de couleur.",
                        result: "Évite les dépassements de délais légaux et contractuels."
                    }
                ]
            }
        ]
    },
    {
        id: "governance",
        label: "Gouvernance & AG",
        icon: Gavel,
        title: "Secrétariat Juridique Automatisé",
        description: "Gérez la vie sociale des entreprises (AG, CA, modifications statutaires) en conformité stricte avec l'AUSCGIE.",
        sections: [
            {
                title: "Pilotage Juridique",
                items: [
                    {
                        name: "Bouton 'Créer un Acte'",
                        function: "Lance le générateur de documents juridiques (Convocation, PV, Rapport).",
                        result: "Génération d'un PDF normé prêt pour signature et dépôt."
                    },
                    {
                        name: "Statut OHADA",
                        function: "Vérifie si la société est à jour de ses obligations annuelles (AGOA).",
                        result: "Marquage 'Conforme' ou 'Action Requise' pour éviter les sanctions."
                    }
                ]
            }
        ]
    },
    {
        id: "audit",
        label: "Audit & Conformité",
        icon: ShieldAlert,
        title: "Intelligence de Contrôle",
        description: "Module d'audit assisté par IA pour la détection de fraudes et d'anomalies comptables.",
        sections: [
            {
                title: "Analyse IA",
                items: [
                    {
                        name: "Bouton 'Scanner le dossier'",
                        function: "Lance l'analyse heuristique du Grand Livre et du FEC.",
                        result: "Liste détaillée des anomalies (doublons, ruptures de séquence, TVA atypique)."
                    },
                    {
                        name: "Score de Qualité",
                        function: "Évalue la fiabilité globale de la comptabilité analysée.",
                        result: "Synthèse décisionnelle pour l'expert ou le commissaire aux comptes."
                    }
                ]
            }
        ]
    },
    {
        id: "banking",
        label: "Banque & Lettrage IA",
        icon: ArrowRightLeft,
        title: "Réconciliation Bancaire Nouvelle Génération",
        description: "Automatisez le rapprochement entre vos relevés bancaires et vos écritures comptables via un moteur d'IA prédictif.",
        sections: [
            {
                title: "Lettrage Automatique",
                items: [
                    {
                        name: "Suggestion de Mapping",
                        function: "Analyse les libellés bancaires pour suggérer les comptes tiers correspondants.",
                        result: "Le temps de saisie de trésorerie est réduit de 70% grâce au pré-lettrage."
                    }
                ]
            }
        ]
    },
    {
        id: "billing",
        label: "Facturation & Finance",
        icon: Receipt,
        title: "Gestion Financière du Cabinet",
        description: "Pilotez vos honoraires, vos abonnements récurrents et vos encaissements Mobile Money.",
        sections: [
            {
                title: "Production de Factures",
                items: [
                    {
                        name: "Bouton 'Nouvelle Facture'",
                        function: "Génère une facture d'honoraires ou de débours.",
                        result: "Envoi automatique par email au client avec lien de paiement intégré."
                    },
                    {
                        name: "Bouton 'Facturer les heures'",
                        function: "Convertit les temps saisis sur les missions en factures.",
                        result: "Garantit qu'aucune prestation n'est oubliée dans la facturation mensuelle."
                    }
                ]
            },
            {
                title: "Encaissements",
                items: [
                    {
                        name: "Lien de Paiement Mobile Money",
                        function: "Génère un QR Code ou lien de paiement Wave/Orange Money.",
                        result: "Accélération des encaissements et lettrage automatique de la facture."
                    }
                ]
            }
        ]
    },
    {
        id: "payroll",
        label: "Paie & Social",
        icon: Calculator,
        title: "Gestion Sociale Multi-Pays",
        description: "Un moteur de paie flexible couvrant les spécificités sociales de l'espace OHADA.",
        sections: [
            {
                title: "Cycles de Paie",
                items: [
                    {
                        name: "Bouton 'Nouveau Bulletin'",
                        function: "Calcule le salaire net à partir du brut et des variables de paie.",
                        result: "Génération du bulletin de paie conforme au code du travail local."
                    },
                    {
                        name: "Déclarations Sociales",
                        function: "Génère les états pour l'IPRES, la CSS ou la CNPS.",
                        result: "Fichiers prêts pour le télé-versement sur les portails sociaux."
                    }
                ]
            },
            {
                title: "Outils Décisionnels",
                items: [
                    {
                        name: "Simulateur de Coût Salarial",
                        function: "Estime le coût global employeur pour une proposition d'embauche.",
                        result: "Aide à la négociation salariale et à la budgétisation RH."
                    }
                ]
            }
        ]
    },
    {
        id: "fiscalite",
        label: "Fiscalité OHADA",
        icon: CalendarDays,
        title: "Conformité Fiscale Totale",
        description: "Suivez et optimisez vos obligations fiscales dans la zone UEMOA/CEMAC.",
        sections: [
            {
                title: "Calendrier Fiscal",
                items: [
                    {
                        name: "Vue Calendrier Dynamique",
                        function: "Affiche les dates limites de TVA, IS, et acomptes par pays.",
                        result: "Zéro pénalité de retard grâce aux alertes push intelligentes."
                    },
                    {
                        name: "Bouton 'Accéder à l'Optimisation'",
                        function: "Analyse les leviers fiscaux pour réduire l'imposition légalement.",
                        result: "Conseil à forte valeur ajoutée pour vos clients."
                    }
                ]
            }
        ]
    },
    {
        id: "etats-financiers",
        label: "États Financiers",
        icon: FileSpreadsheet,
        title: "Liasse Fiscale & Clôture Annuelle",
        description: "Générez vos états financiers (Bilan, Compte de Résultat, TFT) conformes au SYSCOHADA Révisé 2017.",
        sections: [
            {
                title: "Processus de Clôture",
                items: [
                    {
                        name: "Workflow d'Avancement",
                        function: "Guide l'utilisateur de l'import de la balance à la génération finale.",
                        result: "Processus structuré garantissant l'exhaustivité des contrôles de fin d'année."
                    },
                    {
                        name: "Édition du Mapping OHADA",
                        function: "Permet de lier chaque compte comptable à une case du bilan/résultat.",
                        result: "États financiers exacts même avec des plans de comptes spécifiques."
                    }
                ]
            },
            {
                title: "Exports & Impression",
                items: [
                    {
                        name: "Exports Normalisés DGID",
                        function: "Génère les documents au format officiel A4 pour dépôt.",
                        result: "Documents prêts à être signés et déposés aux autorités fiscales."
                    }
                ]
            }
        ]
    },
    {
        id: "expenses",
        label: "Frais & Missions",
        icon: Plane,
        title: "Gestion des Frais de Déplacement",
        description: "Digitalisez vos notes de frais et gérez vos ordres de mission avec validation par IA.",
        sections: [
            {
                title: "Digitalisation des Reçus",
                items: [
                    {
                        name: "Bouton 'Scan Reçu (IA)'",
                        function: "Utilise l'OCR pour extraire montant, date et TVA d'un ticket pris en photo.",
                        result: "Saisie instantanée sans erreur humaine pour les collaborateurs."
                    }
                ]
            },
            {
                title: "Logistique & Validation",
                items: [
                    {
                        name: "Créer un Ordre de Mission",
                        function: "Définit le budget et la destination d'un futur déplacement.",
                        result: "Contrôle budgétaire en amont des dépenses réelles."
                    }
                ]
            }
        ]
    },
    {
        id: "agenda",
        label: "Agenda Partagé",
        icon: CalendarIcon,
        title: "Planification & Comptes-Rendus IA",
        description: "Planifiez vos réunions et laissez l'IA rédiger vos comptes-rendus de mission.",
        sections: [
            {
                title: "Gestion des Réunions",
                items: [
                    {
                        name: "Bouton 'Rejoindre la visio'",
                        function: "Lance la salle de réunion virtuelle sécurisée directement dans l'application.",
                        result: "Collaboration fluide avec vos clients sans outils tiers."
                    },
                    {
                        name: "Générer Rapport IA",
                        function: "Synthétise les notes prises durant la réunion en un document structuré.",
                        result: "Gain de temps massif sur la rédaction administrative post-réunion."
                    }
                ]
            }
        ]
    },
    {
        id: "library",
        label: "Bibliothèque OHADA",
        icon: Library,
        title: "Recueil Légal & Modèles",
        description: "Accédez instantanément à toute la jurisprudence et aux textes législatifs de l'espace OHADA.",
        sections: [
            {
                title: "Recherche Documentaire",
                items: [
                    {
                        name: "Moteur de Recherche Sémantique",
                        function: "Recherche par mot-clé ou article dans les Actes Uniformes.",
                        result: "Accès immédiat à la base légale pour sécuriser vos avis juridiques."
                    },
                    {
                        name: "Bouton 'Modèles de Documents'",
                        function: "Fournit des modèles types de contrats, statuts et convocations.",
                        result: "Base de travail fiable et conforme pour vos dossiers de secrétariat juridique."
                    }
                ]
            }
        ]
    },
    {
        id: "nexus",
        label: "NEXUS AI Experience",
        icon: BrainCircuit,
        title: "Le Cerveau Augmenté du Cabinet",
        description: "Interagissez avec l'intelligence supérieure du système pour des analyses stratégiques complexes.",
        sections: [
            {
                title: "Commandes Nexus",
                items: [
                    {
                        name: "Simulateur de Fusion (M&A)",
                        function: "Analyse les synergies et risques entre deux entités comptables.",
                        result: "Évaluation de faisabilité stratégique en quelques secondes."
                    },
                    {
                        name: "Audit Flash IA",
                        function: "Lance un scan instantané des anomalies sur l'ensemble du Grand Livre.",
                        result: "Détection proactive de fraudes ou d'erreurs d'imputation complexes."
                    }
                ]
            }
        ]
    },
    {
        id: "strategy",
        label: "Strategy & BP Lab",
        icon: Rocket,
        title: "Laboratoire de Valorisation",
        description: "Construisez des business plans robustes et calculez la valeur de vos startups clientes.",
        sections: [
            {
                title: "Projection & Valorisation",
                items: [
                    {
                        name: "Optimiser via IA",
                        function: "Affine les hypothèses de croissance à partir des données de marché.",
                        result: "Business plan crédible et séduisant pour les levées de fonds."
                    },
                    {
                        name: "Calculateur de Pre-Money",
                        function: "Détermine la valeur de l'entreprise via les méthodes multiples et DCF.",
                        result: "Chiffrage précis pour les tables de capitalisation."
                    }
                ]
            },
            {
                title: "Livrables",
                items: [
                    {
                        name: "Exporter .PPTX",
                        function: "Génère un Pitch Deck visuel à partir du business plan.",
                        result: "Présentation prête pour le passage devant les comités d'investissement."
                    }
                ]
            }
        ]
    }
];

export default function DetailedManualPage() {
    const [activeChapter, setActiveChapter] = useState(CHAPTERS[0].id);
    const [viewMode, setViewMode] = useState<'chapter' | 'full'>('chapter');

    const chapter = CHAPTERS.find(c => c.id === activeChapter) || CHAPTERS[0];

    return (
        <div className="min-h-screen bg-[#050608] flex overflow-hidden font-sans">
            <style jsx global>{`
                @media print {
                    @page { margin: 1cm; size: A4; }
                    body { background: white !important; color: black !important; -webkit-print-color-adjust: exact; }
                    aside { display: none !important; }
                    main { padding: 0 !important; margin: 0 !important; overflow: visible !important; }
                    .no-print { display: none !important; }
                    .glass-card, .bg-gray-900, .bg-slate-900, .bg-[#050608], .bg-[#0d1117] { 
                        background: white !important; 
                        border: 1px solid #ddd !important;
                        box-shadow: none !important;
                        color: black !important;
                    }
                    h1, h2, h3, h4, p, span, div { color: black !important; text-shadow: none !important; }
                    .text-slate-400, .text-slate-500 { color: #555 !important; }
                    .text-indigo-400, .text-indigo-500 { color: #333 !important; font-weight: bold !important; }
                }
            `}</style>
            {/* Left Sidebar Table of Contents */}
            <aside className="w-80 bg-[#0d1117] border-r border-white/5 flex flex-col p-8 gap-8 overflow-y-auto shrink-0 relative z-20">
                <div className="flex flex-col items-center gap-4 py-8 border-b border-white/5">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-2xl shadow-indigo-500/20 rotate-3 hover:rotate-0 transition-transform cursor-pointer">
                        EP
                    </div>
                    <div className="text-center">
                        <h1 className="font-black text-white tracking-[0.2em] uppercase text-xs">Manuel Expert</h1>
                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-2 flex items-center justify-center gap-2">
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                            Guide Complet 2026
                        </p>
                    </div>
                </div>

                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Rechercher une fonction..."
                        className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs text-slate-300 focus:border-indigo-500/50 transition-all outline-none"
                    />
                </div>

                <nav className="flex flex-col gap-1.5 custom-scrollbar pr-2">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mb-3 ml-2">Sommaire Général</p>
                    {CHAPTERS.map((ch) => {
                        const Icon = ch.icon;
                        const isActive = activeChapter === ch.id;
                        return (
                            <button
                                key={ch.id}
                                onClick={() => setActiveChapter(ch.id)}
                                className={cn(
                                    "flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group relative",
                                    isActive
                                        ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 translate-x-1"
                                        : "text-slate-500 hover:bg-white/5 hover:text-slate-200"
                                )}
                            >
                                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-r-full" />}
                                <Icon className={cn("w-5 h-5", isActive ? "text-white" : "group-hover:text-indigo-400")} />
                                <span className="font-bold text-xs">{ch.label}</span>
                                {isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
                            </button>
                        );
                    })}
                </nav>

                <div className="mt-4 px-2 space-y-2">
                    <button
                        onClick={() => setViewMode(viewMode === 'chapter' ? 'full' : 'chapter')}
                        className={cn(
                            "w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all border",
                            viewMode === 'full'
                                ? "bg-indigo-500 text-white border-indigo-500"
                                : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
                        )}
                    >
                        <FileDown className="w-4 h-4" />
                        {viewMode === 'full' ? "Vue Par Chapitre" : "Vue Complète (PDF)"}
                    </button>

                    {viewMode === 'full' && (
                        <button
                            onClick={() => window.print()}
                            className="w-full py-3 bg-white text-indigo-900 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2 shadow-lg"
                        >
                            <Printer className="w-4 h-4" />
                            Imprimer / PDF
                        </button>
                    )}
                </div>

                <div className="mt-8 p-6 bg-indigo-600/10 border border-indigo-500/20 rounded-[32px] space-y-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <HelpCircle className="w-12 h-12 text-indigo-400" />
                    </div>
                    <p className="text-[11px] text-indigo-200 font-bold tracking-widest uppercase leading-relaxed relative z-10">
                        Besoin d'aide sur une fonctionnalité OHADA ?
                    </p>
                    <button className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg hover:bg-indigo-500 transition-all relative z-10 border border-white/10">
                        Contacter le Support
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto bg-[#050608] p-12 lg:p-24 relative">
                {/* Background Aesthetics */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/5 blur-[100px] rounded-full pointer-events-none" />

                <div className="max-w-4xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">

                    {/* Chapter Header */}
                    {viewMode === 'chapter' ? (
                        <ChapterContent chapter={chapter} />
                    ) : (
                        <div className="space-y-24">
                            <div className="text-center py-12 border-b border-black/10 hidden print:block">
                                <h1 className="text-4xl font-black uppercase tracking-widest mb-4">Manuel Utilisateur Expert</h1>
                                <p>Généré le {new Date().toLocaleDateString()}</p>
                            </div>
                            {CHAPTERS.map(ch => (
                                <div key={ch.id} className="break-inside-avoid page-break">
                                    <ChapterContent chapter={ch} />
                                    <div className="my-12 border-b border-dashed border-slate-700/30 print:border-black/20" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Tips */}
                <div className="p-12 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-[50px] border border-white/5 space-y-6 text-center no-print">
                    <div className="inline-flex p-4 bg-white/5 rounded-3xl text-indigo-400">
                        <Sparkles className="w-8 h-8" />
                    </div>
                    <h4 className="text-2xl font-black text-white">Astuce d'Expert</h4>
                    <p className="text-slate-400 max-w-xl mx-auto leading-relaxed">
                        Saviez-vous que vous pouvez utiliser des raccourcis clavier pour naviguer entre ces sections ?
                        Combinez <kbd className="px-2 py-1 bg-slate-800 rounded text-xs text-white">Alt</kbd> + <kbd className="px-2 py-1 bg-slate-800 rounded text-xs text-white">N</kbd> pour passer au chapitre suivant.
                    </p>
                </div>
            </main>
        </div>
    );
}


