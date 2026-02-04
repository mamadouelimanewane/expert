"use client";

import { useState } from "react";
import {
    Search,
    MapPin,
    MessageSquare,
    Star,
    ShieldCheck,
    ArrowRight,
    Award,
    Filter,
    Globe,
    Building2,
    Users2
} from "lucide-react";
import { cn } from "@/lib/utils";

const EXPERTS = [
    {
        name: "Moussa Sarr",
        title: "Expert-Comptable Diplômé",
        specialty: "Audit & Commissariat aux Comptes",
        location: "Dakar, Plateau",
        rating: 4.9,
        reviews: 124,
        experience: "15 ans",
        avatar: "MS",
        status: "Online",
        tags: ["OHADA", "Audit", "PME"]
    },
    {
        name: "Awa Diop",
        title: "Conseillère Fiscale Senior",
        specialty: "Fiscalité Internationale & OHADA",
        location: "Dakar, Almadies",
        rating: 4.8,
        reviews: 89,
        experience: "10 ans",
        avatar: "AD",
        status: "Busy",
        tags: ["Fiscalité", "M&A", "ZES"]
    },
    {
        name: "Jean-Paul Mendy",
        title: "Expert Juridique",
        specialty: "Droit des Affaires & Gouvernance",
        location: "Saint-Louis",
        rating: 4.7,
        reviews: 56,
        experience: "12 ans",
        avatar: "JM",
        status: "Online",
        tags: ["Juridique", "AG", "Contrats"]
    },
    {
        name: "Fatima Kouyaté",
        title: "Analyste Financière",
        specialty: "Bilan & Reporting Consolidé",
        location: "Casablanca (Bureau Régional)",
        rating: 4.9,
        reviews: 112,
        experience: "8 ans",
        avatar: "FK",
        status: "Away",
        tags: ["Reporting", "BI", "Banque"]
    }
];

