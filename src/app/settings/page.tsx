"use client";

import { useState } from "react";
import {
    Settings,
    User,
    Bell,
    Shield,
    Database,
    Globe,
    Cpu,
    Briefcase,
    Building,
    CreditCard,
    ChevronRight,
    Save
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("général");

    const menuItems = [
        { id: "général", label: "Général", icon: Settings },
        { id: "profil", label: "Profil Expert", icon: User },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "sécurité", label: "Sécurité", icon: Shield },
        { id: "cabinet", label: "Détails Cabinet", icon: Building },
        { id: "facturation", label: "Abonnement", icon: CreditCard },
        { id: "ia", label: "Configuration IA", icon: Cpu },
        { id: "données", label: "Export & Sauvegarde", icon: Database },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Paramètres</h2>
                    <p className="text-slate-400 mt-1">Configurez votre environnement de travail et les préférences du cabinet.</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20">
                    <Save className="w-4 h-4" /> Sauvegarder
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Menu */}
                <div className="lg:col-span-1 space-y-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                                activeTab === item.id
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-white" : "text-slate-500 group-hover:text-slate-300")} />
                            <span className="font-bold text-sm tracking-wide uppercase">{item.label}</span>
                            {activeTab === item.id && <ChevronRight className="ml-auto w-4 h-4" />}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="glass-card rounded-2xl border border-slate-700/50 p-8 min-h-[500px]">
                        {activeTab === "général" && (
                            <div className="space-y-8">
                                <h3 className="text-xl font-bold text-white border-b border-slate-800 pb-4">Préférences Générales</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Langue de l'interface</label>
                                        <select className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white">
                                            <option>Français (Défaut)</option>
                                            <option>English</option>
                                            <option>Português</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Fuseau Horaire</label>
                                        <select className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white">
                                            <option>(GMT+00:00) Abidjan / Dakar</option>
                                            <option>(GMT+01:00) Douala / Libreville</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Devise par défaut</label>
                                        <select className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white">
                                            <option>FCFA (XOF)</option>
                                            <option>FCFA (XAF)</option>
                                            <option>EUR</option>
                                            <option>USD</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <h4 className="text-sm font-bold text-white mb-4">Fonctionnalités Bêta</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                                            <div>
                                                <p className="text-sm font-bold text-white">Saisie Vocale IA</p>
                                                <p className="text-xs text-slate-500">Dictez vos notes de frais ou vos mémos d'audit.</p>
                                            </div>
                                            <div className="w-12 h-6 bg-slate-800 rounded-full relative cursor-pointer">
                                                <div className="absolute left-1 top-1 w-4 h-4 bg-slate-600 rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "sécurité" && (
                            <div className="space-y-8">
                                <h3 className="text-xl font-bold text-white border-b border-slate-800 pb-4">Sécurité & Accès</h3>
                                <div className="space-y-4">
                                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center gap-4">
                                        <Shield className="w-8 h-8 text-emerald-500" />
                                        <div>
                                            <p className="text-sm font-bold text-emerald-400">Authentification à deux facteurs active</p>
                                            <p className="text-xs text-slate-400">Votre compte est protégé par 2FA.</p>
                                        </div>
                                    </div>
                                    <button className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors">
                                        Changer le mot de passe
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Other tabs placeholders */}
                        {activeTab !== "général" && activeTab !== "sécurité" && (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4">
                                <Cpu className="w-16 h-16 opacity-10" />
                                <p className="font-medium italic">Section en cours de maintenance ou configuration nécessaire.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
