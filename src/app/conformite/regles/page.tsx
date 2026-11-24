"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { AlertTriangle, CheckCircle2, FileText, RefreshCw } from "lucide-react";

type Regle = {
    id: string;
    country: string;
    obligationCode: string;
    version: number;
    title: string;
    description: string;
    category: string;
    declarationType: string;
    periodicity: string;
    dueDay: number;
    dueMonth: number | null;
    clientTypes: string[];
    fiscalRegimes: string[];
    sectors: string[];
    requiredTaxProfileFlags: string[];
    applicabilityNotes: string;
    sourceTitle: string;
    sourceUrl: string;
    sourceArticle: string | null;
    sourcePublishedAt: string | null;
    effectiveFrom: string;
    effectiveUntil: string | null;
    status: string;
    reviewComment: string | null;
    createdById: string;
    reviewedById: string | null;
    reviewedAt: string | null;
    createdBy: { id: string; firstName: string; lastName: string };
    reviewedBy: { id: string; firstName: string; lastName: string } | null;
};

const dateDuJour = () => {
    const date = new Date();
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 10);
};
const initialForm = () => ({
    country: "SN", obligationCode: "", title: "", description: "", category: "TVA",
    declarationType: "TVA", periodicity: "MENSUELLE", dueDay: "15", dueMonth: "",
    clientTypes: ["ENTREPRISE"], fiscalRegimes: [] as string[], sectorsText: "", requiredTaxProfileFlags: [] as string[],
    applicabilityNotes: "", sourceTitle: "", sourceUrl: "", sourceArticle: "",
    sourcePublishedAt: "", effectiveFrom: dateDuJour(), effectiveUntil: "",
});

const labelsStatut: Record<string, string> = { DRAFT: "Brouillon · non applicable", VERIFIED: "Validée · applicable dans sa période", RETIRED: "Retirée" };

