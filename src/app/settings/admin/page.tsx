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
    ShieldAlert,
    Plus,
    RefreshCw,
    Save,
    Cloud,
    Database,
    Calendar,
    Globe,
    Download,
    FileText,
    CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UserAccount {
    id: string;
    name: string;
    email: string;
    role: string;
    status: "actif" | "suspendu";
    lastLogin: string;
}

interface RoleDefinition {
    id: string;
    name: string;
    description: string;
    permissionsCount: number;
    color: string;
}

const MOCK_USERS: UserAccount[] = [
    {
        id: "1",
        name: "Dr. Moussa Traoré",
        email: "m.traore@cabinet360.com",
        role: "Expert-Comptable",
        status: "actif",
        lastLogin: "Il y a 10 min",
    },
    {
        id: "2",
        name: "Awa Diop",
        email: "a.diop@cabinet360.com",
        role: "Collaborateur Senior",
        status: "actif",
        lastLogin: "Hier",
    },
    {
        id: "3",
        name: "Paul N'Guessan",
        email: "p.nguessan@cabinet360.com",
        role: "Administrateur IT",
        status: "actif",
        lastLogin: "Hier",
    }
];

const ROLES: RoleDefinition[] = [
    { id: "1", name: "Expert-Comptable", description: "Accès total, signature légale et validation finale.", permissionsCount: 42, color: "text-indigo-400" },
    { id: "2", name: "Administrateur IT", description: "Gestion des utilisateurs, sécurité et sauvegardes.", permissionsCount: 15, color: "text-rose-400" },
    { id: "3", name: "Collaborateur Senior", description: "Gestion complète des dossiers clients et révision.", permissionsCount: 28, color: "text-emerald-400" },
    { id: "4", name: "Collaborateur Junior", description: "Saisie comptable et gestion documentaire de base.", permissionsCount: 12, color: "text-amber-400" },
];

