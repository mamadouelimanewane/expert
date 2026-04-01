"use client";

import { useState } from "react";
import { 
    Globe, 
    TrendingUp, 
    ShieldCheck, 
    Zap, 
    ArrowRight, 
    CheckCircle2, 
    Scale,
    BrainCircuit
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock Data for Comparison
const COUNTRIES_DATA: Record<string, any> = {
    "CI": {
        name: "Côte d'Ivoire",
        is: "25%",
        tva: "18%",
        its: "Prog.",
        social: "23%",
        dividends: "15%",
        advantages: ["Secteur Agro-ind.", "ZBTIC", "Zones Franches"],
        rating: 8.5
    },
    "SN": {
        name: "Sénégal",
        is: "30%",
        tva: "18%",
        its: "Prog.",
        social: "21.5%",
        dividends: "10%",
        advantages: ["Espaces Pôles Urb.", "Start-up Act", "Gaz/Pétrole"],
        rating: 8.2
    },
    "CM": {
        name: "Cameroun",
        is: "30.8%",
        tva: "19.25%",
        its: "Prog.",
        social: "16.2%",
        dividends: "16.5%",
        advantages: ["Énergie", "Bois", "Infrastructure"],
        rating: 7.8
    },
    "BEN": {
        name: "Bénin",
        is: "25%",
        tva: "18%",
        its: "Prog.",
        social: "20%",
        dividends: "12%",
        advantages: ["Logistique", "Tourisme Hub", "GDIZ"],
        rating: 8.7
    }
};

export default function FiscalMirrorPage() {
    const [countryA, setCountryA] = useState("CI");
    const [countryB, setCountryB] = useState("SN");

    const dataA = COUNTRIES_DATA[countryA];
    const dataB = COUNTRIES_DATA[countryB];

    return (
        <div className="min-h-screen space-y-8 pb-20 animate-in fade-in duration-1000">
            {/* Elite Header */}
            <div className="bg-slate-900/60 p-10 rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                    <Globe className="w-64 h-64 text-indigo-400" />
                </div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="px-4 py-1.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em] rounded-full border border-indigo-500/20">
                            Nexus Strategy Suite
                        </div>
                        <div className="text-[10px] font-bold text-slate-500 flex items-center gap-2">
                             Modèle OHADA v2026.4
                        </div>
                    </div>
                    
                    <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tighter uppercase leading-none mb-4">
                        Nexus <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Fiscal Mirror</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-slate-400 font-medium max-w-2xl leading-relaxed">
                        Benchmarking régional temps-réel. Comparez les cadres fiscaux et légaux pour optimiser vos flux et implantations panafricaines.
                    </p>
                </div>
            </div>

            {/* Comparison Cockpit */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sticky top-4 z-40 bg-[#0B0F17]/80 backdrop-blur-3xl p-6 rounded-[32px] border border-white/10 shadow-2xl">
                <div className="lg:col-span-5">
                    <CountrySelector 
                        label="Juridiction A"
                        value={countryA}
                        onChange={setCountryA}
                        excluded={countryB}
                    />
                </div>
                <div className="lg:col-span-2 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 font-black italic">
                        VS
                    </div>
                </div>
                <div className="lg:col-span-5">
                    <CountrySelector 
                        label="Juridiction B"
                        value={countryB}
                        onChange={setCountryB}
                        excluded={countryA}
                    />
                </div>
            </div>

            {/* Detailed Comparison Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Metrics Table */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="glass-card p-6 sm:p-10 rounded-3xl sm:rounded-[48px] border border-white/5 bg-slate-900/40 shadow-2xl">
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-10 flex items-center gap-3">
                            <Scale className="w-6 h-6 text-indigo-400" /> Profil Fiscal Comparatif
                        </h3>

                        <div className="space-y-4">
                             <MetricsRow label="Impôt Sociétés (IS)" a={dataA.is} b={dataB.is} />
                             <MetricsRow label="TVA (Standard)" a={dataA.tva} b={dataB.tva} />
                             <MetricsRow label="Dividendes" a={dataA.dividends} b={dataB.dividends} />
                             <MetricsRow label="Charges Patronales" a={dataA.social} b={dataB.social} />
                             <MetricsRow label="Régime Salarié" a={dataA.its} b={dataB.its} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <IncentiveCard country={dataA.name} advantages={dataA.advantages} />
                        <IncentiveCard country={dataB.name} advantages={dataB.advantages} />
                    </div>
                </div>

                {/* AI Recommendation Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="glass-card p-6 sm:p-10 rounded-3xl sm:rounded-[48px] border border-white/5 bg-gradient-to-b from-indigo-500/10 to-transparent">
                        <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mb-6">
                            <BrainCircuit className="w-8 h-8 text-indigo-400" />
                        </div>
                        <h4 className="text-xl font-black text-white uppercase mb-2">Verdict Stratégique</h4>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-6">Nexus IA Simulation</p>
                        
                        <div className="p-6 bg-white/[0.03] rounded-3xl border border-white/5 mb-6">
                            <p className="text-sm text-slate-300 italic leading-relaxed">
                                "Pour un projet à forte intensité de main-d'œuvre, le <span className="text-indigo-400 font-bold">{dataB.name}</span> présente un avantage compétitif de <span className="text-emerald-400 font-black">2.5%</span> sur les charges sociales."
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-[10px] text-slate-500 font-black uppercase">Indice Attractivité</span>
                                <span className="text-emerald-400 font-black text-lg">{Math.max(dataA.rating, dataB.rating)}/10</span>
                            </div>
                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 w-[87%] shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                            </div>
                        </div>

                        <button className="w-full mt-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-3">
                            Télécharger l'Aide au Choix <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40">
                         <h4 className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-6 underline">Directives CCJA / OHADA</h4>
                         <div className="space-y-4">
                            <JurisItem title="Stabilité Fiscale" desc="Garantie de 5 ans sur les codes d'investissement locaux." />
                            <JurisItem title="Libre Rapatriement" desc="Conformité totale avec la zone Franc CFA / ECO." />
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CountrySelector({ label, value, onChange, excluded }: any) {
    return (
        <div className="space-y-3">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{label}</span>
            <div className="flex gap-2 p-1 bg-slate-800/50 rounded-2xl border border-white/10 overflow-x-auto no-scrollbar">
                {Object.keys(COUNTRIES_DATA).map((id) => (
                    <button
                        key={id}
                        disabled={id === excluded}
                        onClick={() => onChange(id)}
                        className={cn(
                            "px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shrink-0",
                            id === excluded ? "opacity-20 cursor-not-allowed" :
                            value === id ? "bg-indigo-600 text-white shadow-xl" : "text-slate-500 hover:text-white"
                        )}
                    >
                        {COUNTRIES_DATA[id].name}
                    </button>
                ))}
            </div>
        </div>
    );
}

function MetricsRow({ label, a, b }: any) {
    return (
        <div className="grid grid-cols-12 gap-4 py-4 sm:py-6 border-b border-white/[0.03] group hover:bg-white/[0.02] -mx-4 px-4 transition-all rounded-xl">
            <div className="col-span-6 flex flex-col justify-center">
                <span className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest">{label}</span>
            </div>
            <div className="col-span-3 text-center">
                <span className="text-sm sm:text-lg font-black text-white">{a}</span>
            </div>
            <div className="col-span-3 text-center">
                <span className="text-sm sm:text-lg font-black text-white">{b}</span>
            </div>
        </div>
    );
}

function IncentiveCard({ country, advantages }: any) {
    return (
        <div className="glass-card p-6 sm:p-8 rounded-3xl sm:rounded-[40px] border border-white/5 bg-slate-900/30">
            <h4 className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-6">Leviers {country}</h4>
            <div className="space-y-3">
                {advantages.map((adv: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 text-xs font-bold text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {adv}
                    </div>
                ))}
            </div>
        </div>
    );
}

function JurisItem({ title, desc }: any) {
    return (
        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
            <p className="text-xs font-black text-white mb-1 uppercase tracking-tighter">{title}</p>
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{desc}</p>
        </div>
    );
}
