"use client";

import { useState } from "react";
import {
    Users,
    ShieldCheck,
    Lock,
    UserPlus,
    MoreVertical,
    Key,
    Eye,
    Settings,
    ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UserAccount {
    id: string;
    name: string;
    email: string;
    role: "Expert-Comptable" | "Collaborateur Senior" | "Collaborateur Junior" | "Administrateur";
    status: "actif" | "suspendu";
    lastLogin: string;
    permissions: string[];
}

const MOCK_USERS: UserAccount[] = [
    {
        id: "1",
        name: "Dr. Moussa Traoré",
        email: "m.traore@cabinet360.com",
        role: "Expert-Comptable",
        status: "actif",
        lastLogin: "Il y a 10 min",
        permissions: ["Full Access", "Audit", "Signature"]
    },
    {
        id: "2",
        name: "Awa Diop",
        email: "a.diop@cabinet360.com",
        role: "Collaborateur Senior",
        status: "actif",
        lastLogin: "Hier",
        permissions: ["Saisie", "GED", "Déclarations"]
    },
    {
        id: "3",
        name: "Paul N'Guessan",
        email: "p.nguessan@cabinet360.com",
        role: "Administrateur",
        status: "actif",
        lastLogin: "Hier",
        permissions: ["Users", "Security", "Billing"]
    }
];

export default function UsersSettingsPage() {
    const [activeTab, setActiveTab] = useState<"utilisateurs" | "roles" | "securite">("utilisateurs");

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-indigo-400" />
                        Paramètres d'Administration
                    </h2>
                    <p className="text-slate-400 mt-1">Gestion des accès, de la sécurité et des politiques de sauvegarde.</p>
                </div>

                <div className="flex gap-2 bg-slate-900/50 p-1 rounded-xl border border-slate-700">
                    {["utilisateurs", "roles", "securite"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={cn(
                                "px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all",
                                activeTab === tab ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-500 hover:text-white"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === "utilisateurs" && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-white text-lg">Comptes Collaborateurs</h3>
                        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium flex items-center gap-2 transition-all">
                            <UserPlus className="w-4 h-4" /> Inviter un membre
                        </button>
                    </div>

                    <div className="glass-card rounded-2xl border border-slate-700/50 overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-900/50 text-slate-500 font-medium border-b border-slate-700/50">
                                <tr>
                                    <th className="px-6 py-4">Utilisateur</th>
                                    <th className="px-6 py-4">Rôle</th>
                                    <th className="px-6 py-4">Dernière Connexion</th>
                                    <th className="px-6 py-4">Statut</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {MOCK_USERS.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-800/20 group transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-indigo-400 border border-slate-700">
                                                    {user.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white">{user.name}</p>
                                                    <p className="text-xs text-slate-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-slate-300 bg-slate-800/50 px-3 py-1 rounded-full text-xs border border-slate-700">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 text-xs">
                                            {user.lastLogin}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                <span className="text-emerald-400 font-medium">Actif</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-500 hover:text-white transition-colors">
                                                <Settings className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === "securite" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-card rounded-2xl p-6 border border-slate-700/50 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                                <Lock className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">Sauvegarde & Archivage</h3>
                                <p className="text-xs text-slate-500 italic">Conforme normes RGPD & OHADA (Conservation 10 ans)</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-slate-200">Dernière Sauvegarde Cloud</span>
                                    <span className="text-xs text-emerald-500 font-bold">Réussi</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500">Aujourd'hui, 04:00 AM</span>
                                    <span className="text-slate-400">24.8 GB</span>
                                </div>
                                <div className="mt-4 h-1.5 w-full bg-slate-800 rounded-full">
                                    <div className="h-full w-full bg-emerald-500 rounded-full" />
                                </div>
                            </div>

                            <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2">
                                Télécharger une archive complète
                            </button>
                        </div>
                    </div>

                    <div className="glass-card rounded-2xl p-6 border border-slate-700/50 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400">
                                <ShieldAlert className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">Sécurité des Connexions</h3>
                                <p className="text-xs text-slate-500">Protection 2FA et Logs d'Audit</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 hover:bg-slate-800/30 rounded-lg border border-transparent hover:border-slate-800 transition-all cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <Key className="w-4 h-4 text-slate-500" />
                                    <span className="text-sm text-slate-200">Double Authentification (2FA)</span>
                                </div>
                                <span className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full font-bold">Obligatoire</span>
                            </div>
                            <div className="flex items-center justify-between p-3 hover:bg-slate-800/30 rounded-lg border border-transparent hover:border-slate-800 transition-all cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <Eye className="w-4 h-4 text-slate-500" />
                                    <span className="text-sm text-slate-200">Visualiser les Logs d'Accès</span>
                                </div>
                                <MoreVertical className="w-4 h-4 text-slate-600" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
