"use client";

import { useState } from "react";
import {
    FileCog,
    CheckSquare,
    FileSignature,
    Printer,
    Save,
    ChevronRight,
    AlertCircle,
    FileText,
    Package,
    Factory,
    Calculator,
    BarChart3,
    Plus,
    Download,
    Upload,
    Search,
    Filter,
    TrendingUp,
    DollarSign,
    Boxes,
    Wrench,
    ClipboardList,
    Target,
    PieChart,
    Layers,
    ArrowRight,
    Edit3,
    Trash2,
    Eye,
    Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

type MissionType = "standard" | "inventory" | "costing" | "analytical";

interface PrepDocument {
    id: string;
    title: string;
    type: "contract" | "checklist" | "memo";
    status: "pending" | "draft" | "validated";
    mandatory: boolean;
    lastModified?: string;
}

interface FixedAsset {
    id: string;
    code: string;
    designation: string;
    category: string;
    acquisitionDate: string;
    acquisitionValue: number;
    amortization: number;
    netValue: number;
    location: string;
    status: "active" | "disposed" | "missing";
}

interface Product {
    id: string;
    code: string;
    name: string;
    category: string;
    directMaterials: number;
    directLabor: number;
    overheads: number;
    totalCost: number;
    sellingPrice: number;
    margin: number;
}

interface AnalyticalCenter {
    id: string;
    code: string;
    name: string;
    type: "production" | "distribution" | "admin";
    revenue: number;
    costs: number;
    result: number;
}

const MISSION_TEMPLATES: PrepDocument[] = [
    { id: "1", title: "Acceptation de Mandat & Risques (NEO)", type: "checklist", status: "validated", mandatory: true, lastModified: "20/05/2024" },
    { id: "2", title: "Lettre de Mission (Modèle ONECCA)", type: "contract", status: "draft", mandatory: true, lastModified: "18:30" },
    { id: "3", title: "Déclaration d'Indépendance", type: "checklist", status: "pending", mandatory: true },
    { id: "4", title: "Plan de Mission & Budget", type: "memo", status: "pending", mandatory: false },
];

const MOCK_ASSETS: FixedAsset[] = [
    { id: "1", code: "IMM-001", designation: "Bâtiment Principal", category: "Construction", acquisitionDate: "15/03/2020", acquisitionValue: 250000000, amortization: 25000000, netValue: 225000000, location: "Siège Abidjan", status: "active" },
    { id: "2", code: "MAT-045", designation: "Machine de Production A", category: "Matériel Industriel", acquisitionDate: "10/06/2022", acquisitionValue: 45000000, amortization: 9000000, netValue: 36000000, location: "Atelier 1", status: "active" },
    { id: "3", code: "VEH-012", designation: "Camion de Livraison", category: "Matériel de Transport", acquisitionDate: "22/01/2023", acquisitionValue: 18000000, amortization: 3600000, netValue: 14400000, location: "Parc Auto", status: "active" },
    { id: "4", code: "INF-089", designation: "Serveur Dell PowerEdge", category: "Matériel Informatique", acquisitionDate: "05/09/2021", acquisitionValue: 3500000, amortization: 2333333, netValue: 1166667, location: "Salle Serveur", status: "active" },
];

const MOCK_PRODUCTS: Product[] = [
    { id: "1", code: "PROD-A1", name: "Produit Fini Alpha", category: "Série A", directMaterials: 1200, directLabor: 800, overheads: 400, totalCost: 2400, sellingPrice: 3500, margin: 31.4 },
    { id: "2", code: "PROD-B2", name: "Produit Fini Beta", category: "Série B", directMaterials: 2500, directLabor: 1500, overheads: 800, totalCost: 4800, sellingPrice: 6800, margin: 29.4 },
    { id: "3", code: "PROD-C3", name: "Produit Fini Gamma", category: "Série C", directMaterials: 800, directLabor: 500, overheads: 300, totalCost: 1600, sellingPrice: 2200, margin: 27.3 },
];

const MOCK_CENTERS: AnalyticalCenter[] = [
    { id: "1", code: "PROD-01", name: "Atelier de Fabrication", type: "production", revenue: 0, costs: 125000000, result: -125000000 },
    { id: "2", code: "DIST-01", name: "Service Commercial", type: "distribution", revenue: 450000000, costs: 85000000, result: 365000000 },
    { id: "3", code: "ADM-01", name: "Administration Générale", type: "admin", revenue: 0, costs: 45000000, result: -45000000 },
];

export default function MissionPrepPage() {
    const [selectedClient, setSelectedClient] = useState("Société Ivoirienne de Banque");
    const [missionType, setMissionType] = useState<MissionType>("standard");
    const [selectedDoc, setSelectedDoc] = useState<PrepDocument | null>(MISSION_TEMPLATES[1]);
    const [docContent, setDocContent] = useState(`LETTRE DE MISSION

ENTRE LES SOUSSIGNÉS :

Le Cabinet [NOM_CABINET], Société d'Expertise Comptable inscrite au Tableau de l'Ordre sous le n°..., 
Représenté par [NOM_EXPERT], Expert-Comptable Diplômé.
Ci-après désigné "Le Cabinet"

ET

${selectedClient}
[ADRESSE_CLIENT]
Représentée par [NOM_DIRIGEANT]
Ci-après désignée "Le Client"

1. OBJET DE LA MISSION
La présente mission a pour objet : Tenue de comptabilité et Établissement des comptes annuels (Système Normal OHADA).

2. OBLIGATIONS DU CABINET
Le Cabinet s'engage à respecter les normes professionnelles de l'Ordre...`);

    const [showMissionReport, setShowMissionReport] = useState(false);
    const [isGeneratingMissionReport, setIsGeneratingMissionReport] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [missionReport, setMissionReport] = useState({
        title: "",
        summary: "",
        technical: "",
        findings: "",
        recommendations: "",
        conclusion: ""
    });

    const generateMissionReport = () => {
        setIsGeneratingMissionReport(true);
        setTimeout(() => {
            let content = { title: "", summary: "", technical: "", findings: "", recommendations: "", conclusion: "" };

            if (missionType === "inventory") {
                content = {
                    title: "RAPPORT D'INVENTAIRE PHYSIQUE DES IMMOBILISATIONS",
                    summary: `La mission d'inventaire physique des immobilisations de ${selectedClient} pour l'exercice 2024 s'est déroulée du 15 au 25 mai 2024. L'objectif était de recenser l'intégralité des actifs, de vérifier leur existence physique et leur état, et de procéder au rapprochement avec le fichier comptable.`,
                    technical: "La méthodologie a reposé sur un étiquetage par QR Code et une saisie mobile synchronisée. Le périmètre couvrait 247 actifs répartis sur 4 sites géographiques. La valeur brute globale inventoriée s'élève à 316.5M FCFA.",
                    findings: "• Taux de rapprochement initial : 85%\n• Écarts d'inventaire détectés : 12 immobilisations non localisées (8.5M FCFA)\n• Actifs non valorisés en comptabilité : 5 machines identifiées en atelier\n• État de conservation : 15% du matériel informatique est obsolète ou hors d'usage.",
                    recommendations: "1. Procéder à la mise au rebut des actifs obsolètes.\n2. Régulariser les écritures comptables pour les 5 machines non inscrites.\n3. Renforcer la procédure de sortie d'actifs par un bon de mouvement systématique.\n4. Planifier un inventaire tournant trimestriel pour les actifs à haute valeur.",
                    conclusion: "L'inventaire confirme la robustesse globale du patrimoine de l'entreprise, sous réserve des régularisations identifiées. Le rapprochement final après écritures de régularisation atteindra 100%."
                };
            } else if (missionType === "costing") {
                content = {
                    title: "ANALYSE DES COÛTS DE REVIENT ET MARGES DE FABRICATION",
                    summary: `L'étude porte sur la structure des coûts de revient de la gamme de production 2024. L'analyse a été menée selon la méthode des coûts complets pour identifier les leviers de rentabilité par famille de produits.`,
                    technical: "Les charges ont été ventilées en : Matières Premières (48%), MOD (32%) et Overheads (20%). Le coût moyen de fabrication s'établit à 2,933 FCFA par unité contre un prix de vente moyen de 4,166 FCFA.",
                    findings: "• Marge brute moyenne : 29.4% (Cible : 30%)\n• Sous-efficience détectée sur la Série B (Marge 29.4%)\n• Dérive des coûts énergétiques impactant les charges indirectes (+15% vs budget)\n• Temps de réglage des machines supérieur de 20% aux standards.",
                    recommendations: "1. Réviser les fiches techniques de la Série B.\n2. Négocier des contrats cadres pour les matières premières stratégiques.\n3. Investir dans un système de monitoring énergétique par machine.\n4. Formations spécifiques du personnel de production sur l'optimisation des temps de réglage.",
                    conclusion: "La structure de coût est saine mais perfectible. Une réduction de 5% du coût des matières premières permettrait de dépasser l'objectif de marge cible de 30%."
                };
            } else if (missionType === "analytical") {
                content = {
                    title: "RAPPORT DE COMPTABILITÉ ANALYTIQUE ET PERFORMANCE",
                    summary: `Synthèse de la performance par centre de responsabilité pour le semestre écoulé. L'objectif est d'évaluer la rentabilité relative des centres de production et de distribution.`,
                    technical: "L'analyse repose sur le découpage de l'entreprise en 12 centres analytiques. Les clés de répartition ont été mises à jour pour refléter l'utilisation réelle des ressources partagées.",
                    findings: "• Résultat Global : 195M FCFA (+18% sur un an)\n• Rentabilité exceptionnelle du centre 'Service Commercial' (Taux de marge 81.1%)\n• Le centre 'Atelier Fabrication' absorbe 125M FCFA de charges\n• Les frais administratifs sont maîtrisés à 10% du CA total.",
                    recommendations: "1. Revoir la facturation interne des prestations de l'atelier.\n2. Développer les incitations commerciales basées sur la marge analytique et non le CA brut.\n3. Automatiser le reporting mensuel par centre pour un pilotage proactif.\n4. Analyser plus finement les coûts fixes du centre administratif.",
                    conclusion: "L'entreprise présente une excellente maîtrise de sa structure analytique. Le dynamisme commercial compense largement les coûts de production, assurant une rentabilité globale robuste."
                };
            }

            setMissionReport(content);
            setIsGeneratingMissionReport(false);
            setShowMissionReport(true);
        }, 2500);
    };

    const regenerateMissionSection = (section: keyof typeof missionReport) => {
        // Logic to simulate regeneration
        setMissionReport(prev => ({
            ...prev,
            [section]: prev[section] + "\n\n[Contenu actualisé par l'algorithme IA v4.5]"
        }));
    };

    const renderStandardMission = () => (
        <div className="h-full flex gap-6">
            {/* Sidebar: Context & Checklist */}
            <div className="w-96 flex flex-col gap-6">
                {/* Client Selector (Context) */}
                <div className="glass-card rounded-2xl p-4 border border-slate-700/50">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Dossier Client</label>
                    <select
                        value={selectedClient}
                        onChange={(e) => setSelectedClient(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500 font-medium"
                    >
                        <option>Société Ivoirienne de Banque</option>
                        <option>Traoré Import-Export</option>
                        <option>Boulangerie du Plateau</option>
                    </select>
                    <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 p-2 rounded border border-emerald-500/20">
                        <CheckSquare className="w-4 h-4" />
                        <span>Exercice 2024 ouvert</span>
                    </div>
                </div>

                {/* Documents List */}
                <div className="flex-1 glass-card rounded-2xl border border-slate-700/50 overflow-hidden flex flex-col">
                    <div className="p-4 bg-slate-900/50 border-b border-slate-700/50 flex justify-between items-center">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <FileCog className="w-4 h-4 text-cyan-400" />
                            Documents Requis
                        </h3>
                        <span className="text-xs bg-slate-800 px-2 py-1 rounded-full text-slate-400">1/4</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {MISSION_TEMPLATES.map(doc => (
                            <div
                                key={doc.id}
                                onClick={() => setSelectedDoc(doc)}
                                className={cn(
                                    "p-3 rounded-xl border cursor-pointer transition-all group relative",
                                    selectedDoc?.id === doc.id
                                        ? "bg-slate-800 border-indigo-500"
                                        : "bg-transparent border-transparent hover:bg-slate-800/50"
                                )}
                            >
                                <div className="flex justify-between items-start">
                                    <span className={cn(
                                        "font-medium text-sm pr-6",
                                        selectedDoc?.id === doc.id ? "text-white" : "text-slate-300"
                                    )}>{doc.title}</span>
                                    {doc.mandatory && (
                                        <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                    )}
                                </div>

                                <div className="flex items-center gap-2 mt-2">
                                    <span className={cn(
                                        "text-[10px] px-1.5 py-0.5 rounded border uppercase font-bold",
                                        doc.status === "validated" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                            doc.status === "draft" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                "bg-slate-700 text-slate-500 border-slate-600"
                                    )}>
                                        {doc.status === "pending" ? "À faire" : doc.status === "draft" ? "Brouillon" : "Validé"}
                                    </span>
                                    {doc.lastModified && <span className="text-[10px] text-slate-600">Modifié: {doc.lastModified}</span>}
                                </div>

                                {selectedDoc?.id === doc.id && (
                                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-xl" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Editor / Preview Area */}
            <div className="flex-1 glass-card rounded-2xl border border-slate-700/50 flex flex-col overflow-hidden">
                {selectedDoc ? (
                    <>
                        <div className="p-4 border-b border-slate-700/50 bg-slate-900/50 flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-bold text-white">{selectedDoc.title}</h2>
                                <p className="text-xs text-slate-500">Modèle standard mis à jour le 01/01/2024 • ONECCA</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 flex items-center gap-2">
                                    <Printer className="w-4 h-4" />
                                    Imprimer
                                </button>
                                <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                                    <Save className="w-4 h-4" />
                                    Enregistrer
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 bg-slate-100 text-slate-900 p-8 overflow-y-auto">
                            <div className="max-w-3xl mx-auto bg-white shadow-xl min-h-[800px] p-12">
                                {/* Document Mock */}
                                <div className="flex justify-between items-start mb-12 border-b-2 border-slate-900 pb-4">
                                    <div>
                                        <h1 className="text-2xl font-bold uppercase tracking-widest">Cabinet 360</h1>
                                        <p className="text-xs text-slate-500">Abidjan, Plateau, Immeuble Trade Center</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold">Réf: {selectedDoc.id}-2024</p>
                                        <p className="text-sm">Date: 25/05/2024</p>
                                    </div>
                                </div>

                                <textarea
                                    className="w-full h-[600px] resize-none focus:outline-none text-sm font-serif leading-relaxed"
                                    value={docContent}
                                    onChange={(e) => setDocContent(e.target.value)}
                                />

                                <div className="mt-12 pt-8 border-t border-slate-200 flex justify-between">
                                    <div className="text-center">
                                        <p className="text-sm font-bold mb-16">Le Cabinet</p>
                                        <p className="text-xs italic text-slate-400">(Signature Expert)</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-bold mb-16">Le Client</p>
                                        <p className="text-xs italic text-slate-400">Lu et approuvé</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                        <FileText className="w-16 h-16 mb-4 opacity-20" />
                        <p>Sélectionnez un document pour l'éditer</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderInventoryMission = () => (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Package className="w-7 h-7 text-cyan-400" />
                        Mission Inventaire des Immobilisations
                    </h2>
                    <p className="text-slate-400 mt-1">Recensement physique, rapprochement comptable et valorisation</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold border border-slate-700 flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Importer Excel
                    </button>
                    <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold shadow-lg shadow-cyan-500/25 flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Nouvelle Immobilisation
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
                <StatCard icon={Boxes} label="Total Immobilisations" value="247" trend="+12" color="cyan" />
                <StatCard icon={DollarSign} label="Valeur Brute" value="316.5M FCFA" trend="+5.2%" color="emerald" />
                <StatCard icon={TrendingUp} label="Amortissements" value="40.1M FCFA" color="amber" />
                <StatCard icon={Target} label="Valeur Nette Comptable" value="276.4M FCFA" color="indigo" />
            </div>

            {/* Filters & Search */}
            <div className="glass-card rounded-2xl p-4 border border-slate-700/50 flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Rechercher par code, désignation, localisation..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                </div>
                <select className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500">
                    <option>Toutes catégories</option>
                    <option>Construction</option>
                    <option>Matériel Industriel</option>
                    <option>Matériel de Transport</option>
                    <option>Matériel Informatique</option>
                </select>
                <select className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500">
                    <option>Tous statuts</option>
                    <option>Actif</option>
                    <option>Cédé</option>
                    <option>Manquant</option>
                </select>
            </div>

            {/* Assets Table */}
            <div className="glass-card rounded-2xl border border-slate-700/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-700/50 bg-slate-900/50">
                                <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase">Code</th>
                                <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase">Désignation</th>
                                <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase">Catégorie</th>
                                <th className="text-right p-4 text-xs font-bold text-slate-500 uppercase">Valeur Acquisition</th>
                                <th className="text-right p-4 text-xs font-bold text-slate-500 uppercase">Amortissement</th>
                                <th className="text-right p-4 text-xs font-bold text-slate-500 uppercase">VNC</th>
                                <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase">Localisation</th>
                                <th className="text-center p-4 text-xs font-bold text-slate-500 uppercase">Statut</th>
                                <th className="text-center p-4 text-xs font-bold text-slate-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MOCK_ASSETS.map((asset) => (
                                <tr key={asset.id} className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors">
                                    <td className="p-4 text-sm font-mono text-cyan-400">{asset.code}</td>
                                    <td className="p-4 text-sm text-white font-medium">{asset.designation}</td>
                                    <td className="p-4 text-sm text-slate-400">{asset.category}</td>
                                    <td className="p-4 text-sm text-right font-mono text-slate-300">{(asset.acquisitionValue / 1000000).toFixed(1)}M</td>
                                    <td className="p-4 text-sm text-right font-mono text-amber-400">{(asset.amortization / 1000000).toFixed(1)}M</td>
                                    <td className="p-4 text-sm text-right font-mono text-emerald-400 font-bold">{(asset.netValue / 1000000).toFixed(1)}M</td>
                                    <td className="p-4 text-sm text-slate-400">{asset.location}</td>
                                    <td className="p-4 text-center">
                                        <span className={cn(
                                            "px-2 py-1 rounded-full text-xs font-bold",
                                            asset.status === "active" ? "bg-emerald-500/10 text-emerald-400" :
                                                asset.status === "disposed" ? "bg-slate-700 text-slate-400" :
                                                    "bg-rose-500/10 text-rose-400"
                                        )}>
                                            {asset.status === "active" ? "Actif" : asset.status === "disposed" ? "Cédé" : "Manquant"}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button className="p-1.5 hover:bg-slate-700 rounded transition-colors">
                                                <Eye className="w-4 h-4 text-slate-400" />
                                            </button>
                                            <button className="p-1.5 hover:bg-slate-700 rounded transition-colors">
                                                <Edit3 className="w-4 h-4 text-slate-400" />
                                            </button>
                                            <button className="p-1.5 hover:bg-slate-700 rounded transition-colors">
                                                <Trash2 className="w-4 h-4 text-rose-400" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Actions Footer */}
            <div className="grid grid-cols-3 gap-4">
                <button className="p-4 glass-card rounded-xl border border-slate-700/50 hover:border-cyan-500/50 transition-all text-left group">
                    <Download className="w-6 h-6 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
                    <h4 className="font-bold text-white text-sm">Exporter Inventaire</h4>
                    <p className="text-xs text-slate-500 mt-1">Format Excel avec photos</p>
                </button>
                <button
                    onClick={generateMissionReport}
                    disabled={isGeneratingMissionReport}
                    className="p-4 glass-card rounded-xl border border-slate-700/50 hover:border-emerald-500/50 transition-all text-left group disabled:opacity-50"
                >
                    <ClipboardList className="w-6 h-6 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                    <h4 className="font-bold text-white text-sm">{isGeneratingMissionReport ? "Génération..." : "Rapport de Mission"}</h4>
                    <p className="text-xs text-slate-500 mt-1">Générer rapport final IA</p>
                </button>
                <button className="p-4 glass-card rounded-xl border border-slate-700/50 hover:border-indigo-500/50 transition-all text-left group">
                    <Zap className="w-6 h-6 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
                    <h4 className="font-bold text-white text-sm">Rapprochement Auto</h4>
                    <p className="text-xs text-slate-500 mt-1">IA vs Comptabilité</p>
                </button>
            </div>
        </div>
    );

    const renderCostingMission = () => (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Calculator className="w-7 h-7 text-amber-400" />
                        Calcul des Coûts de Revient - Production
                    </h2>
                    <p className="text-slate-400 mt-1">Méthode des coûts complets (Matières + MOD + Charges indirectes)</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold border border-slate-700 flex items-center gap-2">
                        <Factory className="w-4 h-4" />
                        Paramètres Clés
                    </button>
                    <button className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold shadow-lg shadow-amber-500/25 flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Nouveau Produit
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
                <StatCard icon={Boxes} label="Produits Suivis" value="18" color="amber" />
                <StatCard icon={DollarSign} label="Coût Moyen" value="2,933 FCFA" color="emerald" />
                <StatCard icon={TrendingUp} label="Marge Moyenne" value="29.4%" trend="+2.1%" color="cyan" />
                <StatCard icon={Target} label="Taux de Marge Cible" value="30%" color="indigo" />
            </div>

            {/* Products Table */}
            <div className="glass-card rounded-2xl border border-slate-700/50 overflow-hidden">
                <div className="p-4 bg-slate-900/50 border-b border-slate-700/50">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-amber-400" />
                        Analyse des Coûts de Revient par Produit
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-700/50 bg-slate-900/50">
                                <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase">Code</th>
                                <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase">Produit</th>
                                <th className="text-right p-4 text-xs font-bold text-slate-500 uppercase">Matières</th>
                                <th className="text-right p-4 text-xs font-bold text-slate-500 uppercase">MOD</th>
                                <th className="text-right p-4 text-xs font-bold text-slate-500 uppercase">Charges Ind.</th>
                                <th className="text-right p-4 text-xs font-bold text-slate-500 uppercase">Coût Total</th>
                                <th className="text-right p-4 text-xs font-bold text-slate-500 uppercase">Prix Vente</th>
                                <th className="text-right p-4 text-xs font-bold text-slate-500 uppercase">Marge %</th>
                                <th className="text-center p-4 text-xs font-bold text-slate-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MOCK_PRODUCTS.map((product) => (
                                <tr key={product.id} className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors">
                                    <td className="p-4 text-sm font-mono text-amber-400">{product.code}</td>
                                    <td className="p-4 text-sm text-white font-medium">{product.name}</td>
                                    <td className="p-4 text-sm text-right font-mono text-slate-300">{product.directMaterials.toLocaleString()}</td>
                                    <td className="p-4 text-sm text-right font-mono text-slate-300">{product.directLabor.toLocaleString()}</td>
                                    <td className="p-4 text-sm text-right font-mono text-slate-300">{product.overheads.toLocaleString()}</td>
                                    <td className="p-4 text-sm text-right font-mono text-cyan-400 font-bold">{product.totalCost.toLocaleString()}</td>
                                    <td className="p-4 text-sm text-right font-mono text-emerald-400">{product.sellingPrice.toLocaleString()}</td>
                                    <td className="p-4 text-sm text-right font-mono">
                                        <span className={cn(
                                            "font-bold",
                                            product.margin >= 30 ? "text-emerald-400" :
                                                product.margin >= 25 ? "text-amber-400" :
                                                    "text-rose-400"
                                        )}>
                                            {product.margin.toFixed(1)}%
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button className="p-1.5 hover:bg-slate-700 rounded transition-colors">
                                                <Eye className="w-4 h-4 text-slate-400" />
                                            </button>
                                            <button className="p-1.5 hover:bg-slate-700 rounded transition-colors">
                                                <Edit3 className="w-4 h-4 text-slate-400" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Actions Footer */}
            <div className="grid grid-cols-3 gap-4">
                <button className="p-4 glass-card rounded-xl border border-slate-700/50 hover:border-amber-500/50 transition-all text-left group">
                    <BarChart3 className="w-6 h-6 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                    <h4 className="font-bold text-white text-sm">Analyse Comparative</h4>
                    <p className="text-xs text-slate-500 mt-1">Comparer aux standards OHADA</p>
                </button>
                <button
                    onClick={generateMissionReport}
                    disabled={isGeneratingMissionReport}
                    className="p-4 glass-card rounded-xl border border-slate-700/50 hover:border-emerald-500/50 transition-all text-left group disabled:opacity-50"
                >
                    <ClipboardList className="w-6 h-6 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                    <h4 className="font-bold text-white text-sm">{isGeneratingMissionReport ? "Génération..." : "Rapport de Coûts IA"}</h4>
                    <p className="text-xs text-slate-500 mt-1">Générer rapport de rentabilité</p>
                </button>
                <button className="p-4 glass-card rounded-xl border border-slate-700/50 hover:border-indigo-500/50 transition-all text-left group">
                    <Download className="w-6 h-6 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
                    <h4 className="font-bold text-white text-sm">Exporter Fiches Coûts</h4>
                    <p className="text-xs text-slate-500 mt-1">PDF individuel par produit</p>
                </button>
            </div>
        </div>
    );

    const renderAnalyticalMission = () => (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Layers className="w-7 h-7 text-indigo-400" />
                        Comptabilité Analytique par Centre
                    </h2>
                    <p className="text-slate-400 mt-1">Analyse de rentabilité par centre de responsabilité</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold border border-slate-700 flex items-center gap-2">
                        <Wrench className="w-4 h-4" />
                        Clés de Répartition
                    </button>
                    <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold shadow-lg shadow-indigo-500/25 flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Nouveau Centre
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
                <StatCard icon={Layers} label="Centres Actifs" value="12" color="indigo" />
                <StatCard icon={DollarSign} label="Chiffre d'Affaires" value="450M FCFA" trend="+12%" color="emerald" />
                <StatCard icon={TrendingUp} label="Charges Totales" value="255M FCFA" color="rose" />
                <StatCard icon={Target} label="Résultat Global" value="195M FCFA" trend="+18%" color="cyan" />
            </div>

            {/* Centers Table */}
            <div className="glass-card rounded-2xl border border-slate-700/50 overflow-hidden">
                <div className="p-4 bg-slate-900/50 border-b border-slate-700/50">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-indigo-400" />
                        Tableau de Bord Analytique par Centre
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-700/50 bg-slate-900/50">
                                <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase">Code</th>
                                <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase">Centre de Responsabilité</th>
                                <th className="text-center p-4 text-xs font-bold text-slate-500 uppercase">Type</th>
                                <th className="text-right p-4 text-xs font-bold text-slate-500 uppercase">Produits</th>
                                <th className="text-right p-4 text-xs font-bold text-slate-500 uppercase">Charges</th>
                                <th className="text-right p-4 text-xs font-bold text-slate-500 uppercase">Résultat</th>
                                <th className="text-right p-4 text-xs font-bold text-slate-500 uppercase">Taux Marge</th>
                                <th className="text-center p-4 text-xs font-bold text-slate-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MOCK_CENTERS.map((center) => (
                                <tr key={center.id} className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors">
                                    <td className="p-4 text-sm font-mono text-indigo-400">{center.code}</td>
                                    <td className="p-4 text-sm text-white font-medium">{center.name}</td>
                                    <td className="p-4 text-center">
                                        <span className={cn(
                                            "px-2 py-1 rounded-full text-xs font-bold",
                                            center.type === "production" ? "bg-amber-500/10 text-amber-400" :
                                                center.type === "distribution" ? "bg-emerald-500/10 text-emerald-400" :
                                                    "bg-slate-700 text-slate-400"
                                        )}>
                                            {center.type === "production" ? "Production" : center.type === "distribution" ? "Distribution" : "Admin"}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-right font-mono text-emerald-400">{(center.revenue / 1000000).toFixed(0)}M</td>
                                    <td className="p-4 text-sm text-right font-mono text-rose-400">{(center.costs / 1000000).toFixed(0)}M</td>
                                    <td className="p-4 text-sm text-right font-mono font-bold">
                                        <span className={center.result >= 0 ? "text-emerald-400" : "text-rose-400"}>
                                            {(center.result / 1000000).toFixed(0)}M
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-right font-mono">
                                        {center.revenue > 0 ? (
                                            <span className={cn(
                                                "font-bold",
                                                (center.result / center.revenue * 100) >= 70 ? "text-emerald-400" :
                                                    (center.result / center.revenue * 100) >= 50 ? "text-amber-400" :
                                                        "text-slate-400"
                                            )}>
                                                {((center.result / center.revenue) * 100).toFixed(1)}%
                                            </span>
                                        ) : (
                                            <span className="text-slate-600">N/A</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button className="p-1.5 hover:bg-slate-700 rounded transition-colors">
                                                <Eye className="w-4 h-4 text-slate-400" />
                                            </button>
                                            <button className="p-1.5 hover:bg-slate-700 rounded transition-colors">
                                                <Edit3 className="w-4 h-4 text-slate-400" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Actions Footer */}
            <div className="grid grid-cols-3 gap-4">
                <button className="p-4 glass-card rounded-xl border border-slate-700/50 hover:border-indigo-500/50 transition-all text-left group">
                    <TrendingUp className="w-6 h-6 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
                    <h4 className="font-bold text-white text-sm">Simulation Seuil</h4>
                    <p className="text-xs text-slate-500 mt-1">Calculer point mort par centre</p>
                </button>
                <button
                    onClick={generateMissionReport}
                    disabled={isGeneratingMissionReport}
                    className="p-4 glass-card rounded-xl border border-slate-700/50 hover:border-emerald-500/50 transition-all text-left group disabled:opacity-50"
                >
                    <ClipboardList className="w-6 h-6 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                    <h4 className="font-bold text-white text-sm">{isGeneratingMissionReport ? "Génération..." : "Rapport Analytique IA"}</h4>
                    <p className="text-xs text-slate-500 mt-1">Générer synthèse de performance</p>
                </button>
                <button className="p-4 glass-card rounded-xl border border-slate-700/50 hover:border-indigo-500/50 transition-all text-left group">
                    <Save className="w-6 h-6 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
                    <h4 className="font-bold text-white text-sm">Clôtures Périodiques</h4>
                    <p className="text-xs text-slate-500 mt-1">Figer les résultats du mois</p>
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Mission Type Selector */}
            <div className="flex gap-3 p-2 glass-card rounded-2xl border border-slate-700/50 w-fit">
                <MissionTypeButton
                    icon={FileSignature}
                    label="Mission Standard"
                    active={missionType === "standard"}
                    onClick={() => setMissionType("standard")}
                />
                <MissionTypeButton
                    icon={Package}
                    label="Inventaire Immobilisations"
                    active={missionType === "inventory"}
                    onClick={() => setMissionType("inventory")}
                />
                <MissionTypeButton
                    icon={Calculator}
                    label="Coûts de Revient"
                    active={missionType === "costing"}
                    onClick={() => setMissionType("costing")}
                />
                <MissionTypeButton
                    icon={Layers}
                    label="Comptabilité Analytique"
                    active={missionType === "analytical"}
                    onClick={() => setMissionType("analytical")}
                />
            </div>

            {/* Content based on mission type */}
            <div className="flex-1 min-h-0">
                {missionType === "standard" && renderStandardMission()}
                {missionType === "inventory" && renderInventoryMission()}
                {missionType === "costing" && renderCostingMission()}
                {missionType === "analytical" && renderAnalyticalMission()}
            </div>

            {/* AI Report Modal */}
            {showMissionReport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="bg-indigo-900 p-6 text-white flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/20 rounded-lg">
                                    <ClipboardList className="w-6 h-6 text-indigo-300" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">{missionReport.title}</h3>
                                    <p className="text-indigo-300 text-sm">Mission effectuée pour {selectedClient} • Mai 2024</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 bg-indigo-800/50 px-3 py-1.5 rounded-full border border-indigo-700">
                                    <span className="text-xs font-medium text-indigo-200">Mode Édition</span>
                                    <button
                                        onClick={() => setIsEditMode(!isEditMode)}
                                        className={cn(
                                            "w-10 h-5 rounded-full p-1 transition-colors relative",
                                            isEditMode ? "bg-amber-500" : "bg-slate-700"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-3 h-3 bg-white rounded-full transition-transform",
                                            isEditMode ? "translate-x-5" : "translate-x-0"
                                        )} />
                                    </button>
                                </div>
                                <button
                                    onClick={() => setShowMissionReport(false)}
                                    className="p-2 hover:bg-indigo-800 rounded-full transition-colors"
                                >
                                    <Plus className="w-6 h-6 rotate-45" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 flex overflow-hidden">
                            {/* TOC Sidebar */}
                            <div className="w-64 bg-slate-50 border-r border-slate-200 p-6 overflow-y-auto hidden md:block">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Sommaire</h4>
                                <nav className="space-y-1">
                                    <TOCItem number="1" title="Synthèse de mission" />
                                    <TOCItem number="2" title="Méthodologie technique" />
                                    <TOCItem number="3" title="Constats et observations" />
                                    <TOCItem number="4" title="Recommandations" />
                                    <TOCItem number="5" title="Conclusion" />
                                </nav>
                            </div>

                            {/* Report Body */}
                            <div className="flex-1 bg-white p-12 overflow-y-auto">
                                <div className="max-w-3xl mx-auto space-y-12">
                                    <EditableMissionSection
                                        title="1. Synthèse de la mission"
                                        content={missionReport.summary}
                                        editMode={isEditMode}
                                        onChange={(val) => setMissionReport(prev => ({ ...prev, summary: val }))}
                                        onRegenerate={() => regenerateMissionSection('summary')}
                                    />
                                    <EditableMissionSection
                                        title="2. Méthodologie et cadre technique"
                                        content={missionReport.technical}
                                        editMode={isEditMode}
                                        onChange={(val) => setMissionReport(prev => ({ ...prev, technical: val }))}
                                        onRegenerate={() => regenerateMissionSection('technical')}
                                    />
                                    <EditableMissionSection
                                        title="3. Constats et observations majeures"
                                        content={missionReport.findings}
                                        editMode={isEditMode}
                                        onChange={(val) => setMissionReport(prev => ({ ...prev, findings: val }))}
                                        onRegenerate={() => regenerateMissionSection('findings')}
                                    />
                                    <EditableMissionSection
                                        title="4. Recommandations stratégiques"
                                        content={missionReport.recommendations}
                                        editMode={isEditMode}
                                        onChange={(val) => setMissionReport(prev => ({ ...prev, recommendations: val }))}
                                        onRegenerate={() => regenerateMissionSection('recommendations')}
                                    />
                                    <EditableMissionSection
                                        title="5. Conclusion générale"
                                        content={missionReport.conclusion}
                                        editMode={isEditMode}
                                        onChange={(val) => setMissionReport(prev => ({ ...prev, conclusion: val }))}
                                        onRegenerate={() => regenerateMissionSection('conclusion')}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                            <p className="text-xs text-slate-500">
                                Document généré par Neural Engine OHADA v2.4 • Signature numérique certifiée
                            </p>
                            <div className="flex gap-3">
                                <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-100 transition-colors">
                                    Imprimer
                                </button>
                                <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-transform hover:scale-105">
                                    <Download className="w-4 h-4" />
                                    Télécharger Rapport PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function EditableMissionSection({ title, content, editMode, onChange, onRegenerate }: {
    title: string;
    content: string;
    editMode: boolean;
    onChange: (val: string) => void;
    onRegenerate: () => void;
}) {
    return (
        <section className="space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="text-lg font-bold text-slate-900 border-l-4 border-indigo-500 pl-4">{title}</h4>
                {editMode && (
                    <button
                        onClick={onRegenerate}
                        className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-xs font-bold hover:bg-indigo-100 transition-colors flex items-center gap-1"
                    >
                        <Zap className="w-3 h-3" />
                        Améliorer l'IA
                    </button>
                )}
            </div>
            {editMode ? (
                <textarea
                    value={content}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full min-h-[150px] p-4 bg-indigo-50/30 border border-indigo-100 rounded-xl text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
                />
            ) : (
                <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {content}
                </div>
            )}
        </section>
    );
}

function MissionTypeButton({ icon: Icon, label, active, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all",
                active
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                    : "bg-transparent text-slate-400 hover:bg-slate-800"
            )}
        >
            <Icon className="w-4 h-4" />
            {label}
        </button>
    );
}

function StatCard({ icon: Icon, label, value, trend, color }: {
    icon: any;
    label: string;
    value: string;
    trend?: string;
    color: "cyan" | "emerald" | "amber" | "indigo" | "rose";
}) {
    const colorClasses: Record<string, string> = {
        cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
        emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
        rose: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    };

    return (
        <div className="glass-card rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
                <Icon className={cn("w-4 h-4", colorClasses[color].split(" ")[0])} />
                <span className="text-xs text-slate-500 uppercase tracking-wider">{label}</span>
            </div>
            <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-white">{value}</p>
                {trend && (
                    <span className={cn(
                        "text-xs font-bold",
                        trend.includes("+") ? "text-emerald-400" : "text-rose-400"
                    )}>
                        {trend}
                    </span>
                )}
            </div>
        </div>
    );
}

function CostBreakdownBar({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-slate-300">{label}</span>
                <span className="text-sm font-bold text-white">{value}%</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full", color)} style={{ width: `${value}%` }} />
            </div>
        </div>
    );
}

function TOCItem({ number, title }: { number: string; title: string }) {
    return (
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-white hover:shadow-sm cursor-pointer transition-all">
            <span className="font-bold text-indigo-500 w-4">{number}.</span>
            <span>{title}</span>
        </div>
    );
}
