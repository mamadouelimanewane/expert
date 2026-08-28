"use client";

import { useEffect, useState } from "react";
import {
    ShieldCheck,
    Lock,
    Server,
    History,
    Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Cette page affirmait des certifications réelles ("ISO 27001 / SecNumCloud",
// "RGPD Afrique / Sénégal — Conformité CDP") sans qu'aucune preuve n'existe
// que le cabinet les détienne — une fausse déclaration de conformité
// similaire à celle retirée de la brochure (ONECCA/OEC). Le journal d'audit
// affichait des entrées entièrement inventées (noms, IP partielles,
// horodatages relatifs figés) présentées comme un flux temps réel, alors
// qu'un vrai service d'audit existe déjà (AuditService / /api/audit-logs,
// utilisé par le tableau de bord). L'alerte "3 comptes clients n'ont pas
// activé la 2FA" et les interrupteurs de sécurité étaient inertes : aucun
// mécanisme de 2FA, de liste blanche IP ou de chiffrement PDF par mot de
// passe n'est implémenté dans l'application.
// ─────────────────────────────────────────────────────────────────────────────

interface LogEntry {
    id: string;
    action: string;
    entity: string;
    details?: string | null;
    createdAt: string;
    user?: { firstName?: string; lastName?: string; role?: string } | null;
}

export default function SecuritySovereigntyPage() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [chargement, setChargement] = useState(true);

    useEffect(() => {
        fetch("/api/audit-logs?limit=10")
            .then((r) => r.json())
            .then((data) => setLogs(data.logs ?? []))
            .catch((e) => console.error("Chargement du journal d'audit :", e))
            .finally(() => setChargement(false));
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Hero Section */}
            <div className="relative p-4 sm:p-8 lg:p-12 rounded-[20px] sm:rounded-[36px] lg:rounded-[48px] border border-white/5 bg-slate-900/40 overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-4 sm:p-8 lg:p-12 opacity-5 pointer-events-none">
                    <ShieldCheck className="w-64 h-64 text-indigo-400" />
                </div>

                <div className="relative z-10 max-w-3xl">
                    <h2 className="page-title">
                        Sécurité & <span className="text-indigo-400">Journal d&apos;audit</span>
                    </h2>
                    <p className="page-subtitle">
                        Traçabilité des actions effectuées dans l&apos;application.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <StatusCard
                            icon={Server}
                            label="Hébergement"
                            title="Base de données MongoDB"
                            desc="Accès aux routes internes protégé par authentification (session staff/admin requise)."
                            color="text-emerald-400"
                        />
                        <StatusCard
                            icon={Lock}
                            label="Transport"
                            title="HTTPS / TLS"
                            desc="Chiffrement en transit standard pour toutes les requêtes."
                            color="text-indigo-400"
                        />
                    </div>

                    <div className="glass-card rounded-[40px] p-4 sm:p-6 lg:p-10 border border-white/5 bg-slate-900/40">
                        <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                            <History className="w-6 h-6 text-indigo-400" />
                            Journal d&apos;Audit
                        </h3>
                        {chargement ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                            </div>
                        ) : logs.length === 0 ? (
                            <p className="text-sm text-slate-500 text-center py-10">Aucune action journalisée pour le moment.</p>
                        ) : (
                            <div className="space-y-4">
                                {logs.map((log) => (
                                    <AuditRow
                                        key={log.id}
                                        action={log.action}
                                        entity={log.entity}
                                        user={log.user ? [log.user.firstName, log.user.lastName].filter(Boolean).join(" ") : "Système"}
                                        time={new Date(log.createdAt).toLocaleString("fr-FR")}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40">
                        <h3 className="text-lg font-black text-white mb-4">Contrôles d&apos;Accès</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Les routes internes sont protégées par une session authentifiée avec contrôle de rôle
                            (staff / admin). L&apos;authentification à deux facteurs et la liste blanche d&apos;IP ne sont
                            pas encore implémentées.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatusCard({ icon: Icon, label, title, desc, color }: any) {
    return (
        <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40 relative overflow-hidden group">
            <div className="p-3 bg-white/5 rounded-2xl w-fit mb-6">
                <Icon className={cn("w-6 h-6", color)} />
            </div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{label}</p>
            <h4 className="text-xl font-black text-white mb-2">{title}</h4>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">{desc}</p>
        </div>
    );
}

function AuditRow({ action, entity, user, time }: { action: string; entity: string; user: string; time: string }) {
    return (
        <div className="flex items-center justify-between p-4 rounded-2xl border border-white/5 hover:bg-white/[0.02] transition-all group">
            <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                <div>
                    <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{action} — {entity}</p>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{user}</p>
                </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-600">{time}</span>
        </div>
    );
}
