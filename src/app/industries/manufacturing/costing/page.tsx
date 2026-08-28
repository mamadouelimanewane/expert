"use client";

import { useCallback, useEffect, useState } from "react";
import {
    Calculator,
    TrendingUp,
    TrendingDown,
    ArrowRight,
    ArrowLeft,
    Layers,
    PieChart,
    Scale,
    AlertCircle,
    DollarSign,
    RefreshCw,
    Sliders,
    Search,
    Filter
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Mock Data for Product Costing
/** Produit analyse, renvoye par /api/industries/costing. */
type VentilationCout = {
    category: string;
    libelle: string;
    montant: number;
    part: number;
};

type ProduitAnalyse = {
    id: string;
    reference: string;
    name: string;
    family: string | null;
    unit: string;
    sellingPrice: number;
    coutRevient: number | null;
    marge: number | null;
    tauxMarge: number | null;
    ventilation: VentilationCout[];
    quantite: number | null;
    margeTotale: number | null;
    chiffreAffaires: number | null;
    avertissements: string[];
    periode: string | null;
};

type SyntheseAnalytique = {
    nbProduits: number;
    nbEvalues: number;
    nbIndetermines: number;
    nbAPerte: number;
    chiffreAffaires: number;
    margeTotale: number;
    tauxMargeGlobal: number | null;
};

/** Teinte hexadecimale par categorie, pour l'anneau SVG. */
const TEINTE_CATEGORIE: Record<string, string> = {
    MATIERE_PREMIERE: "#0ea5e9",
    ENERGIE: "#f59e0b",
    MAIN_OEUVRE_DIRECTE: "#10b981",
    AMORTISSEMENT: "#8b5cf6",
    CHARGES_INDIRECTES: "#64748b",
    AUTRE: "#475569",
};

/** Couleur de la barre de ventilation, par categorie de cout. */
const COULEUR_CATEGORIE: Record<string, string> = {
    MATIERE_PREMIERE: "bg-sky-500",
    ENERGIE: "bg-amber-500",
    MAIN_OEUVRE_DIRECTE: "bg-emerald-500",
    AMORTISSEMENT: "bg-violet-500",
    CHARGES_INDIRECTES: "bg-slate-500",
    AUTRE: "bg-slate-600",
};

export default function IndustrialCostingPage() {
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
    const [produits, setProduits] = useState<ProduitAnalyse[]>([]);
    const [synthese, setSynthese] = useState<SyntheseAnalytique | null>(null);
    const [aucuneDonnee, setAucuneDonnee] = useState(false);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState<string | null>(null);
    const [filtre, setFiltre] = useState("");

    const charger = useCallback(async () => {
        setChargement(true);
        setErreur(null);
        try {
            const res = await fetch("/api/industries/costing");
            if (!res.ok) throw new Error(`Reponse ${res.status}`);
            const data = await res.json();
            const liste: ProduitAnalyse[] = data.produits ?? [];
            setProduits(liste);
            setSynthese(data.synthese ?? null);
            setAucuneDonnee(Boolean(data.aucuneDonnee));
            setSelectedProduct(prev => (liste.some(x => x.id === prev) ? prev : (liste[0]?.id ?? null)));
        } catch (e) {
            console.error("Chargement des couts de production :", e);
            setErreur("Impossible de charger les couts de production.");
            setProduits([]);
            setSynthese(null);
        } finally {
            setChargement(false);
        }
    }, []);

    useEffect(() => { charger(); }, [charger]);

    const produitsFiltres = filtre.trim()
        ? produits.filter(x =>
            `${x.name} ${x.reference} ${x.family ?? ""}`.toLowerCase().includes(filtre.trim().toLowerCase()))
        : produits;
    const [energySimulation, setEnergySimulation] = useState(0); // % increase

    const activeProduct = produits.find(p => p.id === selectedProduct);

    // Simple simulation logic
    // La simulation porte sur la part energie reellement ventilee ; sans cout
    // de revient etabli, elle n'a pas de sens et vaut zero.
    const partEnergie = activeProduct?.ventilation.find(v => v.category === "ENERGIE")?.part ?? 0;
    const simulatedCost = activeProduct?.coutRevient != null
        ? activeProduct.coutRevient * (1 + (partEnergie / 100) * (energySimulation / 100))
        : 0;
    const simulatedMargin = activeProduct ? activeProduct.sellingPrice - simulatedCost : 0;
    const simulatedMarginPercent = activeProduct ? (simulatedMargin / activeProduct.sellingPrice) * 100 : 0;

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-8 space-y-8 animate-in fade-in duration-500">


            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 py-6 border-b border-white/5">
                <div>
                    <Link href="/industries/manufacturing" className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800 text-slate-400 rounded-full text-xs font-bold tracking-widest uppercase mb-4 hover:bg-slate-700 transition-colors">
                        <ArrowLeft className="w-3 h-3" /> Retour Industrie
                    </Link>
                    <h1 className="page-title-dark flex items-center gap-4">
                        <Calculator className="w-10 h-10 text-violet-500" />
                        Analytique & Coûts de Revient
                    </h1>
                    <p className="page-subtitle-dark max-w-2xl">
                        Décomposez la structure de coûts par produit. Simulez l'impact de l'inflation (Énergie, Matières) sur vos marges.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={charger}
                        disabled={chargement}
                        title="Recharge l'analyse depuis les données réelles"
                        className="px-6 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-violet-600/25 flex items-center gap-2"
                    >
                        <RefreshCw className={cn("w-4 h-4", chargement && "animate-spin")} /> Actualiser
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left: Product List */}
                <div className="space-y-4">
                    <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-xl border border-white/5">
                        <Search className="w-4 h-4 text-slate-500 ml-2" />
                        <input type="text" value={filtre} onChange={(e) => setFiltre(e.target.value)} placeholder="Filtrer produits..." className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none" />
                    </div>

                    <div className="space-y-3">
                        {chargement ? (
                            <p className="text-xs text-slate-500">Chargement des produits...</p>
                        ) : erreur ? (
                            <p className="text-xs text-rose-400">{erreur}</p>
                        ) : aucuneDonnee ? (
                            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200">
                                <span className="font-bold">Aucun produit enregistre.</span> Les couts
                                de revient se calculent a partir des produits et de leurs composantes
                                de cout saisis pour le client : rien n&apos;a encore ete renseigne.
                            </div>
                        ) : produitsFiltres.length === 0 ? (
                            <p className="text-xs text-slate-500">Aucun produit ne correspond au filtre.</p>
                        ) : produitsFiltres.map((product) => (
                            <div
                                key={product.id}
                                onClick={() => setSelectedProduct(product.id)}
                                className={cn(
                                    "p-4 rounded-xl border cursor-pointer transition-all hover:bg-slate-800/50",
                                    selectedProduct === product.id ? "bg-slate-800/80 border-violet-500/50 shadow-lg shadow-violet-500/10" : "bg-slate-900/20 border-white/5"
                                )}
                            >
                                <div className="flex justify-between items-start gap-2 mb-2">
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-white text-sm truncate">{product.name}</h4>
                                        <p className="text-xs text-slate-500 truncate">
                                            {product.family ?? "Sans famille"} &bull; {product.reference}
                                        </p>
                                    </div>
                                    <div className={cn(
                                        "shrink-0 px-2 py-1 rounded-lg text-[10px] font-black uppercase",
                                        product.tauxMarge == null ? "bg-slate-700 text-slate-400" :
                                            product.tauxMarge < 0 ? "bg-rose-500/10 text-rose-400" :
                                                product.tauxMarge >= 20 ? "bg-emerald-500/10 text-emerald-400" :
                                                    "bg-amber-500/10 text-amber-400"
                                    )}>
                                        {product.tauxMarge == null ? "Indetermine" : `${product.tauxMarge}% Marge`}
                                    </div>
                                </div>

                                {product.ventilation.length > 0 ? (
                                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden flex">
                                        {product.ventilation.map((v) => (
                                            <div
                                                key={v.category}
                                                className={cn("h-full", COULEUR_CATEGORIE[v.category] ?? "bg-slate-600")}
                                                style={{ width: `${v.part}%` }}
                                                title={`${v.libelle} : ${v.part}%`}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-[10px] text-amber-400">
                                        Aucune composante de cout saisie.
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Center: Cost Structure Visualization */}
                <div className="lg:col-span-2 space-y-6">
                    {activeProduct && (
                        <>
                            {/* Simulator Card */}
                            <div className="glass-card p-6 rounded-3xl border border-white/5 bg-slate-900/40">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-white flex items-center gap-2">
                                        <Sliders className="w-5 h-5 text-violet-400" />
                                        Simulateur d'Impact
                                    </h3>
                                    <div className="px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-xs font-bold border border-amber-500/20">
                                        Facteur : Coût de l'Énergie
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-slate-400">Hausse du prix de l'énergie (Électricité/Fioul)</span>
                                            <span className="text-amber-400 font-bold">+{energySimulation}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="50"
                                            step="5"
                                            value={energySimulation}
                                            onChange={(e) => setEnergySimulation(parseInt(e.target.value))}
                                            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                        />
                                        <div className="flex justify-between text-xs text-slate-600 mt-1 font-mono">
                                            <span>0%</span>
                                            <span>+10%</span>
                                            <span>+25%</span>
                                            <span>+50%</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                        <div className="p-4 bg-slate-950/50 rounded-xl">
                                            <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Marge actuelle</p>
                                            <div className="text-2xl font-black text-white">
                                                {activeProduct.tauxMarge == null ? "\u2014" : `${activeProduct.tauxMarge.toFixed(1)}%`}
                                            </div>
                                            <div className="text-xs text-slate-400 font-mono">
                                                {activeProduct.marge == null
                                                    ? "Cout de revient indetermine"
                                                    : `${activeProduct.marge.toLocaleString("fr-FR")} FCFA / ${activeProduct.unit}`}
                                            </div>
                                        </div>
                                        <div className="p-4 bg-slate-950/50 rounded-xl relative overflow-hidden">
                                            {simulatedMarginPercent < 15 && (
                                                <div className="absolute top-0 right-0 p-1 bg-rose-500 text-white text-[10px] font-bold rounded-bl-lg">
                                                    CRITIQUE
                                                </div>
                                            )}
                                            <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Marge Simulée</p>
                                            <div className={cn("text-2xl font-black transition-colors",
                                                activeProduct.tauxMarge != null && simulatedMarginPercent < activeProduct.tauxMarge ? "text-rose-400" : "text-white"
                                            )}>
                                                {simulatedMarginPercent.toFixed(1)}%
                                            </div>
                                            <div className="text-xs text-rose-400 font-mono flex items-center gap-1">
                                                {simulatedMargin.toFixed(0)} FCFA
                                                <span className="opacity-70">{activeProduct.marge != null ? `(-${(activeProduct.marge - simulatedMargin).toFixed(0)})` : ""}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Breakdown */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="glass-card p-6 rounded-3xl border border-white/5 bg-slate-900/40">
                                    <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                                        <PieChart className="w-4 h-4 text-sky-400" /> Structure du Coût
                                    </h4>
                                    {activeProduct.ventilation.length === 0 ? (
                                        <p className="my-8 text-center text-sm text-amber-400">
                                            Aucune composante de cout saisie pour ce produit : la
                                            structure de cout ne peut pas etre etablie.
                                        </p>
                                    ) : (
                                        <>
                                            <div className="relative w-48 h-48 mx-auto my-4">
                                                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                                    {(() => {
                                                        let offset = 0;
                                                        return activeProduct.ventilation.map((v) => {
                                                            const dash = v.part * 2.51;
                                                            const el = (
                                                                <circle
                                                                    key={v.category}
                                                                    cx="50"
                                                                    cy="50"
                                                                    r="40"
                                                                    fill="transparent"
                                                                    stroke={TEINTE_CATEGORIE[v.category] ?? "#64748b"}
                                                                    strokeWidth="20"
                                                                    strokeDasharray={`${dash} 251`}
                                                                    strokeDashoffset={-offset}
                                                                />
                                                            );
                                                            offset += dash;
                                                            return el;
                                                        });
                                                    })()}
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center flex-col text-center">
                                                    <span className="text-xl font-black text-white tabular-nums">
                                                        {activeProduct.coutRevient?.toLocaleString("fr-FR")}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 uppercase">
                                                        Cout de revient
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-2 text-sm">
                                                {activeProduct.ventilation.map((v) => (
                                                    <div key={v.category} className="flex justify-between">
                                                        <span className="flex items-center gap-2">
                                                            <div
                                                                className="w-2 h-2 rounded-full"
                                                                style={{ backgroundColor: TEINTE_CATEGORIE[v.category] ?? "#64748b" }}
                                                            />
                                                            {v.libelle}
                                                        </span>
                                                        <span className="text-white font-bold tabular-nums">{v.part}%</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="glass-card p-6 rounded-3xl border border-white/5 bg-slate-900/40 flex flex-col justify-center">
                                    <div className="text-center space-y-4">
                                        <div className="w-16 h-16 rounded-full bg-slate-800 mx-auto flex items-center justify-center">
                                            <Scale className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-lg">Marge de la periode</h4>
                                            <p className="text-slate-500 text-sm">
                                                {activeProduct.periode
                                                    ? `Volume produit sur ${activeProduct.periode}`
                                                    : "Aucun volume de production saisi"}
                                            </p>
                                        </div>

                                        <div className="py-4 border-t border-b border-white/5">
                                            <span className="text-xl sm:text-2xl lg:text-3xl font-black text-white block tabular-nums">
                                                {activeProduct.margeTotale != null
                                                    ? activeProduct.margeTotale.toLocaleString("fr-FR")
                                                    : "\u2014"}
                                            </span>
                                            <span className="text-xs uppercase tracking-widest text-slate-500">
                                                {activeProduct.margeTotale != null
                                                    ? "FCFA de marge"
                                                    : "Marge non calculable"}
                                            </span>
                                        </div>

                                        {activeProduct.quantite != null && (
                                            <p className="text-xs text-slate-400 tabular-nums">
                                                {activeProduct.quantite.toLocaleString("fr-FR")} {activeProduct.unit}
                                                {activeProduct.chiffreAffaires != null
                                                    ? ` \u2014 ${activeProduct.chiffreAffaires.toLocaleString("fr-FR")} FCFA de CA`
                                                    : ""}
                                            </p>
                                        )}

                                        {/* Le seuil de rentabilite exige les charges fixes totales,
                                            que le modele ne porte pas : il n'est pas affiche plutot
                                            que d'etre estime au juge. */}
                                        {activeProduct.avertissements.length > 0 && (
                                            <ul className="space-y-1 rounded-lg bg-amber-500/10 p-3 text-left text-[11px] text-amber-300">
                                                {activeProduct.avertissements.map((a, i) => (
                                                    <li key={i}>{a}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
