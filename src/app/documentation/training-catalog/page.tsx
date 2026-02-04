"use client";

import React from 'react';
import Link from 'next/link';
import {
    BookOpen,
    Download,
    Award,
    Star,
    Zap,
    Users,
    ChevronRight,
    ArrowRight,
    Play,
    Clock,
    ShieldCheck,
    Globe,
    Monitor,
    Brain,
    Target
} from 'lucide-react';
import { cn } from "@/lib/utils";

const catalogHighlights = [
    {
        title: "Expert SYSCOHADA Révisé",
        duration: "40h",
        rating: 4.9,
        category: "Comptabilité",
        price: "150 000 FCFA",
        isCertifying: true
    },
    {
        title: "Consolidation Groupe IFRS/OHADA",
        duration: "25h",
        rating: 4.8,
        category: "Normes",
        price: "200 000 FCFA",
        isCertifying: true
    },
    {
        title: "Audit Intelligence IA",
        duration: "15h",
        rating: 4.7,
        category: "Audit",
        price: "125 000 FCFA",
        isCertifying: true
    }
];

export default function CatalogMarketingPage() {
    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-8 space-y-12">

            {/* Hero Section */}
            <div className="bg-gradient-to-br from-teal-900/20 via-slate-900 to-slate-900 rounded-[50px] border border-white/5 p-16 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                    <BookOpen className="w-64 h-64 text-teal-400" />
                </div>

                <div className="relative z-10 max-w-3xl space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/10 text-teal-400 rounded-full text-xs font-bold tracking-widest uppercase border border-teal-500/20">
                        Formation Continue Elite
                    </div>
                    <h1 className="text-6xl font-black text-white tracking-tight leading-tight">
                        Élevez vos Compétences vers l'<span className="text-teal-400">Excellence</span>
                    </h1>
                    <p className="text-slate-400 text-xl leading-relaxed">
                        Le catalogue de formations le plus complet pour les professionnels du chiffre et du droit dans l'espace OHADA.
                    </p>
                    <div className="flex gap-4 pt-4">
                        <Link href="/training/catalog" className="px-8 py-4 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-teal-600/30 flex items-center gap-2">
                            Voir le Catalogue Interactif <ChevronRight className="w-4 h-4" />
                        </Link>
                        <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2">
                            <Download className="w-4 h-4" /> Brochure PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Formations Actives", value: "45+", icon: Monitor },
                    { label: "Apprenants Certifiés", value: "2,500+", icon: Award },
                    { label: "Experts Formateurs", value: "12", icon: Users },
                    { label: "Masterclasses Live", value: "Hebdomadaires", icon: Zap },
                ].map((stat, i) => (
                    <div key={stat.label} className="glass-card p-8 rounded-[32px] bg-slate-900/40 border border-white/5 flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-400 mb-4">
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <p className="text-3xl font-black text-white">{stat.value}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Highlights */}
            <div className="space-y-8">
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-black text-white">Parcours <span className="text-teal-400">Certifiants</span></h2>
                        <p className="text-slate-400 mt-2">Les formations les plus plébiscitées par nos membres.</p>
                    </div>
                    <Link href="/training/catalog" className="text-teal-400 font-bold text-sm hover:underline">Voir tout le catalogue</Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {catalogHighlights.map((course) => (
                        <div key={course.title} className="glass-card rounded-[32px] border border-white/5 bg-slate-900/40 p-8 group hover:border-teal-500/30 transition-all hover:-translate-y-1 shadow-xl">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-400 group-hover:bg-teal-600 group-hover:text-white transition-all">
                                    <Award className="w-6 h-6" />
                                </div>
                                <div className="flex items-center gap-1 text-amber-500">
                                    <Star className="w-4 h-4 fill-amber-500" />
                                    <span className="text-xs font-bold">{course.rating}</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-black text-white mb-2 group-hover:text-teal-400 transition-colors">{course.title}</h3>
                            <p className="text-xs text-slate-500 mb-6 font-bold uppercase tracking-widest">{course.category} • {course.duration}</p>

                            <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                <span className="text-lg font-black text-white">{course.price}</span>
                                <Link href="/training/catalog" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-teal-400 group-hover:bg-teal-600 group-hover:text-white transition-all">
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* E-Learning Features */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 py-12">
                <div className="space-y-8">
                    <h2 className="text-4xl font-black text-white tracking-tight">Une Expérience d'<span className="text-teal-400">E-Learning</span> Moderne</h2>
                    <p className="text-slate-400 text-lg leading-relaxed">
                        Notre plateforme offre une flexibilité totale alliée à une rigueur académique certifiée par les organisations professionnelles.
                    </p>

                    <div className="space-y-4">
                        {[
                            { title: "Dashboard Personnel", desc: "Suivez votre progression et vos points CPF en temps réel.", icon: Monitor },
                            { title: "Contenu Multi-Support", desc: "Vidéos 4K, fiches de synthèse, quiz interactifs et exercices Excel.", icon: Play },
                            { title: "Certificats Blockchain", desc: "Vos diplômes sont sécurisés et vérifiables en un clic.", icon: ShieldCheck },
                            { title: "Accès Illimité", desc: "Formez-vous à votre rythme, 24h/24 et 7j/7.", icon: Clock },
                        ].map((feature) => (
                            <div key={feature.title} className="flex gap-4 p-4 rounded-3xl hover:bg-white/5 transition-all">
                                <div className="w-10 h-10 bg-teal-500/10 rounded-2xl flex flex-shrink-0 items-center justify-center text-teal-400">
                                    <feature.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white mb-1">{feature.title}</h4>
                                    <p className="text-sm text-slate-500">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-indigo-500/20 blur-[100px] opacity-20" />
                    <div className="relative rounded-[40px] border border-white/10 bg-slate-900 shadow-2xl overflow-hidden aspect-video flex items-center justify-center">
                        <div className="p-10 text-center animate-pulse">
                            <Monitor className="w-20 h-20 text-teal-500/30 mx-auto mb-4" />
                            <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-xs">Preview Plateforme</p>
                        </div>
                        {/* Overlay elements to simulate UI */}
                        <div className="absolute top-6 left-6 right-6 h-4 bg-white/5 rounded-full" />
                        <div className="absolute top-16 left-6 w-1/3 h-4 bg-white/5 rounded-full" />
                        <div className="absolute bottom-6 left-6 right-6 h-20 bg-white/5 rounded-[24px]" />
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-br from-indigo-600 to-teal-700 rounded-[50px] p-20 text-center shadow-2xl shadow-teal-500/20">
                <h2 className="text-5xl font-black text-white mb-6">Prêt à transformer votre carrière ?</h2>
                <p className="text-teal-100 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                    Rejoignez les 2,500+ professionnels déjà inscrits et accédez à l'excellence dès aujourd'hui.
                </p>
                <div className="flex justify-center gap-6">
                    <Link href="/training/catalog" className="px-10 py-5 bg-white text-teal-600 rounded-[20px] font-black uppercase tracking-widest text-xs shadow-xl hover:scale-105 transition-all">
                        Explorer le Catalogue
                    </Link>
                    <Link href="/training/academy" className="px-10 py-5 bg-transparent border-2 border-white/30 text-white rounded-[20px] font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all">
                        Espace Membre
                    </Link>
                </div>
            </div>

        </div>
    );
}
