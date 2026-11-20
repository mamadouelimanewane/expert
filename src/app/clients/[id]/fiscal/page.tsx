"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import { Save, AlertTriangle, ShieldCheck } from "lucide-react";

type FiscalProfile = {
    country: string; fiscalRegime: string; sector: string | null; subjectToTva: boolean;
    taxProfile?: { taxId?: string; taxOffice?: string; fiscalYearEnd?: string; taxCenter?: string; vatRegistered?: boolean; employer?: boolean; withholdingAgent?: boolean; foreignTransactions?: boolean; activities?: string[]; taxIncentives?: string[]; reviewedAt?: string } | null;
};

export default function ClientFiscalProfilePage() {
    const params = useParams<{ id: string }>();
    const [profile, setProfile] = useState<FiscalProfile | null>(null);
    const [error, setError] = useState("");
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch(`/api/clients/${params.id}/fiscal-profile`).then(async response => {
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Chargement impossible");
            const row = data.profile as FiscalProfile;
            setProfile({ ...row, taxProfile: {
                taxId: "", taxOffice: "", fiscalYearEnd: "12-31", taxCenter: "", vatRegistered: row.subjectToTva,
                employer: false, withholdingAgent: false, foreignTransactions: false, activities: [], taxIncentives: [],
                ...(row.taxProfile ?? {}),
            } });
        }).catch(e => setError(e.message));
    }, [params.id]);

    const save = async (event: FormEvent) => {
        event.preventDefault();
        if (!profile) return;
        setSaving(true); setError(""); setSaved(false);
        try {
            const response = await fetch(`/api/clients/${params.id}/fiscal-profile`, {
                method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ country: profile.country, fiscalRegime: profile.fiscalRegime, sector: profile.sector, subjectToTva: profile.subjectToTva, taxProfile: profile.taxProfile }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Enregistrement impossible");
            setProfile(current => current ? { ...current, ...data.profile } : current);
            setSaved(true);
        } catch (e) { setError(e instanceof Error ? e.message : "Enregistrement impossible"); }
        finally { setSaving(false); }
    };

    const update = (key: string, value: unknown) => setProfile(current => current ? ({ ...current, taxProfile: { ...(current.taxProfile ?? {}), [key]: value } }) : current);
    if (!profile) return <main className="mx-auto max-w-4xl p-8 text-slate-300">{error || "Chargement du profil fiscal…"}</main>;
    const p = profile.taxProfile!;
    const field = (label: string, key: "taxId" | "taxOffice" | "fiscalYearEnd" | "taxCenter", placeholder: string) => <label className="block space-y-2"><span className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</span><input value={p[key] ?? ""} placeholder={placeholder} onChange={e => update(key, e.target.value)} className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white" /></label>;

    return <main className="mx-auto max-w-4xl space-y-6 p-8">
        <header><h1 className="page-title">Profil fiscal du client</h1><p className="page-subtitle">Paramètres d’assujettissement utilisés pour préparer le calendrier et les travaux du cabinet.</p></header>
        <div className="flex gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-100"><AlertTriangle className="h-5 w-5 shrink-0" /><p>Ce profil ne détermine pas seul la conformité. Vérifiez les règles du pays, le régime, les seuils et la période fiscale avant chaque déclaration.</p></div>
        <form onSubmit={save} className="space-y-6 rounded-3xl border border-white/10 bg-slate-900/40 p-6">
            <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2"><span className="text-xs font-bold uppercase tracking-wide text-slate-400">Pays</span><select value={profile.country} onChange={e => setProfile({ ...profile, country: e.target.value })} className="w-full rounded-xl bg-slate-900 px-4 py-3 text-white">{[["SN","Sénégal"],["CI","Côte d’Ivoire"],["CM","Cameroun"],["BJ","Bénin"],["BF","Burkina Faso"],["ML","Mali"],["NE","Niger"],["TG","Togo"],["GA","Gabon"],["TD","Tchad"],["CF","Centrafrique"],["CG","Congo"],["CD","RD Congo"],["GQ","Guinée équatoriale"],["GW","Guinée-Bissau"]].map(([code,name]) => <option key={code} value={code}>{name}</option>)}</select></label>
                <label className="space-y-2"><span className="text-xs font-bold uppercase tracking-wide text-slate-400">Régime</span><select value={profile.fiscalRegime} onChange={e => setProfile({ ...profile, fiscalRegime: e.target.value })} className="w-full rounded-xl bg-slate-900 px-4 py-3 text-white">{[["REEL_NORMAL","Réel normal"],["REEL_SIMPLIFIE","Réel simplifié"],["CME","Contribution microentreprise"],["MICRO_ENTREPRISE","Microentreprise"]].map(([code,name]) => <option key={code} value={code}>{name}</option>)}</select></label>
                {field("Identifiant fiscal", "taxId", "NINEA / IFU / NIF")}
                {field("Centre ou service des impôts", "taxOffice", "Centre compétent")}
                {field("Clôture de l’exercice (MM-JJ)", "fiscalYearEnd", "12-31")}
                {field("Centre fiscal (si applicable)", "taxCenter", "DGE / DME / CDI / DGI")}
                <label className="space-y-2"><span className="text-xs font-bold uppercase tracking-wide text-slate-400">Secteur d’activité</span><input value={profile.sector ?? ""} onChange={e => setProfile({ ...profile, sector: e.target.value })} className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white" /></label>
            </div>
            <div className="grid gap-3 md:grid-cols-2">{[["vatRegistered","Assujetti à la TVA"],["employer","Employeur / paie"],["withholdingAgent","Collecteur de retenues à la source"],["foreignTransactions","Opérations transfrontalières ou non-résidentes"]].map(([key,label]) => <label key={key} className="flex items-center gap-3 rounded-xl border border-white/5 bg-black/10 p-4 text-sm text-slate-200"><input type="checkbox" checked={Boolean(p[key as keyof typeof p])} onChange={e => update(key, e.target.checked)} />{label}</label>)}</div>
            <label className="block space-y-2"><span className="text-xs font-bold uppercase tracking-wide text-slate-400">Activités déclarées (une par ligne)</span><textarea rows={3} value={(p.activities ?? []).join("\n")} onChange={e => update("activities", e.target.value.split("\n").map(v => v.trim()).filter(Boolean))} className="w-full rounded-xl bg-slate-900 p-4 text-white" /></label>
            <label className="block space-y-2"><span className="text-xs font-bold uppercase tracking-wide text-slate-400">Agréments et incitations (une par ligne)</span><textarea rows={2} value={(p.taxIncentives ?? []).join("\n")} onChange={e => update("taxIncentives", e.target.value.split("\n").map(v => v.trim()).filter(Boolean))} className="w-full rounded-xl bg-slate-900 p-4 text-white" /></label>
            <div className="flex items-center justify-between"><p className="text-xs text-slate-500">Dernière revue : {p.reviewedAt ? new Date(p.reviewedAt).toLocaleDateString("fr-FR") : "jamais"}</p><button disabled={saving} className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white disabled:opacity-50"><Save className="h-4 w-4" />{saving ? "Enregistrement…" : "Enregistrer le profil"}</button></div>
            {saved && <p className="flex items-center gap-2 text-sm text-emerald-300"><ShieldCheck className="h-4 w-4" />Profil fiscal enregistré.</p>}{error && <p className="text-sm text-rose-300">{error}</p>}
        </form>
    </main>;
}
