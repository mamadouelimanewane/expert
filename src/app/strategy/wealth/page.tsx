"use client";

import { useState, useEffect } from "react";
import {
    Gem,
    ShieldCheck,
    PieChart,
    Calculator,
    Lock,
    Users,
    ChevronRight,
    Building2,
    Loader2,
    Plus,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Client { id: string; companyName: string | null; firstName: string | null; lastName: string | null; }
interface Asset { id: string; label: string; type: string; estimatedValue: number; notes: string | null; }

const TYPE_COLOR: Record<string, string> = {
    IMMOBILIER: "text-sky-400",
    PARTS_SOCIALES: "text-amber-400",
    PLACEMENT_FINANCIER: "text-emerald-400",
    VEHICULE: "text-violet-400",
    AUTRE: "text-slate-400",
};
const TYPE_LABEL: Record<string, string> = {
    IMMOBILIER: "Immobilier",
    PARTS_SOCIALES: "Parts Sociales",
    PLACEMENT_FINANCIER: "Placement Financier",
    VEHICULE: "Véhicule",
    AUTRE: "Autre",
};

export default function WealthOptimizerPage() {
    const [optimizationMode, setOptimizationMode] = useState<"rem" | "trans">("rem");
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<string>("");
    const [assets, setAssets] = useState<Asset[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ label: "", type: "AUTRE", estimatedValue: "" });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch("/api/clients").then(r => r.json()).then(d => {
            const list = d.clients ?? [];
            setClients(list);
            if (list.length > 0) setSelectedClientId(list[0].id);
            else setLoading(false);
        });
    }, []);

    const loadAssets = (clientId: string) => {
        setLoading(true);
        fetch(`/api/wealth/assets?clientId=${clientId}`)
            .then(r => r.json())
            .then(d => { setAssets(d.assets ?? []); setTotal(d.total ?? 0); })
            .finally(() => setLoading(false));
    };

    useEffect(() => { if (selectedClientId) loadAssets(selectedClientId); }, [selectedClientId]);

    const handleSubmit = async () => {
        if (!form.label.trim() || !form.estimatedValue) return;
        setSaving(true);
        try {
            const res = await fetch("/api/wealth/assets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clientId: selectedClientId, label: form.label, type: form.type, estimatedValue: Number(form.estimatedValue) }),
            });
            if (res.ok) {
                setShowModal(false);
                setForm({ label: "", type: "AUTRE", estimatedValue: "" });
                loadAssets(selectedClientId);
            }
        } finally {
            setSaving(false);
        }
    };

    const clientName = (c: Client) => c.companyName || `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim();

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-8 space-y-8 animate-in fade-in duration-500">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 py-12 border-b border-white/5 relative overflow-hidden bg-gradient-to-r from-amber-500/5 via-transparent to-transparent rounded-[32px] px-8 border-l-4 border-l-amber-500/50">
                <div className="z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-[10px] font-black tracking-widest uppercase mb-4 border border-amber-500/20">
                        <Gem className="w-3 h-3" /> Stratégie Patrimoniale & Dirigeant
                    </div>
                    <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black text-white tracking-tight">
                        Wealth Optimizer
                    </h1>
                    <p className="text-slate-400 mt-4 max-w-2xl text-lg leading-relaxed">
                        Suivi du patrimoine personnel du dirigeant : immobilier, parts sociales et placements.
                    </p>
                </div>

                <div className="flex flex-col gap-3 z-10">
                    <select
                        value={selectedClientId}
                        onChange={(e) => setSelectedClientId(e.target.value)}
                        className="bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
                    >
                        {clients.map(c => <option key={c.id} value={c.id}>{clientName(c)}</option>)}
                    </select>
                    <button onClick={() => setShowModal(true)} className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-amber-600/30 flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Ajouter un Actif
                    </button>
                </div>
            </div>

            {clients.length === 0 ? (
                <p className="text-center text-slate-500 py-20">Aucun client enregistré.</p>
            ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40 relative overflow-hidden">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-amber-500" /> Répartition Actifs
                        </h3>

                        {loading ? (
                            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-amber-500" /></div>
                        ) : assets.length === 0 ? (
                            <p className="text-xs text-slate-500 text-center py-6">Aucun actif enregistré pour ce client.</p>
                        ) : (
                            <div className="space-y-6">
                                {assets.map((asset) => {
                                    const color = TYPE_COLOR[asset.type] || "text-slate-400";
                                    const pct = total > 0 ? Math.round((asset.estimatedValue / total) * 100) : 0;
                                    return (
                                        <div key={asset.id} className="group cursor-default">
                                            <div className="flex justify-between items-end mb-2">
                                                <div>
                                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{asset.label}</p>
                                                    <p className="text-xl font-black text-white">{asset.estimatedValue.toLocaleString()} <span className="text-[10px] text-slate-500">FCFA</span></p>
                                                </div>
                                                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded bg-white/5", color)}>{TYPE_LABEL[asset.type]}</span>
                                            </div>
                                            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                                <div className={cn("h-full rounded-full transition-all duration-1000", color.replace('text', 'bg'))} style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="mt-8 pt-6 border-t border-white/5">
                            <p className="text-xs text-slate-500 font-bold uppercase mb-1">Total Patrimoine Déclaré</p>
                            <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tabular-nums">{total.toLocaleString()} <span className="text-sm font-medium text-amber-500">FCFA</span></div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-slate-900/50 p-1.5 rounded-2xl border border-white/5 flex gap-2">
                        <button
                            onClick={() => setOptimizationMode("rem")}
                            className={cn("flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2", optimizationMode === "rem" ? "bg-amber-600 text-white shadow-lg" : "text-slate-500 hover:text-white")}
                        >
                            Optimisation Rémunération
                        </button>
                        <button
                            onClick={() => setOptimizationMode("trans")}
                            className={cn("flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2", optimizationMode === "trans" ? "bg-amber-600 text-white shadow-lg" : "text-slate-500 hover:text-white")}
                        >
                            <Building2 className="w-4 h-4" /> Transmission (Holding)
                        </button>
                    </div>

                    <div className="glass-card p-4 sm:p-6 lg:p-10 rounded-[40px] border border-white/5 bg-slate-950/50 min-h-[280px] flex flex-col justify-between">
                        <div className="text-center py-10">
                            <Lock className="w-16 h-16 text-amber-500 mx-auto mb-6 opacity-50" />
                            <h3 className="text-2xl font-black text-white mb-4">
                                {optimizationMode === "rem" ? "Simulateur Rémunération vs Dividendes" : "Montage Holding & SCI"}
                            </h3>
                            <p className="text-slate-400 max-w-md mx-auto mb-2">
                                Ce simulateur d'optimisation fiscale n'est pas encore configuré — il nécessite un paramétrage précis du régime fiscal et social applicable à chaque dirigeant.
                            </p>
                            <p className="text-slate-500 text-xs max-w-md mx-auto">
                                Un conseil personnalisé requiert une analyse par un professionnel habilité.
                            </p>
                        </div>

                        <div className="mt-12 flex items-center justify-between p-6 bg-slate-900/40 rounded-[32px] border border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-amber-500/20 flex items-center justify-center">
                                    <Users className="w-6 h-6 text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">Besoin d'un arbitrage personnalisé ?</p>
                                    <p className="text-xs text-slate-500">Contactez votre consultant en gestion privée.</p>
                                </div>
                            </div>
                            <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                                <ChevronRight className="w-5 h-5 text-amber-500" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-slate-900 border border-white/10 rounded-[32px] p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-white">Ajouter un Actif</h3>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-xl"><X className="w-5 h-5 text-slate-400" /></button>
                        </div>
                        <div className="space-y-4">
                            <input
                                placeholder="Libellé (ex: Villa Almadies)"
                                value={form.label}
                                onChange={(e) => setForm({ ...form, label: e.target.value })}
                                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500"
                            />
                            <select
                                value={form.type}
                                onChange={(e) => setForm({ ...form, type: e.target.value })}
                                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
                            >
                                {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                            <input
                                type="number"
                                placeholder="Valeur estimée (FCFA)"
                                value={form.estimatedValue}
                                onChange={(e) => setForm({ ...form, estimatedValue: e.target.value })}
                                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500"
                            />
                            <button
                                onClick={handleSubmit}
                                disabled={saving || !form.label.trim() || !form.estimatedValue}
                                className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                            >
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enregistrer"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
