"use client";

import React, { useState } from 'react';
import {
    LayoutDashboard,
    Users,
    FileText,
    Calculator,
    ShieldCheck,
    Search,
    ChevronRight,
    PlayCircle,
    HelpCircle,
    CheckCircle2,
    Calendar,
    Settings,
    ArrowRight
} from 'lucide-react';
import { cn } from "@/lib/utils";

const SECTIONS = [
    {
        id: "getting-started",
        title: "Premiers Pas",
        icon: LayoutDashboard,
        content: (
            <div className="space-y-8">
                <div className="space-y-4">
                    <h3 className="text-3xl font-black text-white">Bienvenue sur Cabinet 360</h3>
                    <p className="text-slate-400 leading-relaxed text-lg">
                        Cabinet 360 est conçu pour simplifier chaque aspect de votre vie professionnelle.
                        Voici comment bien démarrer votre première session.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <GuideStep
                        number="01"
                        title="Configuration du Cabinet"
                        desc="Remplissez les informations de base de votre cabinet dans les paramètres pour personnaliser vos documents."
                    />
                    <GuideStep
                        number="02"
                        title="Création de Client"
                        desc="Utilisez l'import automatique par numéro RCCM ou NINEA pour créer vos fiches clients en 2 secondes."
                    />
                </div>

                <div className="p-8 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl space-y-4">
                    <h4 className="flex items-center gap-2 font-bold text-indigo-400 uppercase text-xs tracking-widest">
                        <PlayCircle className="w-4 h-4" /> Tutoriel Vidéo
                    </h4>
                    <p className="text-white font-bold text-xl">Découvrez l'interface en moins de 3 minutes.</p>
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg font-bold hover:bg-indigo-600 transition-all">
                        Regarder la vidéo <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        )
    },
    {
        id: "clients",
        title: "Gestion Clients & CRM",
        icon: Users,
        content: (
            <div className="space-y-8">
                <div className="space-y-4">
                    <h3 className="text-3xl font-black text-white">Le CRM OHADA 360°</h3>
                    <p className="text-slate-400 leading-relaxed">
                        Chaque client dispose d'une fiche complète centralisant documents, missions,
                        échéances fiscales et communication.
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="flex gap-4 items-start p-6 bg-white/5 rounded-2xl border border-white/5">
                        <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400 shrink-0">
                            <Settings className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-2">Paramétrage Fiscal</h4>
                            <p className="text-sm text-slate-500">Configurez le régime fiscal (Réel Normal, Simplifié, CME) pour activer les alertes de déclarations automatiques.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start p-6 bg-white/5 rounded-2xl border border-white/5">
                        <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400 shrink-0">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-2">Gestion Électronique des Documents</h4>
                            <p className="text-sm text-slate-500">Glissez-déposez vos fichiers directement. L'OCR extraira les données essentielles pour vous.</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "fiscalite",
        title: "Fiscalité & États Fin.",
        icon: Calculator,
        content: (
            <div className="space-y-8">
                <div className="space-y-4">
                    <h3 className="text-3xl font-black text-white">Moteur de Calcul OHADA</h3>
                    <p className="text-slate-400 leading-relaxed">
                        Générez vos bilans et comptes de résultat conformes à la norme AUDCIF en un clic.
                    </p>
                </div>

                <div className="rounded-3xl border border-white/5 overflow-hidden">
                    <div className="bg-slate-800/50 p-4 border-b border-white/5 flex items-center gap-2 font-bold text-xs uppercase tracking-widest text-slate-400">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Checklist de Clôture
                    </div>
                    <div className="p-6 bg-[#13161c] space-y-3">
                        <CheckItem label="Importation de la Balance N" />
                        <CheckItem label="Réconciliation des comptes de trésorerie" />
                        <CheckItem label="Validation du mapping OHADA" />
                        <CheckItem label="Génération du PDF pour la DGID" />
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "security",
        title: "Sécurité & Accès",
        icon: ShieldCheck,
        content: (
            <div className="space-y-8">
                <div className="space-y-4">
                    <h3 className="text-3xl font-black text-white">Sécurité de Niveau Bancaire</h3>
                    <p className="text-slate-400 leading-relaxed">
                        Vos données sont votre actif le plus précieux. Nous les protégeons avec la plus grande rigueur.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                        <h4 className="font-bold text-emerald-400 mb-2 italic">Chiffrement AES-256</h4>
                        <p className="text-xs text-slate-500 leading-normal">Toutes les données sont chiffrées au repos et en transit, garantissant une confidentialité totale.</p>
                    </div>
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                        <h4 className="font-bold text-emerald-400 mb-2 italic">Sauvegardes Quotidiennes</h4>
                        <p className="text-xs text-slate-500 leading-normal">Plusieurs copies de sauvegarde sont effectuées chaque jour sur des serveurs redondants.</p>
                    </div>
                </div>
            </div>
        )
    }
];

export default function UserManualPage() {
    const [activeSection, setActiveSection] = useState(SECTIONS[0].id);

    const currentSection = SECTIONS.find(s => s.id === activeSection);

    return (
        <div className="min-h-screen bg-[#0a0c10] flex overflow-hidden">

            {/* Nav Sidebar */}
            <aside className="w-80 bg-[#13161c] border-r border-white/5 flex flex-col p-6 gap-8 overflow-y-auto">
                <div className="flex flex-col items-center gap-4 py-6 border-b border-white/5">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-500/20">
                        C
                    </div>
                    <div className="text-center">
                        <h1 className="font-black text-white tracking-widest uppercase text-xs">Aide & Support</h1>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Cabinet 360 v2.0</p>
                    </div>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Rechercher une aide..."
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/5 rounded-xl text-sm focus:border-indigo-500/50 transition-all outline-none"
                    />
                </div>

                <nav className="flex flex-col gap-2">
                    {SECTIONS.map((section) => {
                        const Icon = section.icon;
                        const isActive = activeSection === section.id;
                        return (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                                    isActive
                                        ? "bg-indigo-600 text-white shadow-xl shadow-indigo-500/20"
                                        : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
                                )}
                            >
                                <Icon className={cn("w-5 h-5", isActive ? "text-white" : "group-hover:text-indigo-400")} />
                                <span className="font-bold text-sm">{section.title}</span>
                                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                            </button>
                        );
                    })}
                </nav>

                <div className="mt-auto p-6 bg-indigo-600/10 border border-indigo-500/20 rounded-[30px] space-y-4">
                    <div className="flex items-center gap-3">
                        <HelpCircle className="w-6 h-6 text-indigo-400" />
                        <span className="font-bold text-white text-xs uppercase tracking-widest">En direct ?</span>
                    </div>
                    <p className="text-[10px] text-indigo-200 uppercase font-bold tracking-widest leading-relaxed">
                        Besoin d'aide immédiate pour une déclaration ?
                    </p>
                    <button className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg">
                        Chat avec un Expert
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto bg-[#0a0c10] p-20">
                <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {currentSection?.content}
                </div>
            </main>

        </div>
    );
}

function GuideStep({ number, title, desc }: { number: string; title: string; desc: string }) {
    return (
        <div className="p-8 bg-[#13161c] border border-white/5 rounded-3xl space-y-4 hover:border-indigo-500/30 transition-colors">
            <span className="text-4xl font-black text-indigo-500/20">{number}</span>
            <h4 className="text-xl font-bold text-white">{title}</h4>
            <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
        </div>
    );
}

function CheckItem({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-3 text-slate-300 font-medium">
            <div className="w-4 h-4 rounded-md border border-white/20 flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 text-emerald-500 opacity-0 group-hover:opacity-100" />
            </div>
            {label}
        </div>
    );
}