export default function RegulatoryRulesPage() {
    const [rules, setRules] = useState<Regle[]>([]);
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const { data: session } = useSession();
    const user = session?.user as { id?: string; role?: string } | undefined;
    const canReview = ["ADMIN", "EXPERT"].includes(user?.role ?? "");

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/conformite/regles");
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Chargement du registre impossible.");
            setRules(data.rules ?? []);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Chargement du registre impossible.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { void load(); }, [load]);

    async function createRule(event: FormEvent<HTMLFormElement>) {
        event.preventDefault(); setSaving(true); setError(""); setSuccess("");
        try {
            const { sectorsText, ...formValues } = form;
            const response = await fetch("/api/conformite/regles", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formValues, sectors: sectorsText.split(",").map((item) => item.trim().toUpperCase()).filter(Boolean), dueDay: Number(form.dueDay), dueMonth: form.dueMonth ? Number(form.dueMonth) : null, sourcePublishedAt: form.sourcePublishedAt || null, effectiveUntil: form.effectiveUntil || null }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Création impossible.");
            setSuccess(`Brouillon ${data.rule.obligationCode} v${data.rule.version} créé. Il ne sera pas utilisé avant une revue indépendante.`);
            setForm(initialForm()); await load();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Création impossible.");
        } finally { setSaving(false); }
    }

    async function transition(rule: Regle, action: "VALIDATE" | "RETIRE") {
        const label = action === "VALIDATE" ? "Notez le texte officiel consulté, le périmètre, les calculs de date et les vérifications effectuées (20 caractères minimum) :" : "Motif du retrait de cette règle (20 caractères minimum) :";
        const reviewComment = window.prompt(label) || "";
        if (reviewComment.trim().length < 20) return;
        setError(""); setSuccess("");
        const response = await fetch("/api/conformite/regles", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: rule.id, action, reviewComment }) });
        const data = await response.json();
        if (!response.ok) { setError(data.error || "Transition impossible."); return; }
        setSuccess(action === "VALIDATE" ? `La règle ${rule.obligationCode} v${rule.version} est validée.` : `La règle ${rule.obligationCode} v${rule.version} est retirée.`);
        await load();
    }

    function toggleArray(key: "clientTypes" | "fiscalRegimes" | "requiredTaxProfileFlags", value: string) {
        setForm((current) => ({ ...current, [key]: current[key].includes(value) ? current[key].filter((item) => item !== value) : [...current[key], value] }));
    }

    return <main className="mx-auto max-w-6xl space-y-6 p-6">
        <header className="space-y-2"><div className="flex items-center gap-2 text-emerald-400"><FileText className="h-6 w-6" /><p className="text-xs font-semibold uppercase tracking-wider">Référentiel du cabinet</p></div><h1 className="page-title text-3xl font-bold">Règles réglementaires versionnées</h1><p className="page-subtitle max-w-3xl">Chaque règle garde sa source, son pays, son périmètre et sa période d’effet. Les brouillons ne déclenchent aucune échéance ; une validation indépendante est obligatoire.</p></header>

        <div role="note" className="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100"><AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" /><p>La revue vérifie la source, les dates, le rythme, le type de déclaration et le périmètre structuré des clients. Une seule version d’un code peut être active ; retirez la précédente avant d’en valider une autre. Les règles génériques non remplacées restent indicatives.</p></div>
        {error && <div role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">{error}</div>}
        {success && <div role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">{success}</div>}

        <form onSubmit={createRule} className="grid gap-4 rounded-xl border border-border bg-card/40 p-5 md:grid-cols-2">
            <h2 className="font-semibold md:col-span-2">Créer une nouvelle version (brouillon)</h2>
            <Field label="Pays ISO"><select required value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className={control}><option>SN</option><option>CI</option><option>CM</option><option>BJ</option><option>BF</option><option>ML</option><option>TG</option><option>NE</option><option>GN</option><option>GA</option><option>TD</option><option>CG</option><option>CF</option><option>GQ</option><option>GW</option><option>KM</option><option>CD</option></select></Field>
            <Field label="Code stable de l’obligation"><input required pattern="[a-z0-9][a-z0-9_-]{1,79}" value={form.obligationCode} onChange={(e) => setForm({ ...form, obligationCode: e.target.value })} placeholder="tva-mensuelle" className={control} /></Field>
            <Field label="Intitulé"><input required minLength={3} maxLength={200} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={control} /></Field>
            <Field label="Catégorie"><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={control}><option>TVA</option><option>IS</option><option>SOCIAL</option><option>RAS</option><option>BIC</option><option>AUTRE</option></select></Field>
            <Field label="Description"><textarea required minLength={10} maxLength={3000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${control} min-h-20`} /></Field>
            <Field label="Périmètre d’assujettissement"><textarea required minLength={20} maxLength={2000} value={form.applicabilityNotes} onChange={(e) => setForm({ ...form, applicabilityNotes: e.target.value })} placeholder="Entités concernées, régime, seuils ou exclusions ; vérifiés par le réviseur." className={`${control} min-h-20`} /></Field>
            <fieldset className="rounded-lg border border-border p-3 md:col-span-2"><legend className="px-1 text-xs text-muted-foreground">Formes de clients concernées · au moins une</legend><div className="flex flex-wrap gap-4">{[["ENTREPRISE", "Entreprise"], ["ASSOCIATION", "Association"], ["PARTICULIER", "Particulier"]].map(([value, label]) => <label key={value} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.clientTypes.includes(value)} onChange={() => toggleArray("clientTypes", value)} />{label}</label>)}</div></fieldset>
            <fieldset className="rounded-lg border border-border p-3 md:col-span-2"><legend className="px-1 text-xs text-muted-foreground">Régimes fiscaux (vide = tous les régimes choisis ci-dessus)</legend><div className="flex flex-wrap gap-4">{[["REEL_NORMAL", "Réel normal"], ["REEL_SIMPLIFIE", "Réel simplifié"], ["CME", "SMT / CME"], ["MICRO_ENTREPRISE", "Micro-entreprise"]].map(([value, label]) => <label key={value} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.fiscalRegimes.includes(value)} onChange={() => toggleArray("fiscalRegimes", value)} />{label}</label>)}</div></fieldset>
            <Field label="Secteurs exacts (codes séparés par des virgules, vide = tous)"><input value={form.sectorsText} onChange={(e) => setForm({ ...form, sectorsText: e.target.value })} placeholder="Ex. COMMERCE, BTP" className={control} /></Field>
            <fieldset className="rounded-lg border border-border p-3"><legend className="px-1 text-xs text-muted-foreground">Conditions du profil client enregistrées</legend><div className="flex flex-wrap gap-3">{[["vatRegistered", "Assujetti TVA"], ["employer", "Employeur"], ["withholdingAgent", "Agent de retenue"]].map(([value, label]) => <label key={value} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.requiredTaxProfileFlags.includes(value)} onChange={() => toggleArray("requiredTaxProfileFlags", value)} />{label}</label>)}</div></fieldset>
            <Field label="Type de déclaration"><select value={form.declarationType} onChange={(e) => setForm({ ...form, declarationType: e.target.value })} className={control}><option>TVA</option><option>IS</option><option>IRPP</option><option>COTISATION_SOCIALE</option><option>AUTRE</option></select></Field>
            <Field label="Périodicité"><select value={form.periodicity} onChange={(e) => setForm({ ...form, periodicity: e.target.value, dueMonth: e.target.value === "MENSUELLE" ? "" : form.dueMonth || "1" })} className={control}><option value="MENSUELLE">Mensuelle</option><option value="TRIMESTRIELLE">Trimestrielle</option><option value="ANNUELLE">Annuelle</option></select></Field>
            <Field label="Jour d’échéance"><input required type="number" min={1} max={31} value={form.dueDay} onChange={(e) => setForm({ ...form, dueDay: e.target.value })} className={control} /></Field>
            {form.periodicity !== "MENSUELLE" && <Field label={form.periodicity === "ANNUELLE" ? "Mois d’échéance (1–12)" : "Mois dans le trimestre (1–3)"}><input required type="number" min={1} max={form.periodicity === "ANNUELLE" ? 12 : 3} value={form.dueMonth} onChange={(e) => setForm({ ...form, dueMonth: e.target.value })} className={control} /></Field>}
            <Field label="Texte officiel source"><input required minLength={3} maxLength={250} value={form.sourceTitle} onChange={(e) => setForm({ ...form, sourceTitle: e.target.value })} placeholder="Code général des impôts, loi de finances…" className={control} /></Field>
            <Field label="URL HTTPS de la source"><input required type="url" pattern="https://.*" value={form.sourceUrl} onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })} className={control} /></Field>
            <Field label="Article / référence"><input maxLength={250} value={form.sourceArticle} onChange={(e) => setForm({ ...form, sourceArticle: e.target.value })} className={control} /></Field>
            <Field label="Date de publication du texte"><input type="date" value={form.sourcePublishedAt} onChange={(e) => setForm({ ...form, sourcePublishedAt: e.target.value })} className={control} /></Field>
            <Field label="Début d’effet"><input required type="date" value={form.effectiveFrom} onChange={(e) => setForm({ ...form, effectiveFrom: e.target.value })} className={control} /></Field>
            <Field label="Fin d’effet (facultative)"><input type="date" value={form.effectiveUntil} onChange={(e) => setForm({ ...form, effectiveUntil: e.target.value })} className={control} /></Field>
            <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50 md:col-span-2">{saving ? "Enregistrement…" : "Enregistrer le brouillon"}</button>
        </form>

        <section className="space-y-3 rounded-xl border border-border bg-card/40 p-5">
            <div className="flex items-center justify-between gap-3"><div><h2 className="font-semibold">Versions du cabinet</h2><p className="text-xs text-muted-foreground">Une version validée est indépendante de la personne qui l’a créée.</p></div><button type="button" onClick={() => void load()} disabled={loading} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs"><RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />Actualiser</button></div>
            {loading ? <p className="text-sm text-muted-foreground">Chargement du registre…</p> : rules.length === 0 ? <p className="text-sm text-muted-foreground">Aucune règle de cabinet. Les catalogues génériques restent indicatifs.</p> : rules.map((rule) => <article key={rule.id} className="space-y-2 rounded-lg border border-border/70 bg-background/30 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-medium">{rule.country} · {rule.title} · {rule.obligationCode} v{rule.version}</h3><p className="text-xs text-muted-foreground">{rule.periodicity} · échéance jour {rule.dueDay}{rule.dueMonth ? `, mois ${rule.dueMonth}` : ""} · effet du {new Date(rule.effectiveFrom).toLocaleDateString("fr-FR")}{rule.effectiveUntil ? ` au ${new Date(rule.effectiveUntil).toLocaleDateString("fr-FR")}` : " sans fin renseignée"}</p></div><span className={`rounded-full px-2 py-1 text-xs ${rule.status === "VERIFIED" ? "bg-emerald-500/15 text-emerald-400" : rule.status === "RETIRED" ? "bg-slate-500/15 text-slate-400" : "bg-amber-500/15 text-amber-300"}`}>{labelsStatut[rule.status] || rule.status}</span></div><p className="text-sm text-muted-foreground">{rule.applicabilityNotes}</p><p className="text-xs text-muted-foreground">Clients : {rule.clientTypes.join(", ")} · Régimes : {rule.fiscalRegimes.length ? rule.fiscalRegimes.join(", ") : "tous"} · Secteurs : {rule.sectors.length ? rule.sectors.join(", ") : "tous"}{rule.requiredTaxProfileFlags.length ? ` · Profil requis : ${rule.requiredTaxProfileFlags.join(", ")}` : ""}</p><div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs"><a className="text-primary hover:underline" href={rule.sourceUrl} target="_blank" rel="noreferrer">{rule.sourceTitle}{rule.sourceArticle ? ` · ${rule.sourceArticle}` : ""}</a>{rule.sourcePublishedAt && <span className="text-muted-foreground">Publié le {new Date(rule.sourcePublishedAt).toLocaleDateString("fr-FR")}</span>}<span className="text-muted-foreground">Créée par {rule.createdBy.firstName} {rule.createdBy.lastName}</span>{rule.reviewComment && <span className="text-muted-foreground">Revue : {rule.reviewComment}</span>}</div>{canReview && rule.status === "DRAFT" && rule.createdById !== user?.id && <button type="button" onClick={() => void transition(rule, "VALIDATE")} className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white"><CheckCircle2 className="h-3.5 w-3.5" />Valider après revue indépendante</button>}{canReview && rule.status === "VERIFIED" && <button type="button" onClick={() => void transition(rule, "RETIRE")} className="rounded-lg border border-rose-500/30 px-3 py-2 text-xs text-rose-300">Retirer cette version</button>}</article>)}
        </section>
    </main>;
}

const control = "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";
function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="block text-xs text-muted-foreground">{label}{children}</label>; }
