"use client";

import {
    BookOpen,
    Zap,
    ShieldCheck,
    Scale,
    Globe,
    Activity,
    Cpu,
    FileText,
    ArrowUpRight,
    Download,
    PlayCircle,
    Users,
    Briefcase
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const GUIDES = [
    {
        id: "accounting",
        title: "Expertise Comptable",
        subtitle: "Flux de travail 'Zéro Saisie' & SYSCOHADA",
        description: "Maîtrisez l'automatisation comptable, l'OCR et la révision digitale.",
        icon: Cpu,
        color: "text-indigo-400",
        bg: "bg-indigo-500/10",
        border: "border-indigo-500/20",
        duration: "4h 30m"
    },
    {
        id: "audit",
        title: "Audit & Assurance",
        subtitle: "Normes ISA & Digital Fieldwork",
        description: "Apprenez à conduire des missions d'audit 100% dématérialisées.",
        icon: ShieldCheck,
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        duration: "6h 00m"
    },
    {
        id: "tax",
        title: "Tax Intelligence",
        subtitle: "Audit Fiscal & Optimisation",
        description: "Techniques de diagnostic des risques fiscaux latents via Nexus IA.",
        icon: Zap,
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        duration: "3h 15m"
    },
    {
        id: "judicial",
        title: "Expertise Judiciaire",
        subtitle: "Investigation & Forensics",
        description: "Gestion des ordonnances judiciaires et respect du contradictoire.",
        icon: Scale,
        color: "text-purple-400",
        bg: "bg-purple-500/10",
        border: "border-purple-500/20",
        duration: "2h 45m"
    },
    {
        id: "corporate",
        title: "Gouvernance Corporate",
        subtitle: "Gestion Juridique & Entity Hub",
        description: "Digitalisation du secrétariat juridique et suivi des mandats.",
        icon: Globe,
        color: "text-cyan-400",
        bg: "bg-cyan-500/10",
        border: "border-cyan-500/20",
        duration: "2h 00m"
    },
    {
        id: "market",
        title: "Market Intelligence",
        subtitle: "Benchmarking & BI Stratégique",
        description: "Interprétation des données sectorielles pour le conseil client.",
        icon: Activity,
        color: "text-rose-400",
        bg: "bg-rose-500/10",
        border: "border-rose-500/20",
        duration: "1h 30m"
    },
    {
        id: "ops",
        title: "Opérations & Rentabilité",
        subtitle: "Gestion de Cabinet & Timesheets",
        description: "Pilotez la performance et la facturation de vos missions en temps réel.",
        icon: Briefcase,
        color: "text-slate-300",
        bg: "bg-slate-500/10",
        border: "border-slate-500/20",
        duration: "2h 15m"
    },
    {
        id: "cyber",
        title: "Cyber-Vigilance",
        subtitle: "Sécurité & Protection Data",
        description: "Protocoles de défense contre les cyber-menaces et gestion du Nexus Vault.",
        icon: ShieldCheck,
        color: "text-red-400",
        bg: "bg-red-500/10",
        border: "border-red-500/20",
        duration: "3h 00m"
    },
    {
        id: "crm",
        title: "Relation Client CRM",
        subtitle: "Expérience Client & Conciergerie",
        description: "Maîtrisez l'art de la relation client premium et le portail collaboratif.",
        icon: Users,
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        duration: "2h 30m"
    }
];

export default function TrainingManualsPage() {
    return (
        <div className="space-y-12 pb-20 animate-in fade-in duration-1000">
            {/* Premium Header */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/20 p-12 rounded-[60px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-24 opacity-5 pointer-events-none">
                    <BookOpen className="w-80 h-80 text-white" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="px-3 py-1 bg-white/5 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-white/10">
                                Service Après-Vente Elite
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tight leading-tight uppercase mb-6">
                            Mastering <span className="text-indigo-400">Nexus Elite</span>
                        </h1>
                        <p className="text-slate-400 text-lg font-medium leading-relaxed">
                            Accédez à nos manuels de formation premium. Des guides étape par étape conçus pour transformer vos équipes en experts de la donnée comptable et juridique.
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 shrink-0">
                        <div className="flex items-center gap-4 p-6 bg-white/5 rounded-[32px] border border-white/5 backdrop-blur-xl">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
                                <Users className="w-6 h-6 text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-white leading-none">1,240+</p>
                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter mt-1">Experts Formés</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid of Manuals */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {GUIDES.map((guide) => (
                    <div
                        key={guide.id}
                        className={cn(
                            "glass-card p-10 rounded-[50px] border transition-all duration-500 hover:scale-[1.02] group relative overflow-hidden",
                            guide.border
                        )}
                    >
                        <div className={cn("inline-flex p-5 rounded-3xl mb-8", guide.bg)}>
                            <guide.icon className={cn("w-8 h-8", guide.color)} />
                        </div>

                        <div className="mb-8">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2 group-hover:text-indigo-400 transition-colors">
                                {guide.title}
                            </h3>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">
                                {guide.subtitle}
                            </p>
                            <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">
                                {guide.description}
                            </p>
                        </div>

                        <div className="flex items-center justify-between pt-8 border-t border-white/5">
                            <div className="flex items-center gap-2">
                                <PlayCircle className="w-4 h-4 text-slate-600" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{guide.duration}</span>
                            </div>
                            <Link href="/documentation/training-manuals/pdf-export" className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all">
                                <Download className="w-4 h-4" /> Manuel PDF Premium
                                <ArrowUpRight className="w-3 h-3 opacity-30 group-hover:opacity-100 transition-opacity" />
                            </Link>
                        </div>

                        {/* Decoration */}
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-gradient-to-br from-white/10 to-transparent blur-2xl rounded-full" />
                    </div>
                ))}
            </div>

            {/* Bottom Support Callout */}
            <div className="p-12 rounded-[50px] bg-indigo-600 relative overflow-hidden shadow-2xl shadow-indigo-600/20">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                    <Zap className="w-64 h-64 text-white" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2">Besoin d'une formation sur site ?</h2>
                        <p className="text-indigo-100 font-medium opacity-80">Nos experts se déplacent dans vos bureaux pour des sessions de masterclass immersives.</p>
                    </div>
                    <button className="px-10 py-5 bg-white text-indigo-600 rounded-2xl font-black uppercase tracking-widest text-[12px] hover:shadow-2xl transition-all h-fit whitespace-nowrap">
                        Réserver un Expert
                    </button>
                </div>
            </div>
        </div>
    );
}
