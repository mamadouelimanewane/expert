"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Briefcase, Building2, Calendar, Clock, Coins, FileText, PenTool, FolderOpen, Save, X, Pencil, CheckSquare } from "lucide-react";
import { toast } from "@/lib/toast";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { cn } from "@/lib/utils";
import { changerStatut, LIBELLES, TRANSITIONS, type StatutMission } from "@/components/missions/MissionStatusMenu";

// ─────────────────────────────────────────────────────────────────────────────
// Fiche mission : statut (transitions contrôlées), échéance, budget, temps,
// dépenses, lettres de mission, documents. Avant cette page, une mission ne
// pouvait ni être ouverte ni évoluer après sa création.
// ─────────────────────────────────────────────────────────────────────────────

type Mission = {
    id: string; title: string; description?: string | null; type: string; status: StatutMission;
    startDate: string; endDate?: string | null; deadline?: string | null; fixedPrice?: number | null;
    client: { id: string; companyName?: string | null; firstName?: string | null; lastName?: string | null; country: string; email: string; phone: string };
    assignedTo?: { id: string; firstName: string; lastName: string } | null;
    createdBy?: { firstName: string; lastName: string } | null;
    tasks: { id: string; title: string; status: string; dueDate?: string | null }[];
    timeEntries: { id: string; date: string; duration: number; category: string; description?: string | null; user?: { firstName: string; lastName: string } }[];
    expenses: { id: string; label: string; amount: number; category: string; status: string; expenseDate: string }[];
    engagementLetters: { id: string; reference: string; status: string; fees?: number | null; signedAt?: string | null }[];
    documents: { id: string; fileName: string; type: string; status: string; createdAt: string }[];
};

const STATUT: Record<StatutMission, { label: string; cls: string }> = {
    DRAFT: { label: "Brouillon", cls: "bg-slate-100 text-slate-700" },
    IN_PROGRESS: { label: "En cours", cls: "bg-blue-100 text-blue-700" },
    PENDING_REVIEW: { label: "À réviser", cls: "bg-amber-100 text-amber-700" },
    COMPLETED: { label: "Terminée", cls: "bg-emerald-100 text-emerald-700" },
    CANCELLED: { label: "Annulée", cls: "bg-rose-100 text-rose-700" },
};
const TYPES: Record<string, string> = { AUDIT: "Audit", CONSEIL: "Conseil", TENUE_COMPTABLE: "Tenue comptable", DECLARATION_FISCALE: "Déclaration fiscale", PAIE: "Paie", EXPERTISE_JUDICIAIRE: "Expertise judiciaire", AUTRE: "Autre" };
const fcfa = (n: number) => `${Math.round(n).toLocaleString("fr-FR")} FCFA`;
const dateFr = (d?: string | null) => (d ? new Date(d).toLocaleDateString("fr-FR") : "—");
const isoJour = (d?: string | null) => (d ? new Date(d).toISOString().slice(0, 10) : "");

