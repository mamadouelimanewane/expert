"use client";

import { useState, useEffect } from "react";
import {
    Users,
    ShieldCheck,
    Lock,
    UserPlus,
    Settings,
    ShieldAlert,
    Plus,
    AlertTriangle,
    Loader2
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
    color: string;
}

function relativeDateFr(date: string | null): string {
    if (!date) return "Jamais connecté";
    const diffMs = Date.now() - new Date(date).getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (days <= 0) return "Aujourd'hui";
    if (days === 1) return "Hier";
    if (days < 30) return `Il y a ${days} jours`;
    return new Date(date).toLocaleDateString("fr-FR");
}

const ROLE_LABELS: Record<string, string> = {
    ADMIN: "Administrateur",
    EXPERT: "Expert-Comptable",
    COLLABORATOR: "Collaborateur",
    CLIENT: "Client",
    ASSISTANT: "Assistant",
};

// Les compteurs "N permissions" étaient des chiffres fixes sans rapport avec
// un vrai système de permissions granulaires — l'application distingue en
// réalité 5 rôles Prisma (requireStaff/requireAdmin), pas un modèle de
// permissions par action. Retirés plutôt qu'inventés.
const ROLES: RoleDefinition[] = [
    { id: "1", name: "Expert-Comptable", description: "Accès total, signature légale et validation finale.", color: "text-indigo-400" },
    { id: "2", name: "Administrateur IT", description: "Gestion des utilisateurs, sécurité et sauvegardes.", color: "text-rose-400" },
    { id: "3", name: "Collaborateur Senior", description: "Gestion complète des dossiers clients et révision.", color: "text-emerald-400" },
    { id: "4", name: "Collaborateur Junior", description: "Saisie comptable et gestion documentaire de base.", color: "text-amber-400" },
];

export default function UsersSettingsPage() {
    const [activeTab, setActiveTab] = useState<"utilisateurs" | "roles" | "securite" | "sauvegarde">("utilisateurs");
    const [users, setUsers] = useState<UserAccount[]>([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [usersError, setUsersError] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/admin/users")
            .then(async (r) => {
                const data = await r.json();
                if (!r.ok) {
                    setUsersError(data.error || "Erreur lors du chargement des utilisateurs");
                    return;
                }
                setUsers((data.users || []).map((u: any) => ({
                    id: u.id,
                    name: `${u.firstName} ${u.lastName}`.trim(),
                    email: u.email,
                    role: ROLE_LABELS[u.role] || u.role,
                    status: u.isActive ? "actif" : "suspendu",
                    lastLogin: relativeDateFr(u.lastLoginAt),
                })));
            })
            .catch(() => setUsersError("Erreur réseau lors du chargement des utilisateurs"))
            .finally(() => setUsersLoading(false));
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-indigo-400" />
                        Administration Système
                    </h2>
                    <p className="text-muted-foreground mt-1">Gestion des accès, des rôles et politiques de sauvegarde OHADA.</p>
                </div>

                <div className="flex flex-wrap gap-2 transition-all">
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
                        <div className="overflow-x-auto">
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
                                {usersLoading ? (
                                    <tr><td colSpan={5} className="px-6 py-10 text-center text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Chargement des comptes...</td></tr>
                                ) : usersError ? (
                                    <tr><td colSpan={5} className="px-6 py-10 text-center text-rose-400 text-xs">{usersError}</td></tr>
                                ) : users.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-10 text-center text-muted-foreground text-xs">Aucun compte collaborateur trouvé.</td></tr>
                                ) : users.map((user) => (
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
                                                <div className={cn("w-2 h-2 rounded-full", user.status === "actif" ? "bg-emerald-500" : "bg-slate-500")} />
                                                <span className={cn("font-medium", user.status === "actif" ? "text-emerald-500" : "text-muted-foreground")}>
                                                    {user.status === "actif" ? "Actif" : "Suspendu"}
                                                </span>
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
                        </table></div>
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
                        <button disabled title="Non implémenté : les rôles sont fixés par le code (voir enum Role)" className="px-4 py-2 bg-slate-800/50 text-slate-500 rounded-lg border border-slate-700 text-xs font-bold flex items-center gap-2 cursor-not-allowed">
                            <Plus className="w-3 h-3" /> Créer un rôle (non disponible)
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
                                <p className="text-xs text-muted-foreground leading-relaxed italic">"{role.description}"</p>
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
                            <SecurityToggle label="Double Authentification (2FA)" status="Non implémenté" enabled={false} />
                            <SecurityToggle label="Expiration des Sessions" status="Session NextAuth standard" enabled={false} />
                            <SecurityToggle label="Restriction par IP (Bureau)" status="Non implémenté" enabled={false} />

                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Les routes internes sont protégées par une session authentifiée avec contrôle de rôle (staff / admin). L&apos;authentification à deux facteurs et la liste blanche d&apos;IP ne sont pas encore implémentées.
                            </p>
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

                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Aucune politique de complexité ou de rotation n&apos;est appliquée par l&apos;application : la création de compte requiert un mot de passe, mais aucune longueur minimale ni expiration automatique ne sont configurées à ce jour.
                        </p>
                    </div>
                </div>
            )}

            {activeTab === "sauvegarde" && <SauvegardeSection />}
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

function SauvegardeSection() {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="glass-card rounded-2xl p-6 border border-amber-500/20 bg-amber-500/5">
                <div className="flex items-start gap-4">
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                        <AlertTriangle className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-bold text-foreground">Sauvegarde cloud non configurée</h3>
                            <span className="text-[10px] px-2 py-1 bg-slate-500/10 text-slate-400 rounded-full font-black border border-slate-500/20">NON CONNECTÉ</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                            Aucun fournisseur de stockage cloud immuable (Amazon S3 WORM ou équivalent) n'est connecté à Cabinet 360. La fréquence de sauvegarde, la rétention, la taille des archives et l'horodatage du dernier point de sauvegarde ne peuvent pas être affichés tant que cette intégration n'est pas mise en place — configurez les identifiants du fournisseur choisi pour l'activer.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
