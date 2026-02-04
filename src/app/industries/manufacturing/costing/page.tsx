"use client";

import { useState } from "react";
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
const PRODUCT_COSTING = [
    {
        id: "P-101",
        name: "Ciment CPJ 45 - Sac 50kg",
        family: "Cimenterie",
        sellingPrice: 4200,
        costPrice: 3150,
        margin: 1050,
        marginPercent: 25,
        volume: "120k U/mois",
        trend: "down", // Margin trend
        costStructure: { material: 60, energy: 25, labor: 10, overhead: 5 }
    },
    {
        id: "P-204",
        name: "Brique 15x20x40",
        family: "Matériaux",
        sellingPrice: 350,
        costPrice: 180,
        margin: 170,
        marginPercent: 48.5,
        volume: "500k U/mois",
        trend: "up",
        costStructure: { material: 40, energy: 15, labor: 35, overhead: 10 }
    },
    {
        id: "P-305",
        name: "Fer à Béton FE-500 12mm",
        family: "Métallurgie",
        sellingPrice: 3800,
        costPrice: 3650,
        margin: 150,
        marginPercent: 3.9,
        volume: "45k U/mois",
        trend: "critical", // Low margin alert
        costStructure: { material: 80, energy: 10, labor: 5, overhead: 5 }
    }
];

export default function IndustrialCostingPage() {
    const [selectedProduct, setSelectedProduct] = useState<string | null>("P-101");
    const [energySimulation, setEnergySimulation] = useState(0); // % increase

    const activeProduct = PRODUCT_COSTING.find(p => p.id === selectedProduct);

    // Simple simulation logic
    const simulatedCost = activeProduct ? activeProduct.costPrice * (1 + (activeProduct.costStructure.energy / 100 * energySimulation / 100)) : 0;
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
                    <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
                        <Calculator className="w-10 h-10 text-violet-500" />
                        Analytique & Coûts de Revient
                    </h1>
                    <p className="text-slate-400 mt-2 max-w-2xl text-lg">
                        Décomposez la structure de coûts par produit. Simulez l'impact de l'inflation (Énergie, Matières) sur vos marges.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-violet-600/25 flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" /> Actualiser Standards
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left: Product List */}
                <div className="space-y-4">
                    <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-xl border border-white/5">
                        <Search className="w-4 h-4 text-slate-500 ml-2" />
                        <input type="text" placeholder="Filtrer produits..." className="bg-transparent border-none focus:ring-0 text-sm w-full" />
                    </div>

                    <div className="space-y-3">
                        {PRODUCT_COSTING.map((product) => (
                            <div
                                key={product.id}
                                onClick={() => setSelectedProduct(product.id)}
                                className={cn(
                                    "p-4 rounded-xl border cursor-pointer transition-all hover:bg-slate-800/50",
                                    selectedProduct === product.id ? "bg-slate-800/80 border-violet-500/50 shadow-lg shadow-violet-500/10" : "bg-slate-900/20 border-white/5"
                                )}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-bold text-white text-sm">{product.name}</h4>
                                        <p className="text-xs text-slate-500">{product.family} • {product.id}</p>
                                    </div>
                                    <div className={cn(
                                        "px-2 py-1 rounded-lg text-[10px] font-black uppercase",
                                        product.trend === "up" ? "bg-emerald-500/10 text-emerald-400" :
                                            product.trend === "critical" ? "bg-rose-500/10 text-rose-400" : "bg-slate-700 text-slate-400"
                                    )}>
                                        {product.marginPercent}% Marge
                                    </div>
                                </div>
                                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden flex">
                                    <div className="h-full bg-sky-500" style={{ width: `${product.costStructure.material}%` }} />
                                    <div className="h-full bg-amber-500" style={{ width: `${product.costStructure.energy}%` }} />
                                    <div className="h-full bg-emerald-500" style={{ width: `${product.costStructure.labor}%` }} />
                                </div>
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
                                            <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Marge Actuelle</p>
                                            <div className="text-2xl font-black text-white">{activeProduct.marginPercent.toFixed(1)}%</div>
                                            <div className="text-xs text-slate-400 font-mono">{activeProduct.margin} FCFA / Unité</div>
                                        </div>
                                        <div className="p-4 bg-slate-950/50 rounded-xl relative overflow-hidden">
                                            {simulatedMarginPercent < 15 && (
                                                <div className="absolute top-0 right-0 p-1 bg-rose-500 text-white text-[10px] font-bold rounded-bl-lg">
                                                    CRITIQUE
                                                </div>
                                            )}
                                            <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Marge Simulée</p>
                                            <div className={cn("text-2xl font-black transition-colors",
                                                simulatedMarginPercent < activeProduct.marginPercent ? "text-rose-400" : "text-white"
                                            )}>
                                                {simulatedMarginPercent.toFixed(1)}%
                                            </div>
                                            <div className="text-xs text-rose-400 font-mono flex items-center gap-1">
                                                {simulatedMargin.toFixed(0)} FCFA
                                                <span className="opacity-70">(-{(activeProduct.margin - simulatedMargin).toFixed(0)})</span>
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
                                    <div className="relative w-48 h-48 mx-auto my-4">
                                        {/* Simple Visual Representation */}
                                        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#0ea5e9" strokeWidth="20" strokeDasharray={`${activeProduct.costStructure.material * 2.51} 251`} />
                                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="20" strokeDasharray={`${activeProduct.costStructure.energy * 2.51} 251`} strokeDashoffset={-activeProduct.costStructure.material * 2.51} />
                                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="20" strokeDasharray={`${activeProduct.costStructure.labor * 2.51} 251`} strokeDashoffset={-(activeProduct.costStructure.material + activeProduct.costStructure.energy) * 2.51} />
                                            <div className="absolute inset-0 flex items-center justify-center flex-col text-center">
                                                <span className="text-2xl font-black text-white">{activeProduct.costPrice}</span>
                                                <span className="text-[10px] text-slate-500 uppercase">Coût Std.</span>
                                            </div>
                                        </svg>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between"><span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-sky-500" />Matières Prem.</span> <span className="text-white font-bold">{activeProduct.costStructure.material}%</span></div>
                                        <div className="flex justify-between"><span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500" />Énergie</span> <span className="text-white font-bold">{activeProduct.costStructure.energy}%</span></div>
                                        <div className="flex justify-between"><span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" />Main d'Oeuvre</span> <span className="text-white font-bold">{activeProduct.costStructure.labor}%</span></div>
                                    </div>
                                </div>

                                <div className="glass-card p-6 rounded-3xl border border-white/5 bg-slate-900/40 flex flex-col justify-center">
                                    <div className="text-center space-y-4">
                                        <div className="w-16 h-16 rounded-full bg-slate-800 mx-auto flex items-center justify-center">
                                            <Scale className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-lg">Point Mort (Break-even)</h4>
                                            <p className="text-slate-500 text-sm">Seuil de rentabilité mensuel</p>
                                        </div>
                                        <div className="py-4 border-t border-b border-white/5">
                                            <span className="text-3xl font-black text-white block">38 500</span>
                                            <span className="text-xs uppercase tracking-widest text-slate-500">Unités à vendre</span>
                                        </div>
                                        <div className="text-xs text-emerald-400 font-bold bg-emerald-500/10 py-2 rounded-lg">
                                            Objectif atteint à jour J-12
                                        </div>
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
