"use client";

import { useState } from "react";
import {
    Package,
    QrCode,
    MapPin,
    AlertTriangle,
    CheckCircle2,
    Plus,
    Search,
    Filter,
    ArrowRight,
    Calculator,
    Camera,
    Download,
    FileSpreadsheet
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FixedAsset {
    id: string;
    code: string;
    label: string;
    category: string;
    purchaseDate: string;
    value: string;
    location: string;
    status: "Trouvé" | "Manquant" | "À vérifier" | "Cédé/Rebut";
    lastAudit: string;
}

const MOCK_ASSETS: FixedAsset[] = [
    { id: "1", code: "IM-2024-001", label: "Serveur Dell PowerEdge", category: "Matériel Informatique", purchaseDate: "12/01/2023", value: "2 500 000", location: "Salle Serveur - Abidjan", status: "Trouvé", lastAudit: "20/05/2024" },
    { id: "2", code: "IM-2024-002", label: "Véhicule Toyota Hilux", category: "Matériel de Transport", purchaseDate: "15/03/2022", value: "18 000 000", location: "Siège - Parking", status: "À vérifier", lastAudit: "15/05/2024" },
    { id: "3", code: "IM-2024-003", label: "Climatiseur Split 2CV", category: "Inst. Générales", purchaseDate: "10/06/2021", value: "450 000", location: "Bureau Direction", status: "Manquant", lastAudit: "01/05/2024" },
    { id: "4", code: "IM-2024-004", label: "Groupe Électrogène 50KVA", category: "Matériel Technique", purchaseDate: "20/11/2022", value: "12 000 000", location: "Zone Technique", status: "Trouvé", lastAudit: "20/05/2024" },
];

export default function FixedAssetsAuditPage() {
    const [activeTab, setActiveTab] = useState<"inventaire" | "rapprochement" | "planification">("inventaire");
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Package className="w-8 h-8 text-amber-500" />
                        Audit & Inventaire des Immob.
                    </h2>
                    <p className="text-slate-400 mt-1">Préparation des missions d'inventaire physique et rapprochement comptable.</p>
                </div>

                <div className="flex gap-2 bg-slate-900/50 p-1.5 rounded-xl border border-slate-700">
                    {["inventaire", "rapprochement", "planification"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={cn(
                                "px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all",
                                activeTab === tab ? "bg-amber-600 text-white shadow-lg shadow-amber-500/20" : "text-slate-500 hover:text-white"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === "inventaire" && (
                <div className="space-y-6">
                    {/* Action Bar */}
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Rechercher une immo (Code, nom, lieu)..."
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 flex items-center gap-2 text-sm transition-all">
                                <QrCode className="w-4 h-4" /> Imprimer Étiquettes
                            </button>
                            <button className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold flex items-center gap-2 text-sm transition-all shadow-lg shadow-amber-500/20">
                                <Plus className="w-4 h-4" /> Nouvelle Immo
                            </button>
                        </div>
                    </div>

                    {/* Asset Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="glass-card p-4 rounded-2xl border border-slate-700/50 flex flex-col items-center justify-center text-center py-8 hover:bg-slate-800/30 transition-all cursor-pointer group">
                            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Camera className="w-8 h-8 text-amber-500" />
                            </div>
                            <h4 className="font-bold text-white">Scanner / Photo</h4>
                            <p className="text-xs text-slate-500 mt-1">Utiliser l'App mobile pour identifier une immo</p>
                        </div>

                        <div className="glass-card p-6 rounded-2xl border border-slate-700/50">
                            <div className="flex justify-between items-start mb-4">
                                <div className="text-xs font-bold text-slate-500 uppercase">Taux de couverture</div>
                                <span className="text-emerald-400 font-bold text-xs">+85%</span>
                            </div>
                            <div className="text-3xl font-bold text-white">124 / 145</div>
                            <div className="mt-4 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full w-[85%] bg-emerald-500 rounded-full" />
                            </div>
                        </div>

                        <div className="glass-card p-6 rounded-2xl border border-slate-700/50">
                            <div className="text-xs font-bold text-slate-500 uppercase mb-4">Valeur d'Acquisition</div>
                            <div className="text-3xl font-bold text-white">45.8M</div>
                            <p className="text-[10px] text-slate-500 mt-2 uppercase">FCFA • Exercice 2024</p>
                        </div>

                        <div className="glass-card p-6 rounded-2xl border border-slate-700/50">
                            <div className="text-xs font-bold text-slate-500 uppercase mb-4">Écarts Détectés</div>
                            <div className="text-3xl font-bold text-rose-500">12</div>
                            <p className="text-[10px] text-rose-400 mt-2 flex items-center gap-1 font-bold">
                                <AlertTriangle className="w-3 h-3" /> À régulariser
                            </p>
                        </div>
                    </div>

                    {/* Main List */}
                    <div className="glass-card rounded-2xl border border-slate-700/50 overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-900/50 text-slate-500 font-medium">
                                <tr>
                                    <th className="px-6 py-4">Immobilisation</th>
                                    <th className="px-6 py-4">Catégorie / Lieu</th>
                                    <th className="px-6 py-4">Achat / Valeur</th>
                                    <th className="px-6 py-4">Statut Inventaire</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {MOCK_ASSETS.map((asset) => (
                                    <tr key={asset.id} className="hover:bg-slate-800/20 group transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-white">{asset.label}</p>
                                            <p className="text-[10px] text-amber-500 font-mono italic">{asset.code}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-slate-300 text-xs">{asset.category}</p>
                                            <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                                                <MapPin className="w-3 h-3" /> {asset.location}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-white font-mono text-xs">{asset.value} FCFA</p>
                                            <p className="text-[10px] text-slate-500">{asset.purchaseDate}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-full text-[10px] font-bold border",
                                                asset.status === "Trouvé" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                    asset.status === "À vérifier" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                        asset.status === "Manquant" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                                                            "bg-slate-700 text-slate-400 border-slate-600"
                                            )}>
                                                {asset.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-slate-500 hover:text-white transition-colors">
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === "rapprochement" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="glass-card rounded-2xl p-6 border border-slate-700/50 space-y-6">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <Calculator className="w-5 h-5 text-indigo-400" />
                            Rapprochement Comptable automatique
                        </h3>
                        <p className="text-sm text-slate-500">L'IA compare le registre physique avec la balance de la classe 2.</p>

                        <div className="space-y-4">
                            {[
                                { label: "Matériel Informatique", comptable: "25M", physique: "22M", ecart: "-3M" },
                                { label: "Matériel Transport", comptable: "45M", physique: "45M", ecart: "OK" },
                                { label: "Mobiliers", comptable: "12M", physique: "11.5M", ecart: "-0.5M" },
                            ].map((row, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase">{row.label}</p>
                                        <p className="text-white font-bold mt-1">{row.physique === row.comptable ? "Conforme" : "Écart détecté"}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-400">Écart : <span className={cn(row.ecart === "OK" ? "text-emerald-400" : "text-rose-400")}>{row.ecart}</span></p>
                                        <button className="text-[10px] text-indigo-400 font-bold hover:underline">Générer OD de rebut</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card rounded-2xl p-6 border border-slate-700/50 space-y-8 bg-gradient-to-br from-slate-900 to-amber-900/10">
                        <h3 className="font-bold text-white">Rapports d'inventaire</h3>
                        <div className="space-y-3">
                            <button className="w-full p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl border border-slate-700 flex items-center justify-between transition-all group">
                                <div className="flex items-center gap-4">
                                    <FileSpreadsheet className="w-6 h-6 text-emerald-500" />
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-white">Tableau Amortissement OHADA</p>
                                        <p className="text-xs text-slate-500">Généré selon durées fiscales</p>
                                    </div>
                                </div>
                                <Download className="w-5 h-5 text-slate-600 group-hover:text-white" />
                            </button>

                            <button className="w-full p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl border border-slate-700 flex items-center justify-between transition-all group">
                                <div className="flex items-center gap-4">
                                    <AlertTriangle className="w-6 h-6 text-amber-500" />
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-white">Rapport d'écarts d'inventaire</p>
                                        <p className="text-xs text-slate-500">Prêt pour signature PV</p>
                                    </div>
                                </div>
                                <Download className="w-5 h-5 text-slate-600 group-hover:text-white" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
