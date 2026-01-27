"use client";

import { useState } from "react";
import {
    Users,
    FileText,
    Calculator,
    Globe,
    Plus,
    Search,
    Download,
    CheckCircle2,
    AlertCircle,
    MoreVertical,
    Clock,
    Banknote,
    HeartPulse,
    ShieldAlert,
    TrendingUp,
    ArrowRight,
    Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Employee {
    id: string;
    name: string;
    position: string;
    country: string;
    salary: string;
    status: "Actif" | "Congé" | "Sortie";
    lastPayslip: string;
}

const MOCK_EMPLOYEES: Employee[] = [
    { id: "1", name: "Amadou Diallo", position: "Comptable", country: "Sénégal", salary: "450 000", status: "Actif", lastPayslip: "Avril 2024" },
    { id: "2", name: "Fatou Binetou", position: "Assistante", country: "Côte d'Ivoire", salary: "380 000", status: "Actif", lastPayslip: "Avril 2024" },
    { id: "3", name: "Jean-Pierre", position: "Manager", country: "Gabon", salary: "1 200 000", status: "Congé", lastPayslip: "Mars 2024" },
];

export default function PayrollPage() {
    const [selectedCountry, setSelectedCountry] = useState("Tous");

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-8 rounded-[40px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <Banknote className="w-40 h-40 text-emerald-400" />
                </div>

                <div className="relative z-10">
                    <h2 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
                        <div className="p-3 bg-emerald-600 rounded-2xl shadow-xl shadow-emerald-600/30">
                            <Calculator className="w-8 h-8 text-white" />
                        </div>
                        Paie & Social (Multi-Pays)
                    </h2>
                    <p className="text-slate-400 mt-2 max-w-2xl font-medium">
                        Gestion des salaires, cotisations sociales et déclarations IPRES/CSS/CNPS.
                    </p>
                </div>

                <div className="flex gap-4 relative z-10">
                    <button className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] border border-white/5 flex items-center gap-2 transition-all">
                        <FileText className="w-4 h-4" /> Déclarations Sociales
                    </button>
                    <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 transition-all shadow-xl shadow-emerald-600/30 active:scale-95">
                        <Plus className="w-4 h-4" /> Nouveau Bulletin
                    </button>
                </div>
            </div>

            {/* Country Selector */}
            <div className="flex gap-4 p-1 bg-slate-900 border border-white/5 rounded-3xl w-fit overflow-x-auto no-scrollbar">
                {["Tous", "Sénégal", "Côte d'Ivoire", "Gabon", "Cameroun", "Mali"].map((country) => (
                    <button
                        key={country}
                        onClick={() => setSelectedCountry(country)}
                        className={cn(
                            "px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                            selectedCountry === country ? "bg-emerald-600 text-white shadow-xl shadow-emerald-600/20" : "text-slate-500 hover:text-slate-200"
                        )}
                    >
                        <Globe className="w-3 h-3" />
                        {country}
                    </button>
                ))}
            </div>

            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <SocialKpi title="Masse Salariale" value="18.2M" subtext="Total Cabinet (FCFA)" icon={Banknote} color="text-emerald-400" />
                <SocialKpi title="Cotisations" value="4.5M" subtext="A déclarer ce mois" icon={HeartPulse} color="text-rose-400" />
                <SocialKpi title="Effectif" value="32" subtext="Collaborateurs actifs" icon={Users} color="text-indigo-400" />
                <SocialKpi title="Congés" value="04" subtext="En cours de validation" icon={Clock} color="text-amber-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Employee List */}
                <div className="lg:col-span-2 glass-card rounded-[40px] border border-white/5 bg-slate-900/20 overflow-hidden shadow-2xl">
                    <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/40">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                            <Users className="w-5 h-5 text-emerald-400" />
                            Répertoire Salariés
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-900/80 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                                <tr>
                                    <th className="px-8 py-6">Salarié / Poste</th>
                                    <th className="px-6 py-6 font-black">Pays</th>
                                    <th className="px-6 py-6 font-black text-right">Salaire Base</th>
                                    <th className="px-6 py-6 font-black">Dernier Bulletin</th>
                                    <th className="px-8 py-6 font-black text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {MOCK_EMPLOYEES.map((employee) => (
                                    <tr key={employee.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center text-xs font-black text-emerald-400">
                                                    {employee.name[0]}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-white block">{employee.name}</span>
                                                    <span className="text-[10px] text-slate-500 font-bold uppercase">{employee.position}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className="text-xs font-bold text-slate-400 flex items-center gap-2">
                                                <Globe className="w-3 h-3" /> {employee.country}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <span className="font-mono font-black text-white">{employee.salary} FCFA</span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                <span className="text-xs font-bold text-slate-300">{employee.lastPayslip}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all">
                                                    <Download className="w-4 h-4" />
                                                </button>
                                                <button className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Social Audit & Compliance Sidebar */}
                <div className="space-y-6">
                    <div className="glass-card rounded-[40px] p-8 border border-rose-500/10 bg-rose-500/[0.02]">
                        <h3 className="text-rose-400 font-black text-[10px] uppercase tracking-widest mb-6 flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4" />
                            Alertes Conformité Sociale
                        </h3>
                        <div className="space-y-4">
                            <ComplianceTask title="Sénégal: Déclaration IPRES" desc="Échéance dans 2 jours (Mai 2024)" status="Urgent" />
                            <ComplianceTask title="Mise à jour barème" desc="Nouveau SMIG Côte d'Ivoire" status="Info" />
                            <ComplianceTask title="Congés payés" desc="3 reliquats > 30 jours (A. Koné)" status="Avertissement" />
                        </div>
                    </div>

                    <div className="glass-card rounded-[40px] p-8 bg-slate-900/40 border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <TrendingUp className="w-20 h-20" />
                        </div>
                        <h4 className="text-white font-bold mb-2">Simulateur de Coût Salarial</h4>
                        <p className="text-xs text-slate-500 mb-6 font-medium">Estimez le coût total d'une embauche incluant les charges patronales par pays.</p>
                        <button className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3">
                            Calculer le coût total <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SocialKpi({ title, value, subtext, icon: Icon, color }: any) {
    return (
        <div className="glass-card p-6 rounded-[32px] border border-white/5 bg-slate-900/40 group hover:scale-[1.02] transition-transform">
            <div className={cn("p-3 rounded-2xl w-fit mb-4", color.replace("text-", "bg-").replace("-400", "-500/10"))}>
                <Icon className={cn("w-5 h-5", color)} />
            </div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{title}</p>
            <h3 className="text-2xl font-black text-white">{value}</h3>
            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-wider mt-1">{subtext}</p>
        </div>
    );
}

function ComplianceTask({ title, desc, status }: any) {
    return (
        <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5 hover:bg-white/[0.04] transition-all cursor-pointer">
            <div className="flex justify-between items-start mb-1">
                <h4 className="text-xs font-bold text-white">{title}</h4>
                <span className={cn(
                    "text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase",
                    status === "Urgent" ? "bg-rose-500 text-white" : "bg-indigo-500 text-white"
                )}>{status}</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">{desc}</p>
        </div>
    );
}
