"use client";

import { useState, useEffect } from "react";
import {
    Gavel,
    Scale,
    FileSearch,
    Plus,
    Search,
    Clock,
    AlertTriangle,
    CheckCircle2,
    MessageSquare,
    ShieldCheck,
    History,
    Download,
    Terminal,
    ArrowRight,
    UserCheck,
    Briefcase,
    Globe,
    FileText,
    Zap,
    Scale as ScaleIcon,
    Fingerprint,
    SearchCode,
    Cpu,
    X,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface JudicialCase {
    id: string;
    caseNumber: string;
    court: string;
    judge: string | null;
    parties: string;
    natureOfDispute: string | null;
    deadline: string | null;
    status: "EN_COURS" | "EN_ATTENTE" | "CLOTURE";
    notes: string | null;
    client: { id: string; companyName: string | null; firstName: string | null; lastName: string | null } | null;
    expert: { id: string; firstName: string; lastName: string } | null;
    createdAt: string;
}

const STATUS_LABEL: Record<string, string> = {
    EN_ATTENTE: "En attente",
    EN_COURS: "En cours",
    CLOTURE: "Clôturé",
};

export default function NexusJudicialCommandPage() {
    const [cases, setCases] = useState<JudicialCase[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCase, setSelectedCase] = useState<JudicialCase | null>(null);
    const [showNewModal, setShowNewModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ caseNumber: "", court: "", judge: "", parties: "", natureOfDispute: "", deadline: "", clientId: "", notes: "" });

    const loadCases = () => {
        fetch("/api/judicial-cases")
            .then(r => r.json())
            .then(d => {
                const list: JudicialCase[] = d.cases || [];
                setCases(list);
                setSelectedCase(prev => prev ? (list.find(c => c.id === prev.id) || list[0] || null) : (list[0] || null));
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadCases();
        fetch("/api/clients").then(r => r.json()).then(d => setClients(d.clients || []));
    }, []);

    const handleCreate = async () => {
        if (!form.caseNumber || !form.court || !form.parties) return;
        setSaving(true);
        try {
            await fetch("/api/judicial-cases", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            setShowNewModal(false);
            setForm({ caseNumber: "", court: "", judge: "", parties: "", natureOfDispute: "", deadline: "", clientId: "", notes: "" });
            loadCases();
        } finally {
            setSaving(false);
        }
    };

    const updateStatus = async (status: string) => {
        if (!selectedCase) return;
        await fetch("/api/judicial-cases", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: selectedCase.id, status }),
        });
        loadCases();
    };

    const steps = [
        { label: "Désignation", desc: "Ordonnance & Serment" },
        { label: "Instruction", desc: "Réquisition & Dires" },
        { label: "Expertise", desc: "Analyse & Audition" },
        { label: "Dépôt", desc: "Clôture du rapport" }
    ];

    // Étape déduite honnêtement du statut réel (3 statuts en base) — pas de progression fabriquée
    const currentStep = selectedCase ? (
        selectedCase.status === "EN_ATTENTE" ? 0 :
            selectedCase.status === "EN_COURS" ? 2 : 3
    ) : 0;

    const urgentCount = cases.filter(c => c.deadline && new Date(c.deadline).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000 && c.status !== "CLOTURE").length;

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-1000">
            {/* Elite Header */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 p-4 sm:p-6 lg:p-10 rounded-[20px] sm:rounded-[36px] lg:rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                    <Gavel className="w-64 h-64 text-amber-400" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-amber-500/20">
                                NEXUS Premium
                            </span>
                            <span className="px-3 py-1 bg-slate-500/10 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-slate-500/20">
                                Judicial Expertise & Arb.
                            </span>
                            {urgentCount > 0 && (
                                <span className="px-3 py-1 bg-rose-500/10 text-rose-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-rose-500/20">
                                    {urgentCount} Délai(s) sous 30j
                                </span>
                            )}
                        </div>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight uppercase">
                            Nexus <span className="text-amber-400">Judicial Command</span>
                        </h2>
                        <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed max-w-2xl">
                            Gestion centralisée des missions d'expertise judiciaire OHADA. Suivi des affaires, respect du contradictoire et rédaction assistée.
                        </p>
                    </div>

                    <button onClick={() => setShowNewModal(true)} className="px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-amber-600/30 active:scale-95">
                        <Plus className="w-5 h-5" /> Enregistrer une Ordonnance
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="h-[400px] flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                </div>
            ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar: Case Portfolio */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="flex justify-between items-center px-4">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Portefeuille Affaires ({cases.length})</h3>
                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-500">
                            <Search className="w-4 h-4" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {cases.map(c => (
                            <div
                                key={c.id}
                                onClick={() => setSelectedCase(c)}
                                className={cn(
                                    "glass-card rounded-[32px] border p-6 cursor-pointer transition-all group",
                                    selectedCase?.id === c.id
                                        ? "bg-amber-500/10 border-amber-500/30 shadow-2xl shadow-amber-900/10 translate-x-1"
                                        : "bg-slate-900/40 border-white/5 hover:border-amber-500/20"
                                )}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                                        {c.caseNumber}
                                    </span>
                                    {c.deadline && new Date(c.deadline).getTime() - Date.now() < 15 * 24 * 60 * 60 * 1000 && c.status !== "CLOTURE" && (
                                        <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                                    )}
                                </div>
                                <h4 className="text-lg font-black text-white mb-2 leading-tight group-hover:text-amber-400 transition-colors">
                                    {c.parties}
                                </h4>
                                <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                    <Globe className="w-3 h-3" /> {c.court}
                                </div>

                                <div className="mt-6 flex items-center justify-between">
                                    <span className="text-[10px] font-black text-white uppercase">{STATUS_LABEL[c.status]}</span>
                                </div>
                            </div>
                        ))}
                        {cases.length === 0 && (
                            <div className="glass-card rounded-[32px] border border-white/5 bg-slate-900/40 p-8 text-center">
                                <p className="text-sm text-slate-500">Aucune affaire judiciaire enregistrée. Créez-en une avec « Enregistrer une Ordonnance ».</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Dashboard */}
                <div className="lg:col-span-8 space-y-8">
                    {selectedCase ? (
                        <>
                            {/* Upper Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="glass-card p-6 rounded-[32px] bg-slate-900/40 border border-white/5">
                                    <div className="flex justify-between items-center mb-4">
                                        <ScaleIcon className="w-6 h-6 text-amber-400" />
                                        <span className="text-[9px] text-emerald-400 font-black uppercase">Juge en Charge</span>
                                    </div>
                                    <div className="text-lg font-black text-white">{selectedCase.judge || "Non renseigné"}</div>
                                    <div className="text-[10px] text-slate-500 font-black uppercase mt-1">Titulaire du Siège</div>
                                </div>
                                <div className="glass-card p-6 rounded-[32px] bg-slate-900/40 border border-white/5">
                                    <div className="flex justify-between items-center mb-4">
                                        <Clock className="w-6 h-6 text-rose-500" />
                                        <span className="text-[9px] text-rose-500 font-black uppercase">Délai Légal</span>
                                    </div>
                                    <div className="text-lg font-black text-white">{selectedCase.deadline ? new Date(selectedCase.deadline).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "Non fixé"}</div>
                                    {selectedCase.deadline && (
                                        <div className="text-[10px] text-rose-400/60 font-black uppercase mt-1 italic">
                                            {Math.max(0, Math.ceil((new Date(selectedCase.deadline).getTime() - Date.now()) / (24 * 60 * 60 * 1000)))} jour(s) restant(s)
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Case detail */}
                            <div className="glass-card p-6 rounded-[32px] bg-slate-900/40 border border-white/5">
                                <h4 className="text-sm font-black text-white uppercase tracking-widest mb-4">Détails de l'affaire</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                    <div><span className="text-slate-500 uppercase font-bold">Client : </span><span className="text-slate-200">{selectedCase.client ? (selectedCase.client.companyName || `${selectedCase.client.firstName ?? ""} ${selectedCase.client.lastName ?? ""}`.trim()) : "Non lié à un client"}</span></div>
                                    <div><span className="text-slate-500 uppercase font-bold">Expert : </span><span className="text-slate-200">{selectedCase.expert ? `${selectedCase.expert.firstName} ${selectedCase.expert.lastName}` : "—"}</span></div>
                                    <div className="md:col-span-2"><span className="text-slate-500 uppercase font-bold">Nature du litige : </span><span className="text-slate-200">{selectedCase.natureOfDispute || "Non renseignée"}</span></div>
                                    {selectedCase.notes && <div className="md:col-span-2"><span className="text-slate-500 uppercase font-bold">Notes : </span><span className="text-slate-200">{selectedCase.notes}</span></div>}
                                </div>
                            </div>

                            {/* Progress Stepper Elite */}
                            <div className="glass-card p-4 sm:p-6 lg:p-10 rounded-[40px] border border-white/5 bg-slate-900/40">
                                <div className="flex justify-between items-center mb-12">
                                    {steps.map((step, idx) => (
                                        <div key={idx} className="flex flex-col items-center gap-3 relative flex-1">
                                            <div className={cn(
                                                "w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black z-10 border-2 transition-all",
                                                idx < currentStep ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" :
                                                    idx === currentStep ? "bg-amber-600 border-amber-600 text-white shadow-xl shadow-amber-600/30 scale-110" :
                                                        "bg-slate-900 border-white/10 text-slate-600"
                                            )}>
                                                {idx < currentStep ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                                            </div>
                                            <div className="text-center">
                                                <p className={cn("text-[10px] font-black uppercase tracking-tight", idx === currentStep ? "text-white" : "text-slate-600")}>{step.label}</p>
                                                <p className="text-[9px] text-slate-500 italic mt-0.5">{step.desc}</p>
                                            </div>
                                            {idx < steps.length - 1 && (
                                                <div className={cn(
                                                    "absolute h-[2px] w-[calc(100%-40px)] top-5 left-[calc(50%+20px)] -z-0",
                                                    idx < currentStep ? "bg-gradient-to-r from-emerald-500 to-amber-600" : "bg-white/5"
                                                )} />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 lg:gap-12 pt-8 border-t border-white/5">
                                    {/* Forensic Tools */}
                                    <div className="space-y-6">
                                        <h4 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                            <SearchCode className="w-4 h-4 text-amber-500" /> Investigation Center
                                        </h4>
                                        <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                                            <p className="text-[11px] text-amber-300">Les outils d'analyse automatisée (flux financiers, facturation, solvabilité) ne sont pas encore connectés à ce module.</p>
                                        </div>
                                    </div>

                                    {/* Contradictoire */}
                                    <div className="space-y-6">
                                        <h4 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4 text-sky-400" /> Respect du Contradictoire
                                        </h4>
                                        <div className="p-5 bg-white/5 border border-white/10 rounded-3xl">
                                            <p className="text-xs text-slate-500 leading-relaxed">Le suivi des dires des conseils n'est pas encore rattaché à ce dossier — aucune donnée disponible pour le moment.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Interactive Action Bar */}
                            <div className="bg-gradient-to-r from-amber-600/20 to-transparent p-8 rounded-[40px] border border-amber-500/20 flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="flex gap-6 items-center">
                                    <div className="w-16 h-16 rounded-[24px] bg-amber-600 flex items-center justify-center shadow-2xl shadow-amber-600/30">
                                        <FileText className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-white uppercase tracking-tight leading-none mb-1">Suivi du Statut</h4>
                                        <p className="text-xs text-slate-500 max-w-sm">
                                            Faites évoluer le statut de l'affaire au fil de l'instruction.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    {selectedCase.status !== "EN_COURS" && (
                                        <button onClick={() => updateStatus("EN_COURS")} className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest border border-white/10 transition-all">
                                            Passer En Cours
                                        </button>
                                    )}
                                    {selectedCase.status !== "CLOTURE" && (
                                        <button onClick={() => updateStatus("CLOTURE")} className="px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-xl shadow-amber-600/25">
                                            Clôturer l'Affaire
                                        </button>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-[350px] sm:h-[450px] lg:h-[600px] glass-card rounded-[20px] sm:rounded-[36px] lg:rounded-[50px] border border-white/5 bg-slate-900/40 flex flex-col items-center justify-center text-center p-20">
                            <ScaleIcon className="w-20 h-20 text-slate-800 mb-6" />
                            <h3 className="text-2xl font-black text-slate-600 uppercase tracking-widest">Nexus Command Center</h3>
                            <p className="text-slate-700 mt-2 max-w-sm">Sélectionnez une affaire judiciaire dans le portfolio pour piloter votre mission d'expertise.</p>
                        </div>
                    )}
                </div>
            </div>
            )}

            {showNewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-white/10 rounded-[32px] p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-white">Nouvelle Ordonnance</h3>
                            <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-white p-2"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input placeholder="N° d'affaire (ex: 142/2026)" value={form.caseNumber} onChange={e => setForm({ ...form, caseNumber: e.target.value })} className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                                <input placeholder="Juge" value={form.judge} onChange={e => setForm({ ...form, judge: e.target.value })} className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                            </div>
                            <input placeholder="Tribunal / Juridiction" value={form.court} onChange={e => setForm({ ...form, court: e.target.value })} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                            <input placeholder="Parties (ex: Société X c/ Société Y)" value={form.parties} onChange={e => setForm({ ...form, parties: e.target.value })} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                            <input placeholder="Nature du litige" value={form.natureOfDispute} onChange={e => setForm({ ...form, natureOfDispute: e.target.value })} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                            <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                            <select value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white">
                                <option value="">Aucun client lié</option>
                                {clients.map((c: any) => <option key={c.id} value={c.id}>{c.companyName || `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim()}</option>)}
                            </select>
                            <textarea placeholder="Notes (optionnel)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                            <button onClick={handleCreate} disabled={saving} className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all">
                                {saving ? "Enregistrement…" : "Enregistrer l'affaire"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
