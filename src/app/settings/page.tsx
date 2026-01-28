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
    Save,
    ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
        { id: "admin", label: "Administration Système", icon: ShieldCheck },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-foreground tracking-tight">Paramètres</h2>
                    <p className="text-muted-foreground mt-1">Configurez votre environnement de travail et les préférences du cabinet.</p>
                </div>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20">
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
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                            <span className="font-bold text-sm tracking-wide uppercase">{item.label}</span>
                            {activeTab === item.id && <ChevronRight className="ml-auto w-4 h-4" />}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="glass-card rounded-2xl border border-border/50 p-8 min-h-[500px]">
                        {activeTab === "général" && (
                            <div className="space-y-8">
                                <h3 className="text-xl font-bold text-foreground border-b border-border/50 pb-4">Préférences Générales</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase">Langue de l'interface</label>
                                        <select className="w-full bg-background border border-border rounded-lg p-2.5 text-foreground">
                                            <option>Français (Défaut)</option>
                                            <option>English</option>
                                            <option>Português</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase">Fuseau Horaire</label>
                                        <select className="w-full bg-background border border-border rounded-lg p-2.5 text-foreground">
                                            <option>(GMT+00:00) Abidjan / Dakar</option>
                                            <option>(GMT+01:00) Douala / Libreville</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase">Devise par défaut</label>
                                        <select className="w-full bg-background border border-border rounded-lg p-2.5 text-foreground">
                                            <option>FCFA (XOF)</option>
                                            <option>FCFA (XAF)</option>
                                            <option>EUR</option>
                                            <option>USD</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <h4 className="text-sm font-bold text-foreground mb-4">Fonctionnalités Bêta</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border">
                                            <div>
                                                <p className="text-sm font-bold text-foreground">Saisie Vocale IA</p>
                                                <p className="text-xs text-muted-foreground">Dictez vos notes de frais ou vos mémos d'audit.</p>
                                            </div>
                                            <div className="w-12 h-6 bg-muted rounded-full relative cursor-pointer">
                                                <div className="absolute left-1 top-1 w-4 h-4 bg-muted-foreground rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "sécurité" && (
                            <div className="space-y-8">
                                <h3 className="text-xl font-bold text-foreground border-b border-border/50 pb-4">Sécurité & Accès</h3>
                                <div className="space-y-4">
                                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center gap-4">
                                        <Shield className="w-8 h-8 text-emerald-500" />
                                        <div>
                                            <p className="text-sm font-bold text-emerald-500">Authentification à deux facteurs active</p>
                                            <p className="text-xs text-muted-foreground">Votre compte est protégé par 2FA.</p>
                                        </div>
                                    </div>
                                    <button className="px-4 py-2 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80 border border-border transition-colors">
                                        Changer le mot de passe
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === "admin" && (
                            <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                <ShieldCheck className="w-20 h-20 text-primary opacity-20 mb-6" />
                                <h3 className="text-2xl font-bold text-foreground mb-3">Espace d'Administration Système</h3>
                                <p className="text-muted-foreground max-w-md mb-8">
                                    Gérez les rôles des collaborateurs, les permissions avancées et les politiques de sécurité critiques du cabinet.
                                </p>
                                <Link
                                    href="/settings/admin"
                                    className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold transition-all shadow-lg shadow-primary/30 hover:scale-105"
                                >
                                    Ouvrir les outils d'administration
                                </Link>
                            </div>
                        )}

                        {/* Other tabs placeholders */}
                        {activeTab !== "général" && activeTab !== "sécurité" && activeTab !== "admin" && (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
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
