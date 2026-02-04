"use client";

import {
    ShieldCheck,
    Lock,
    Globe,
    Server,
    Key,
    UserCheck,
    FileLock2,
    Database,
    Cpu,
    CheckCircle2,
    ShieldAlert,
    History,
    RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SecuritySovereigntyPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Hero Section */}
            <div className="relative p-12 rounded-[48px] border border-white/5 bg-slate-900/40 overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <ShieldCheck className="w-64 h-64 text-indigo-400" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-indigo-500/20">
                                Certifié Souverain
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tight leading-tight">
                            Audit, Sécurité & <span className="text-indigo-400">Souveraineté des Données</span>
                        </h2>
                        <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed">
                            Nous garantissons que vos données et celles de vos clients sont hébergées dans un environnement hautement sécurisé, 100% conforme aux réglementations locales et internationales.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Infrastructure Status */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <StatusCard
                            icon={Server}
                            label="Localisation Cloud"
                            title="Zone OHADA / Afrique"
                            desc="Données hébergées sur serveurs à haute disponibilité (Redondance 3-2-1)."
                            color="text-emerald-400"
                        />
                        <StatusCard
                            icon={Lock}
                            label="Chiffrement"
                            title="AES-256 & TLS 1.3"
                            desc="Toutes les données sont chiffrées au repos et en transit avec des clés propriétaires."
                            color="text-indigo-400"
                        />
                    </div>

                    <div className="glass-card rounded-[40px] p-10 border border-white/5 bg-slate-900/40">
                        <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                            <History className="w-6 h-6 text-indigo-400" />
                            Journal d'Audit & Traçabilité (Temps Réel)
                        </h3>
                        <div className="space-y-6">
                            <AuditRow
                                action="Connexion Expert"
                                user="Moussa Sarr"
                                ip="197.234.xx.xx"
                                time="Il y a 2 min"
                                status="success"
                            />
                            <AuditRow
                                action="Export FEC Généré"
                                user="Aissatou Diop"
                                ip="41.82.xx.xx"
                                time="Il y a 45 min"
                                status="info"
                            />
                            <AuditRow
                                action="Modification Statuts SCI"
                                user="Auto-IA Verification"
                                ip="Cloud-Sec"
                                time="Il y a 2h"
                                status="success"
                            />
                            <AuditRow
                                action="Tentative de connexion échouée"
                                user="admin_test"
                                ip="185.12.xx.xx (HK)"
                                time="Il y a 6h"
                                status="error"
                            />
                        </div>
                        <button className="mt-8 w-full py-4 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all">
                            Voir le registre complet d'audit
                        </button>
                    </div>
                </div>

                {/* Compliance Sidebar */}
                <div className="space-y-8">
                    <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-gradient-to-br from-indigo-600 to-violet-700 shadow-xl shadow-indigo-900/30 text-white">
                        <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                            <ShieldCheck className="w-6 h-6 text-white" />
                            Certifications
                        </h3>
                        <div className="space-y-5">
                            <CertificationItem title="RGPD Afrique / Sénégal" desc="Conformité CDP" />
                            <CertificationItem title="ISO 27001 / SecNumCloud" desc="Standards de Sécurité" />
                            <CertificationItem title="Valeur Probante" desc="Archivage Légal" />
                        </div>
                    </div>

                    <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40">
                        <h3 className="text-lg font-black text-white mb-6">Contrôles d'Accès</h3>
                        <div className="space-y-4">
                            <ToggleBox label="Double Authentification (2FA)" active={true} />
                            <ToggleBox label="White-listing IP Cabinet" active={false} />
                            <ToggleBox label="Chiffrement des PDF par mot de passe" active={true} />
                        </div>
                    </div>

                    <div className="p-8 rounded-[40px] bg-rose-500/5 border border-rose-500/10">
                        <div className="flex items-center gap-3 text-rose-400 mb-4">
                            <ShieldAlert className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Alerte Sécurité</span>
                        </div>
                        <p className="text-xs font-bold text-slate-300 leading-relaxed">
                            3 comptes clients n'ont pas encore activé la 2FA. Nous recommandons de forcer l'activation pour la prochaine clôture fiscale.
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

function AuditRow({ action, user, ip, time, status }: any) {
    return (
        <div className="flex items-center justify-between p-4 rounded-2xl border border-white/5 hover:bg-white/[0.02] transition-all group">
            <div className="flex items-center gap-4">
                <div className={cn(
                    "w-2 h-2 rounded-full",
                    status === "success" ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" :
                        status === "error" ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" :
                            "bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                )} />
                <div>
                    <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{action}</p>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{user} • {ip}</p>
                </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-600">{time}</span>
        </div>
    );
}

function CertificationItem({ title, desc }: any) {
    return (
        <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
            <div>
                <p className="text-xs font-black uppercase tracking-widest">{title}</p>
                <p className="text-[10px] text-indigo-200 font-medium">{desc}</p>
            </div>
        </div>
    );
}

function ToggleBox({ label, active }: { label: string; active: boolean }) {
    return (
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
            <span className="text-xs font-bold text-slate-300">{label}</span>
            <div className={cn(
                "w-10 h-5 rounded-full relative transition-all cursor-pointer",
                active ? "bg-indigo-600" : "bg-slate-700"
            )}>
                <div className={cn(
                    "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                    active ? "left-6" : "left-1"
                )} />
            </div>
        </div>
    );
}
