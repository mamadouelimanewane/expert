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
import { calculateSenegalPayroll } from "@/lib/payroll/engines/senegal";

// ─────────────────────────────────────────────────────────────────────────────
// Simulateur Rémunération vs Dividendes (Sénégal).
//
// Réutilise le moteur de paie sénégalais déjà réel et testé
// (src/lib/payroll/engines/senegal.ts, barème IR/IPRES/CSS/TRIMF, CGI) pour
// la voie « rémunération ». La voie « dividendes » applique les deux taux
// vérifiés en août 2026 : IS de droit commun 30 % (porté de 25 % à 30 %,
// cf. Sénégal Services / EuroCham Sénégal) et retenue à la source sur
// dividendes distribués de 10 % (CGI). Ce sont des taux d'assiette réels,
// pas des données inventées, mais un dirigeant réel doit vérifier le régime
// exact applicable (taux réduit 15 % export/ZES, conventions fiscales...)
// auprès d'un professionnel avant toute décision — comme le reste des
// simulateurs indicatifs de l'application.
const TAUX_IS_SENEGAL = 0.30;
const TAUX_RETENUE_DIVIDENDES = 0.10;

/** Recherche par dichotomie le salaire de base MENSUEL dont le coût total
 * employeur mensuel (brut + charges patronales) égale le montant annuel
 * disponible divisé par douze — le moteur de paie sénégalais raisonne en
 * bulletin mensuel (les barèmes annuels y sont déjà annualisés en interne). */