export default function AnnuairePage() {
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <div className="space-y-12 pb-20 animate-in fade-in duration-700">
            {/* Hero Section */}
            <div className="relative h-[400px] rounded-[40px] overflow-hidden bg-slate-900 border border-white/5 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80')] bg-cover opacity-10" />

                <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6 max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-black uppercase tracking-widest mb-6">
                        <Award className="w-4 h-4" /> Annuaire Officiel des Experts
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
                        Trouvez l'expert <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">partenaire</span> de votre croissance.
                    </h1>
                    <p className="text-slate-400 text-lg md:text-xl max-w-2xl font-medium mb-10 leading-relaxed">
                        Plus de 50 experts certifiés OHADA pour vous accompagner dans votre gestion comptable, fiscale et juridique.
                    </p>

                    <div className="w-full max-w-2xl relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-indigo-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Rechercher par nom, spécialité ou ville..."
                            className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl pl-16 pr-6 py-5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none shadow-2xl text-lg font-medium placeholder:text-slate-500 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-4">
                <StatBox icon={Users2} label="Clients Actifs" value="5,000+" />
                <StatBox icon={Building2} label="Pays Couverts" value="17" />
                <StatBox icon={MessageSquare} label="Avis Certifiés" value="12,500+" />
                <StatBox icon={Globe} label="Langues" value="Fr / En" />
            </div>

            {/* Filters & Results */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                <div className="lg:col-span-1 space-y-8">
                    <div className="glass-card p-8 rounded-[30px] border border-white/5 bg-slate-900/40 sticky top-24">
                        <h3 className="text-white font-black text-xs uppercase tracking-widest mb-8 flex items-center gap-2">
                            <Filter className="w-4 h-4 text-indigo-400" /> Filtres Avancés
                        </h3>

                        <FilterGroup label="Spécialité" options={["Audit", "Fiscalité", "M&A", "Gouvernance"]} />
                        <FilterGroup label="Expérience" options={["+5 ans", "+10 ans", "+15 ans"]} />
                        <FilterGroup label="Villes" options={["Dakar", "Abidjan", "Douala", "Lomé"]} />

                        <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-indigo-600/20 transition-all mt-6">
                            Appliquer les Filtres
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-8">
                    <div className="flex justify-between items-center px-4">
                        <h2 className="text-white font-black text-xl tracking-tight">
                            {EXPERTS.length} Experts Disponibles
                        </h2>
                        <div className="flex bg-slate-800 rounded-xl p-1 border border-white/5">
                            <button className="px-4 py-2 bg-indigo-600 rounded-lg text-white text-[10px] font-black uppercase tracking-widest">Grille</button>
                            <button className="px-4 py-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">Liste</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
                        {EXPERTS.map((expert, idx) => (
                            <ExpertCard key={idx} expert={expert} />
                        ))}
                    </div>

                    <div className="flex justify-center pt-12">
                        <button className="px-10 py-5 bg-slate-900 border border-white/10 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:bg-slate-800 transition-all flex items-center gap-3">
                            Voir Plus d'Experts <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatBox({ icon: Icon, label, value }: any) {
    return (
        <div className="glass-card p-6 rounded-3xl border border-white/5 bg-slate-900/40 text-center flex flex-col items-center group hover:bg-slate-900/60 transition-all">
            <div className="p-3 bg-indigo-500/10 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                <Icon className="w-5 h-5 text-indigo-400" />
            </div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{label}</p>
            <h4 className="text-2xl font-black text-white">{value}</h4>
        </div>
    );
}

function FilterGroup({ label, options }: { label: string, options: string[] }) {
    return (
        <div className="space-y-4 mb-8">
            <h4 className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{label}</h4>
            <div className="space-y-3">
                {options.map(opt => (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                        <div className="w-5 h-5 rounded-md border border-slate-700 bg-slate-800 flex items-center justify-center group-hover:border-indigo-400 transition-colors">
                            <div className="w-2.5 h-2.5 rounded-sm bg-indigo-500 opacity-0 group-hover:opacity-20 transition-opacity" />
                        </div>
                        <span className="text-sm text-slate-400 group-hover:text-white transition-colors">{opt}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}

function ExpertCard({ expert }: any) {
    return (
        <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/20 group hover:bg-slate-900/40 transition-all relative overflow-hidden flex flex-col h-full">
            {/* Status Badge */}
            <div className="absolute top-8 right-8 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5">
                <div className={cn(
                    "w-2 h-2 rounded-full shadow-[0_0_8px]",
                    expert.status === "Online" ? "bg-emerald-500 shadow-emerald-500" :
                        expert.status === "Busy" ? "bg-rose-500 shadow-rose-500" : "bg-amber-500 shadow-amber-500"
                )} />
                <span className="text-[9px] font-black uppercase text-slate-300">{expert.status}</span>
            </div>

            <div className="flex items-start gap-6 mb-8">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-3xl font-black text-white shadow-2xl border border-white/10 group-hover:scale-105 transition-transform">
                    {expert.avatar}
                </div>
                <div className="flex-1">
                    <h3 className="text-2xl font-black text-white leading-tight group-hover:text-indigo-400 transition-colors uppercase">{expert.name}</h3>
                    <p className="text-indigo-400 font-bold text-xs uppercase tracking-widest mt-1 mb-2">{expert.title}</p>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span className="text-sm font-black text-white">{expert.rating}</span>
                        </div>
                        <span className="text-slate-600">|</span>
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold uppercase tracking-tighter">
                            <MapPin className="w-3 h-3" /> {expert.location}
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6 flex-1">
                <div>
                    <h4 className="text-[10px] text-slate-600 font-black uppercase tracking-widest mb-3">Spécialité Principale</h4>
                    <p className="text-sm text-slate-300 font-medium">{expert.specialty}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {expert.tags.map((tag: string) => (
                        <span key={tag} className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[9px] font-black uppercase text-slate-400 tracking-widest">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            <div className="pt-8 mt-8 border-t border-white/5 flex gap-3">
                <button className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Profil Vérifié
                </button>
                <button className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2">
                    Prendre RDV
                </button>
            </div>
        </div>
    );
}