export default function MissionDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [mission, setMission] = useState<Mission | null>(null);
    const [synthese, setSynthese] = useState<{ heures: number; depenses: number }>({ heures: 0, depenses: 0 });
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [busy, setBusy] = useState(false);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ title: "", description: "", type: "TENUE_COMPTABLE", deadline: "", budget: "" });

    const charger = useCallback(async () => {
        setLoading(true);
        try {
            const r = await fetch(`/api/missions/${id}`);
            if (r.status === 404) { setNotFound(true); return; }
            const d = await r.json();
            setMission(d.mission);
            setSynthese(d.synthese ?? { heures: 0, depenses: 0 });
        } finally { setLoading(false); }
    }, [id]);
    useEffect(() => { charger(); }, [charger]);

    const appliquerStatut = async (s: StatutMission) => {
        if (s === "CANCELLED" && !window.confirm("Annuler cette mission ? Les temps et factures déjà rattachés sont conservés.")) return;
        setBusy(true);
        try { if (await changerStatut(id, s)) { await charger(); router.refresh(); } } finally { setBusy(false); }
    };

    const demarrerEdition = () => {
        if (!mission) return;
        setForm({ title: mission.title, description: mission.description ?? "", type: mission.type, deadline: isoJour(mission.deadline), budget: mission.fixedPrice != null ? String(mission.fixedPrice) : "" });
        setEditing(true);
    };
    const enregistrer = async () => {
        setBusy(true);
        try {
            const body: Record<string, unknown> = { title: form.title, description: form.description || null, type: form.type, deadline: form.deadline || null, budget: form.budget === "" ? null : form.budget };
            const r = await fetch(`/api/missions/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
            const d = await r.json();
            if (!r.ok) { toast.error(d.error || "Modification refusée"); return; }
            toast.success("Mission mise à jour");
            setEditing(false);
            await charger();
        } finally { setBusy(false); }
    };

    if (notFound) return <EmptyState icon={Briefcase} title="Mission introuvable" description="Cette mission n'existe pas ou a été supprimée." action={{ label: "Retour aux missions", href: "/missions" }} />;
    if (loading || !mission) return <LoadingState label="Chargement de la mission…" skeleton="rows" count={6} />;

    const client = mission.client;
    const nomClient = client.companyName || [client.firstName, client.lastName].filter(Boolean).join(" ");
    const enRetard = mission.deadline && new Date(mission.deadline) < new Date() && mission.status !== "COMPLETED" && mission.status !== "CANCELLED";
    const budget = mission.fixedPrice ?? 0;
    const consommation = budget > 0 ? Math.min(100, Math.round(((synthese.depenses) / budget) * 100)) : null;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="min-w-0">
                    <Link href="/missions" className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary mb-2"><ArrowLeft className="w-3.5 h-3.5" /> Missions</Link>
                    {editing ? (
                        <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full text-2xl font-bold rounded-lg border border-border bg-card px-3 py-2" />
                    ) : (
                        <h1 className="page-title text-2xl sm:text-3xl font-bold m-0 flex items-center gap-3">
                            <span className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0"><Briefcase className="w-6 h-6" /></span>
                            <span>{mission.title}</span>
                        </h1>
                    )}
                    <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-bold", STATUT[mission.status].cls)}>{STATUT[mission.status].label}</span>
                        <span>{TYPES[mission.type] ?? mission.type}</span>
                        <span>·</span>
                        <Link href={`/clients/${client.id}`} className="inline-flex items-center gap-1 hover:text-primary font-medium"><Building2 className="w-3.5 h-3.5" />{nomClient}</Link>
                        {mission.assignedTo && <><span>·</span><span>Responsable : {mission.assignedTo.firstName} {mission.assignedTo.lastName}</span></>}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                    {editing ? (
                        <>
                            <button onClick={enregistrer} disabled={busy} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-sm"><Save className="w-4 h-4" /> Enregistrer</button>
                            <button onClick={() => setEditing(false)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card font-bold text-sm"><X className="w-4 h-4" /> Annuler</button>
                        </>
                    ) : (
                        <>
                            {TRANSITIONS[mission.status].filter((s) => s !== "CANCELLED").map((s) => {
                                const L = LIBELLES[s];
                                return (
                                    <button key={s} onClick={() => appliquerStatut(s)} disabled={busy} className={cn("inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm", s === "COMPLETED" ? "bg-emerald-600 text-white" : s === "IN_PROGRESS" ? "bg-primary text-white" : "border border-border bg-card")}>
                                        <L.icon className="w-4 h-4" /> {L.label}
                                    </button>
                                );
                            })}
                            <button onClick={demarrerEdition} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card font-bold text-sm"><Pencil className="w-4 h-4" /> Modifier</button>
                            {TRANSITIONS[mission.status].includes("CANCELLED") && (
                                <button onClick={() => appliquerStatut("CANCELLED")} disabled={busy} className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border text-rose-600 hover:border-rose-300 text-sm" title="Annuler la mission"><X className="w-4 h-4" /></button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Indicateurs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="apix-card p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Échéance</p>
                    {editing ? <input type="date" value={form.deadline} onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))} className="mt-1 w-full rounded-lg border border-border bg-card px-2 py-1.5 text-sm" />
                        : <p className={cn("text-lg font-extrabold mt-1", enRetard ? "text-rose-600" : "")}>{dateFr(mission.deadline)}{enRetard && <span className="block text-[11px] font-bold">En retard</span>}</p>}
                </div>
                <div className="apix-card p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5"><Coins className="w-3.5 h-3.5" /> Honoraires</p>
                    {editing ? <input inputMode="decimal" value={form.budget} onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))} placeholder="ex. 1 500 000" className="mt-1 w-full rounded-lg border border-border bg-card px-2 py-1.5 text-sm" />
                        : <p className="text-lg font-extrabold mt-1 tabular-nums">{budget ? fcfa(budget) : "Non fixés"}</p>}
                </div>
                <div className="apix-card p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Temps passé</p>
                    <p className="text-lg font-extrabold mt-1 tabular-nums">{synthese.heures.toLocaleString("fr-FR")} h</p>
                </div>
                <div className="apix-card p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Dépenses</p>
                    <p className="text-lg font-extrabold mt-1 tabular-nums">{fcfa(synthese.depenses)}</p>
                    {consommation !== null && <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden"><div className={cn("h-full", consommation > 90 ? "bg-rose-500" : "bg-primary")} style={{ width: `${consommation}%` }} /></div>}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="apix-card p-5 space-y-3">
                    <h2 className="font-bold text-base">Description</h2>
                    {editing ? (
                        <>
                            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm">
                                {Object.entries(TYPES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                            </select>
                            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={6} className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" placeholder="Objet, périmètre, livrables…" />
                        </>
                    ) : (
                        <p className="text-sm text-muted-foreground whitespace-pre-line">{mission.description || "Aucune description. Cliquez sur Modifier pour préciser l'objet et le périmètre de la mission."}</p>
                    )}
                    <div className="pt-3 border-t border-border text-xs text-muted-foreground space-y-1">
                        <p>Démarrée le {dateFr(mission.startDate)}{mission.endDate ? ` · clôturée le ${dateFr(mission.endDate)}` : ""}</p>
                        {mission.createdBy && <p>Créée par {mission.createdBy.firstName} {mission.createdBy.lastName}</p>}
                    </div>
                    <div className="pt-3 border-t border-border">
                        <h3 className="font-bold text-sm flex items-center gap-2 mb-2"><PenTool className="w-4 h-4 text-primary" /> Lettres de mission</h3>
                        {mission.engagementLetters.length === 0 ? <p className="text-xs text-muted-foreground">Aucune lettre. <Link href="/lettres-mission" className="text-primary font-bold">Rédiger</Link></p> : (
                            <ul className="text-sm space-y-1.5">{mission.engagementLetters.map((l) => <li key={l.id} className="flex justify-between"><span className="font-bold">{l.reference}</span><span className="text-xs text-muted-foreground">{l.status}{l.signedAt ? ` · signée ${dateFr(l.signedAt)}` : ""}</span></li>)}</ul>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="apix-card p-5">
                        <h2 className="font-bold text-base flex items-center gap-2 mb-3"><CheckSquare className="w-4 h-4 text-primary" /> Tâches <span className="text-xs text-muted-foreground font-normal">({mission.tasks.length})</span></h2>
                        {mission.tasks.length === 0 ? <p className="text-sm text-muted-foreground">Aucune tâche rattachée.</p> : (
                            <ul className="divide-y divide-border">{mission.tasks.map((t) => <li key={t.id} className="py-2 flex justify-between text-sm"><span>{t.title}</span><span className="text-xs text-muted-foreground">{t.status}{t.dueDate ? ` · ${dateFr(t.dueDate)}` : ""}</span></li>)}</ul>
                        )}
                    </div>
                    <div className="apix-card p-5">
                        <h2 className="font-bold text-base flex items-center gap-2 mb-3"><Clock className="w-4 h-4 text-primary" /> Temps saisis</h2>
                        {mission.timeEntries.length === 0 ? <EmptyState size="compact" icon={Clock} title="Aucun temps saisi" description="Les heures passées alimentent la rentabilité de la mission." action={{ label: "Saisir du temps", href: "/timesheets" }} /> : (
                            <ul className="divide-y divide-border">{mission.timeEntries.map((t) => <li key={t.id} className="py-2 flex justify-between gap-3 text-sm"><div className="min-w-0"><p className="truncate">{t.description || t.category}</p><p className="text-xs text-muted-foreground">{dateFr(t.date)}{t.user ? ` · ${t.user.firstName} ${t.user.lastName}` : ""}</p></div><span className="font-bold tabular-nums shrink-0">{t.duration} h</span></li>)}</ul>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="apix-card p-5">
                            <h2 className="font-bold text-base flex items-center gap-2 mb-3"><Coins className="w-4 h-4 text-primary" /> Dépenses</h2>
                            {mission.expenses.length === 0 ? <p className="text-sm text-muted-foreground">Aucune dépense. <Link href="/expenses" className="text-primary font-bold">Déclarer</Link></p> : (
                                <ul className="divide-y divide-border">{mission.expenses.map((e) => <li key={e.id} className="py-2 flex justify-between text-sm"><div><p>{e.label}</p><p className="text-xs text-muted-foreground">{e.category} · {dateFr(e.expenseDate)} · {e.status}</p></div><span className="font-bold tabular-nums">{fcfa(e.amount)}</span></li>)}</ul>
                            )}
                        </div>
                        <div className="apix-card p-5">
                            <h2 className="font-bold text-base flex items-center gap-2 mb-3"><FolderOpen className="w-4 h-4 text-primary" /> Documents</h2>
                            {mission.documents.length === 0 ? <p className="text-sm text-muted-foreground">Aucun document rattaché.</p> : (
                                <ul className="divide-y divide-border">{mission.documents.map((d) => <li key={d.id} className="py-2 flex justify-between text-sm"><span className="truncate">{d.fileName.replace(/^\d+-/, "")}</span><span className="text-xs text-muted-foreground shrink-0">{d.status}</span></li>)}</ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