function resoudreSalaireBrutMensuel(montantAnnuelDisponible: number, maritalStatus: string, childrenCount: number, isCadre: boolean) {
    const cibleMensuelle = montantAnnuelDisponible / 12;
    let bas = 0;
    let haut = cibleMensuelle;
    for (let i = 0; i < 60; i++) {
        const mid = (bas + haut) / 2;
        const r = calculateSenegalPayroll({
            baseSalary: mid,
            absencesDays: 0,
            overtimeHours: 0,
            bonuses: 0,
            transportAllowance: 0,
            maritalStatus,
            childrenCount,
            isCadre,
        });
        const coutTotalMensuel = r.grossSalary + r.employerContributions;
        if (coutTotalMensuel > cibleMensuelle) haut = mid;
        else bas = mid;
    }
    return bas;
}

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

    // Simulateur rémunération vs dividendes.
    const [montantDisponible, setMontantDisponible] = useState("6000000");
    const [maritalStatus, setMaritalStatus] = useState("MARIE");
    const [childrenCount, setChildrenCount] = useState("2");
    const [isCadreDirigeant, setIsCadreDirigeant] = useState(true);

    const montant = parseFloat(montantDisponible) || 0;
    const salaireBrutMensuel = montant > 0 ? resoudreSalaireBrutMensuel(montant, maritalStatus, parseInt(childrenCount) || 0, isCadreDirigeant) : 0;
    const resultatSalaire = montant > 0
        ? calculateSenegalPayroll({
              baseSalary: salaireBrutMensuel,
              absencesDays: 0,
              overtimeHours: 0,
              bonuses: 0,
              transportAllowance: 0,
              maritalStatus,
              childrenCount: parseInt(childrenCount) || 0,
              isCadre: isCadreDirigeant,
          })
        : null;

    const isDividendes = montant * TAUX_IS_SENEGAL;
    const distribuable = montant - isDividendes;
    const retenueDividendes = distribuable * TAUX_RETENUE_DIVIDENDES;
    const netDividendes = distribuable - retenueDividendes;

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

                    {optimizationMode === "rem" ? (
                        <div className="glass-card p-4 sm:p-6 lg:p-10 rounded-[40px] border border-white/5 bg-slate-950/50 space-y-8">
                            <div>
                                <h3 className="text-xl font-black text-white mb-1">Simulateur Rémunération vs Dividendes (Sénégal)</h3>
                                <p className="text-xs text-slate-500">
                                    IS 30 % et retenue à la source de 10 % sur dividendes ; barème IR, IPRES, CSS, TRIMF du moteur de paie sénégalais du cabinet.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Montant disponible pour l&apos;entreprise (FCFA/an)</label>
                                    <input
                                        type="number"
                                        value={montantDisponible}
                                        onChange={(e) => setMontantDisponible(e.target.value)}
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Situation du dirigeant</label>
                                    <div className="flex gap-2">
                                        <select value={maritalStatus} onChange={(e) => setMaritalStatus(e.target.value)} className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-3 text-sm text-white">
                                            <option value="CELIBATAIRE">Célibataire</option>
                                            <option value="MARIE">Marié(e)</option>
                                        </select>
                                        <input
                                            type="number"
                                            min="0"
                                            value={childrenCount}
                                            onChange={(e) => setChildrenCount(e.target.value)}
                                            placeholder="Enfants"
                                            className="w-24 bg-slate-900 border border-white/10 rounded-xl px-3 py-3 text-sm text-white"
                                        />
                                    </div>
                                </div>
                            </div>
                            <label className="flex items-center gap-2 text-xs text-slate-400">
                                <input type="checkbox" checked={isCadreDirigeant} onChange={(e) => setIsCadreDirigeant(e.target.checked)} className="rounded" />
                                Dirigeant cadre (cotise au régime complémentaire IPRES)
                            </label>

                            {montant > 0 && resultatSalaire && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="p-6 bg-slate-900/60 rounded-2xl border border-white/5">
                                        <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-3">Voie Rémunération</p>
                                        <p className="text-xs text-slate-500">Salaire brut mensuel</p>
                                        <p className="text-lg font-bold text-white mb-3">{Math.round(salaireBrutMensuel).toLocaleString("fr-FR")} FCFA</p>
                                        <p className="text-xs text-slate-500">Charges patronales (mensuelles)</p>
                                        <p className="text-sm text-slate-300 mb-3">{resultatSalaire.employerContributions.toLocaleString("fr-FR")} FCFA/mois</p>
                                        <p className="text-xs text-slate-500">Net perçu par le dirigeant</p>
                                        <p className="text-2xl font-black text-emerald-400">{Math.round(resultatSalaire.netSalary * 12).toLocaleString("fr-FR")} FCFA/an</p>
                                    </div>
                                    <div className="p-6 bg-slate-900/60 rounded-2xl border border-white/5">
                                        <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-3">Voie Dividendes</p>
                                        <p className="text-xs text-slate-500">IS (30 %)</p>
                                        <p className="text-lg font-bold text-white mb-3">-{Math.round(isDividendes).toLocaleString("fr-FR")} FCFA</p>
                                        <p className="text-xs text-slate-500">Retenue à la source (10 %)</p>
                                        <p className="text-sm text-slate-300 mb-3">-{Math.round(retenueDividendes).toLocaleString("fr-FR")} FCFA</p>
                                        <p className="text-xs text-slate-500">Net perçu par l&apos;associé</p>
                                        <p className="text-2xl font-black text-emerald-400">{Math.round(netDividendes).toLocaleString("fr-FR")} FCFA/an</p>
                                    </div>
                                </div>
                            )}

                            <p className="text-[10px] text-slate-600 leading-relaxed">
                                Estimation indicative à partir des taux 2026 (IS de droit commun, retenue sur dividendes, barème IR/IPRES/CSS/TRIMF) : ne tient pas compte des régimes particuliers
                                (taux IS réduit export/zone économique spéciale, conventions fiscales, autres charges du dirigeant) et ne constitue pas un avis fiscal opposable — à valider par un
                                professionnel habilité avant toute décision.
                            </p>
                        </div>
                    ) : (
                    <div className="glass-card p-4 sm:p-6 lg:p-10 rounded-[40px] border border-white/5 bg-slate-950/50 min-h-[280px] flex flex-col justify-between">
                        <div className="text-center py-10">
                            <Lock className="w-16 h-16 text-amber-500 mx-auto mb-6 opacity-50" />
                            <h3 className="text-2xl font-black text-white mb-4">Montage Holding & SCI</h3>
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
                    )}
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
