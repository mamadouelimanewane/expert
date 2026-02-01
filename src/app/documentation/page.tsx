"use client";

import React from 'react';
import Link from 'next/link';
import {
    FileText,
    Book,
    ShieldCheck,
    Download,
    Printer,
    ArrowRight,
    Library,
    Rocket,
    CheckCircle2,
    Users,
    Globe,
    FileSignature,
    PenTool,
    Briefcase
} from 'lucide-react';
import { cn } from "@/lib/utils";

const documents = [
    {
        category: "Marketing & Ventes",
        items: [
            {
                title: "Brochure Commerciale 2026",
                description: "Présentation premium des fonctionnalités et avantages compétitifs.",
                href: "/documentation/brochure",
                icon: Rocket,
                type: "PDF / Imprimable"
            },
            {
                title: "Lettre de Présentation",
                description: "Modèle de lettre personnalisable pour les nouveaux clients.",
                href: "/documentation/lettre",
                icon: FileSignature,
                type: "Word / Editable"
            },
            {
                title: "Présentation Stratégique",
                description: "Analyse profonde de la solution et du marché OHADA.",
                href: "/presentation",
                icon: FileText,
                type: "Executive Summary"
            }
        ]
    },
    {
        category: "Support & Utilisation",
        items: [
            {
                title: "Manuel d'Utilisation",
                description: "Guide complet pas à pas pour maîtriser Cabinet 360.",
                href: "/documentation/manuel",
                icon: Book,
                type: "Interactive Guide"
            },
            {
                title: "Release Notes v2.0.0",
                description: "Détails des dernières mises à jour et nouvelles fonctionnalités IA.",
                href: "/documentation/release-notes",
                icon: ZapIcon,
                type: "Changelog"
            }
        ]
    },
    {
        category: "Juridique & Conformité",
        items: [
            {
                title: "Conformité OHADA & AUDCIF",
                description: "Documentation technique sur la validité juridique des rapports.",
                href: "/library",
                icon: ShieldCheck,
                type: "Certification"
            },
            {
                title: "Conditions Générales (CGU/CGV)",
                description: "Cadre contractuel pour les cabinets et leurs clients.",
                href: "/legal",
                icon: PenTool,
                type: "Contracts"
            }
        ]
    }
];

export default function DocumentationHubPage() {
    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-8">
            <div className="max-w-6xl mx-auto space-y-12">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-12">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-bold tracking-widest uppercase">
                            Centre de Ressources Elite
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tight">Documentation & <span className="text-indigo-500">Marketing</span></h1>
                        <p className="text-slate-400 text-lg max-w-2xl">
                            Accédez à tous les supports officiels, guides d'utilisation et matériels marketing
                            conçus pour l'excellence de votre cabinet.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10">
                            <Download className="w-5 h-5" /> Tout Télécharger
                        </button>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 gap-12">
                    {documents.map((section, idx) => (
                        <section key={idx} className="space-y-6">
                            <h2 className="text-xl font-bold text-slate-400 flex items-center gap-3">
                                <span className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                                {section.category}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {section.items.map((doc, dIdx) => {
                                    const Icon = doc.icon || FileText;
                                    return (
                                        <Link
                                            key={dIdx}
                                            href={doc.href}
                                            className="group relative bg-[#13161c] border border-white/5 p-6 rounded-[24px] hover:border-indigo-500/50 transition-all hover:bg-[#1a1e26] hover:-translate-y-1 shadow-xl overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-[40px] rounded-full group-hover:bg-indigo-600/10 transition-colors" />

                                            <div className="flex flex-col h-full gap-6">
                                                <div className="flex justify-between items-start relative z-10">
                                                    <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                                        <Icon className="w-6 h-6" />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-800/50 px-2 py-1 rounded">
                                                        {doc.type}
                                                    </span>
                                                </div>

                                                <div className="relative z-10">
                                                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                                                        {doc.title}
                                                    </h3>
                                                    <p className="text-sm text-slate-500 leading-relaxed">
                                                        {doc.description}
                                                    </p>
                                                </div>

                                                <div className="mt-auto flex items-center gap-2 text-indigo-500 font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0 relative z-10">
                                                    Ouvrir le document <ArrowRight className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </section>
                    ))}
                </div>

                {/* Integration Checklist / Help Area */}
                <div className="mt-20 p-10 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[40px] text-white flex flex-col md:flex-row items-center gap-10 shadow-2xl shadow-indigo-500/20">
                    <div className="flex-1 space-y-4">
                        <h2 className="text-3xl font-black">Besoin d'un support personnalisé ?</h2>
                        <p className="text-indigo-100 text-lg">
                            Nos équipes sont disponibles pour vous accompagner dans la personnalisation de vos
                            documents juridiques et marketing.
                        </p>
                        <div className="flex gap-4 pt-4">
                            <button className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:shadow-lg transition-all shadow-md">
                                Contacter le Support
                            </button>
                            <button className="px-6 py-3 bg-transparent border border-white/30 text-white rounded-xl font-bold hover:bg-white/10 transition-all">
                                Base de Connaissances
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-col items-center">
                            <CheckCircle2 className="w-8 h-8 text-white mb-2" />
                            <span className="text-[10px] uppercase font-bold text-indigo-100">Disponibilité</span>
                            <span className="font-bold">24/7/365</span>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-col items-center">
                            <Users className="w-8 h-8 text-white mb-2" />
                            <span className="text-[10px] uppercase font-bold text-indigo-100">Experts</span>
                            <span className="font-bold">Dédiés</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

function ZapIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M4 14.71 12 2.29l.66 1.15L8 15.93l-.67-1.15L4 14.71ZM12 21.71l-8-12.42-.66-1.15 4.67 1.15.66 1.15-8 12.42ZM20 14.71l-8-12.42-.66-1.15 4.67 1.15.66 1.15-8 12.42Z" />
        </svg>
    )
}