export default function UsersSettingsPage() {
    const [activeTab, setActiveTab] = useState<"utilisateurs" | "roles" | "securite" | "sauvegarde">("utilisateurs");
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveSettings = () => {
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 1500);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-indigo-400" />
                        Administration Système
                    </h2>
                    <p className="text-muted-foreground mt-1">Gestion des accès, des rôles et politiques de sauvegarde OHADA.</p>
                </div>

                <div className="flex flex-wrap gap-2 transition-all">
                    <button
                        onClick={handleSaveSettings}
                        disabled={isSaving}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                        {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSaving ? "Sauvegarde..." : "Enregistrer les modifications"}
                    </button>
                    <div className="flex gap-2 bg-slate-900/50 p-1 rounded-xl border border-slate-700/50">
                        {["utilisateurs", "roles", "securite", "sauvegarde"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all",
                                    activeTab === tab ? "bg-slate-800 text-white shadow-inner" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {activeTab === "utilisateurs" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-foreground text-lg flex items-center gap-2">
                            <Users className="w-5 h-5 text-indigo-400" />
                            Comptes Collaborateurs
                        </h3>
                        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium flex items-center gap-2 transition-all">
                            <UserPlus className="w-4 h-4" /> Inviter un membre
                        </button>
                    </div>

                    <div className="glass-card rounded-2xl border border-border/50 overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-background/50 text-muted-foreground font-medium border-b border-border/50">
                                <tr>
                                    <th className="px-6 py-4">Utilisateur</th>
                                    <th className="px-6 py-4">Rôle</th>
                                    <th className="px-6 py-4">Dernière Connexion</th>
                                    <th className="px-6 py-4">Statut</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {MOCK_USERS.map((user) => (
                                    <tr key={user.id} className="hover:bg-muted/30 group transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-indigo-400 border border-border">
                                                    {user.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground">{user.name}</p>
                                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-foreground bg-muted/50 px-3 py-1 rounded-full text-xs border border-border">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground text-xs">
                                            {user.lastLogin}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                <span className="text-emerald-500 font-medium">Actif</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors">
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

            {activeTab === "roles" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-foreground text-lg flex items-center gap-2">
                            <Lock className="w-5 h-5 text-rose-400" />
                            Structure des Droits & Permissions
                        </h3>
                        <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 text-xs font-bold flex items-center gap-2 transition-all">
                            <Plus className="w-3 h-3" /> Créer un rôle
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ROLES.map((role) => (
                            <div key={role.id} className="glass-card p-6 rounded-2xl border border-border/50 hover:border-indigo-500/50 transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className={cn("font-bold uppercase tracking-widest text-xs", role.color)}>{role.name}</h4>
                                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <Settings className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed mb-6 italic">"{role.description}"</p>
                                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-indigo-400" />
                                        <span className="text-[10px] font-bold text-foreground">{role.permissionsCount} permissions</span>
                                    </div>
                                    <button className="text-[10px] text-indigo-400 font-bold uppercase hover:underline">Editer</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === "securite" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="glass-card rounded-2xl p-6 border border-border/50 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                                <Lock className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-foreground">Sécurité de Connexion</h3>
                                <p className="text-xs text-muted-foreground">Protection des comptes et authentification forte.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <SecurityToggle label="Double Authentification (2FA)" status="Obligatoire" enabled={true} />
                            <SecurityToggle label="Expiration des Sessions (8h)" status="Actif" enabled={true} />
                            <SecurityToggle label="Restriction par IP (Bureau)" status="Inactif" enabled={false} />

                            <button className="w-full py-3 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-xs font-bold border border-border flex items-center justify-center gap-2">
                                <Key className="w-4 h-4" /> Configurer les clés de sécurité
                            </button>
                        </div>
                    </div>

                    <div className="glass-card rounded-2xl p-6 border border-border/50 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400">
                                <ShieldAlert className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-foreground">Politique de Mots de Passe</h3>
                                <p className="text-xs text-muted-foreground">Exigences de complexité et de rotation.</p>
                            </div>
                        </div>

                        <div className="space-y-4 text-xs">
                            <div className="flex justify-between items-center p-3 bg-muted/40 rounded-xl border border-border">
                                <span className="text-muted-foreground">Longueur minimum</span>
                                <span className="font-bold text-foreground">12 caractères</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-muted/40 rounded-xl border border-border">
                                <span className="text-muted-foreground">Rotation obligatoire</span>
                                <span className="font-bold text-foreground">90 jours</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "sauvegarde" && <SauvegardeSection handleSaveSettings={handleSaveSettings} />}
        </div>
    );
}

function SecurityToggle({ label, status, enabled }: { label: string, status: string, enabled: boolean }) {
    return (
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border hover:border-border/80 transition-all group">
            <div className="flex flex-col gap-0.5">
                <span className="text-sm text-foreground group-hover:text-primary transition-colors">{label}</span>
                <span className={cn("text-[10px] font-bold italic", enabled ? "text-emerald-500" : "text-muted-foreground")}>{status}</span>
            </div>
            <div className={cn(
                "w-10 h-5 rounded-full relative transition-colors cursor-pointer",
                enabled ? "bg-emerald-600" : "bg-muted"
            )}>
                <div className={cn(
                    "w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-md",
                    enabled ? "left-5.5" : "left-0.5"
                )} />
            </div>
        </div>
    );
}

function SauvegardeSection({ handleSaveSettings }: any) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card rounded-2xl p-6 border border-border/50">
                        <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                            <Cloud className="w-5 h-5 text-indigo-400" />
                            Configuration Cloud & Réplication
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-muted/50 rounded-2xl border border-border flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="shink-0 w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                                        <Database className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-foreground">Amazon S3 Architecture</p>
                                        <p className="text-xs text-muted-foreground">Stockage immuable (WORM) activé</p>
                                    </div>
                                </div>
                                <span className="text-[10px] px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full font-black border border-emerald-500/20">CONNECTED</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <StatMiniCard label="Fréquence" value="Chaque heure" icon={RefreshCw} />
                                <StatMiniCard label="Rétention" value="10 Ans (OHADA)" icon={Calendar} />
                                <StatMiniCard label="Dernier point" value="Il y a 14 min" icon={Globe} />
                                <StatMiniCard label="Taille totale" value="1.42 TB" icon={Settings} />
                            </div>
                        </div>
                    </div>

                    <div className="glass-card rounded-2xl p-6 border border-border/50 space-y-4">
                        <h4 className="font-bold text-foreground text-sm">Actions de Maintenance</h4>
                        <div className="flex flex-wrap gap-3">
                            <button className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-xs font-bold border border-border flex items-center gap-2">
                                <Download className="w-4 h-4" /> Export SQL Dump
                            </button>
                            <button className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-xs font-bold border border-border flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Rapport de Conformité
                            </button>
                            <button
                                onClick={handleSaveSettings}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" /> Déclencher Sauvegarde Immédiate
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass-card rounded-2xl p-6 border border-border/50 bg-emerald-500/5 shadow-xl">
                        <div className="flex items-center gap-2 mb-4">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            <h4 className="font-bold text-foreground text-sm">Santé des Données</h4>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed italic mb-6">
                            "Toutes les bases de données sont synchronisées. Aucun écart détecté sur les 500 derniers blocs."
                        </p>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div className="h-full w-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        </div>
                        <p className="text-[10px] text-emerald-500 font-bold mt-2 uppercase tracking-tighter">Intégrité : 100%</p>
                    </div>

                    <div className="glass-card rounded-2xl p-6 border border-border/50 space-y-4">
                        <h4 className="font-bold text-foreground text-sm">Alertes de Sauvegarde</h4>
                        <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20">
                            <p className="text-[10px] text-rose-500 font-bold uppercase mb-1 text-xs">Attention</p>
                            <p className="text-xs text-rose-500">L'archivage physique Y-10 arrive à saturation.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatMiniCard({ label, value, icon: Icon }: any) {
    return (
        <div className="p-3 bg-muted/40 rounded-xl border border-border/50 flex flex-col gap-1">
            <div className="flex items-center gap-2">
                <Icon className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{label}</span>
            </div>
            <span className="text-xs text-foreground font-bold">{value}</span>
        </div>
    );
}
