"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft, Building2, Briefcase, Receipt, Clock, FileText, FolderOpen, Link2, Copy, RefreshCw,
    ShieldOff, Pencil, Save, X, Archive, Phone, Mail, MapPin, Globe, CheckCircle2, AlertTriangle, PenTool,
} from "lucide-react";
import { toast } from "@/lib/toast";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Fiche client 360°. Avant cette page, un client ne pouvait ni être ouvert,
// ni modifié, ni voir son lien portail : la liste renvoyait vers rien.
// Toutes les données viennent des API existantes, filtrées sur ce client.
// ─────────────────────────────────────────────────────────────────────────────

type Client = {
    id: string; type: string; companyName?: string | null; firstName?: string | null; lastName?: string | null;
    email: string; phone: string; rccm?: string | null; ninea?: string | null; ifu?: string | null; nif?: string | null;
    fiscalRegime: string; sector?: string | null; country: string; address?: string | null; city?: string | null;
    subjectToTva: boolean; isActive: boolean; portalEnabled: boolean; healthScore?: number | null; rating?: string | null; createdAt: string;
};
type Mission = { id: string; title: string; type: string; status: string; deadline?: string | null; fixedPrice?: number | null };
type Invoice = { id: string; invoiceNumber: string; total: number; status: string; dueDate: string; clientId: string; paidDate?: string | null };
type TimeEntry = { id: string; date: string; duration: number; category: string; description?: string | null; clientId?: string; user?: { firstName: string; lastName: string } };
type Doc = { id: string; fileName: string; type: string; status: string; createdAt: string };
type Letter = { id: string; reference: string; status: string; fees?: number | null; clientId: string; signedAt?: string | null };

const REGIMES: Record<string, string> = { REEL_NORMAL: "Réel normal", REEL_SIMPLIFIE: "Réel simplifié", CME: "CME", MICRO_ENTREPRISE: "Micro-entreprise" };
const STATUT_MISSION: Record<string, { label: string; cls: string }> = {
    DRAFT: { label: "Brouillon", cls: "bg-slate-100 text-slate-600" },
    IN_PROGRESS: { label: "En cours", cls: "bg-blue-100 text-blue-700" },
    PENDING_REVIEW: { label: "À réviser", cls: "bg-amber-100 text-amber-700" },
    COMPLETED: { label: "Terminée", cls: "bg-emerald-100 text-emerald-700" },
    CANCELLED: { label: "Annulée", cls: "bg-rose-100 text-rose-700" },
};
const STATUT_FACTURE: Record<string, { label: string; cls: string }> = {
    DRAFT: { label: "Brouillon", cls: "bg-slate-100 text-slate-600" },
    SENT: { label: "Envoyée", cls: "bg-blue-100 text-blue-700" },
    PAID: { label: "Payée", cls: "bg-emerald-100 text-emerald-700" },
    OVERDUE: { label: "En retard", cls: "bg-rose-100 text-rose-700" },
    CANCELLED: { label: "Annulée", cls: "bg-slate-100 text-slate-500" },
};
const fcfa = (n: number) => `${Math.round(n).toLocaleString("fr-FR")} FCFA`;
const dateFr = (d?: string | null) => (d ? new Date(d).toLocaleDateString("fr-FR") : "—");
const nomClient = (c: Client) => c.companyName || [c.firstName, c.lastName].filter(Boolean).join(" ") || "Client sans nom";

function Badge({ map, value }: { map: Record<string, { label: string; cls: string }>; value: string }) {
    const m = map[value] ?? { label: value, cls: "bg-slate-100 text-slate-600" };
    return <span className={cn("px-2 py-0.5 rounded-full text-[11px] font-bold", m.cls)}>{m.label}</span>;
}

export default function ClientDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [client, setClient] = useState<Client | null>(null);
    const [missions, setMissions] = useState<Mission[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [times, setTimes] = useState<TimeEntry[]>([]);
    const [docs, setDocs] = useState<Doc[]>([]);
    const [letters, setLetters] = useState<Letter[]>([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [onglet, setOnglet] = useState<"missions" | "factures" | "temps" | "documents" | "lettres">("missions");

    // Édition
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState<Partial<Client>>({});
    const [saving, setSaving] = useState(false);

    // Portail
    const [portal, setPortal] = useState<{ enabled: boolean; url: string | null } | null>(null);
    const [portalBusy, setPortalBusy] = useState(false);

    const charger = useCallback(async () => {
        setLoading(true);
        try {
            const rc = await fetch(`/api/clients/${id}`);
            if (rc.status === 404) { setNotFound(true); return; }
            const { client: c } = await rc.json();
            setClient(c);
            const [rm, ri, rt, rd, rl] = await Promise.all([
                fetch(`/api/missions?clientId=${id}`).then((r) => r.json()).catch(() => ({})),
                fetch(`/api/invoices?status=tous`).then((r) => r.json()).catch(() => ({})),
                fetch(`/api/timesheets`).then((r) => r.json()).catch(() => ({})),
                fetch(`/api/documents?clientId=${id}`).then((r) => r.json()).catch(() => ({})),
                fetch(`/api/engagement-letters`).then((r) => r.json()).catch(() => ({})),
            ]);
            setMissions(rm.missions ?? []);
            setInvoices((ri.invoices ?? []).filter((i: Invoice) => i.clientId === id));
            setTimes((rt.entries ?? []).filter((t: TimeEntry) => t.clientId === id));
            setDocs(Array.isArray(rd) ? rd : rd.documents ?? []);
            setLetters((rl.letters ?? []).filter((l: Letter) => l.clientId === id));
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { charger(); }, [charger]);

    const synthese = useMemo(() => {
        const facture = invoices.reduce((s, i) => s + (i.status === "CANCELLED" ? 0 : i.total), 0);
        const encaisse = invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + i.total, 0);
        const enRetard = invoices.filter((i) => i.status === "OVERDUE" || (i.status === "SENT" && new Date(i.dueDate) < new Date())).reduce((s, i) => s + i.total, 0);
        const heures = times.reduce((s, t) => s + (t.duration ?? 0), 0);
        const actives = missions.filter((m) => m.status === "IN_PROGRESS" || m.status === "PENDING_REVIEW").length;
        return { facture, encaisse, enRetard, heures, actives };
    }, [invoices, times, missions]);

    // ── Édition ────────────────────────────────────────────────────────────
    const demarrerEdition = () => {
        if (!client) return;
        setForm({
            companyName: client.companyName ?? "", firstName: client.firstName ?? "", lastName: client.lastName ?? "",
            email: client.email, phone: client.phone, rccm: client.rccm ?? "", ninea: client.ninea ?? "", ifu: client.ifu ?? "", nif: client.nif ?? "",
            fiscalRegime: client.fiscalRegime, sector: client.sector ?? "", country: client.country, address: client.address ?? "", city: client.city ?? "",
            subjectToTva: client.subjectToTva,
        });
        setEditing(true);
    };
    const enregistrer = async () => {
        setSaving(true);
        try {
            // Seuls les champs modifiés partent, les chaînes vides deviennent null.
            const diff: Record<string, unknown> = {};
            for (const [k, v] of Object.entries(form)) {
                const avant = (client as unknown as Record<string, unknown>)[k] ?? "";
                if (v !== avant) diff[k] = v === "" ? undefined : v;
            }
            if (Object.keys(diff).length === 0) { setEditing(false); return; }
            const res = await fetch(`/api/clients/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(diff) });
            const data = await res.json();
            if (!res.ok) {
                const detail = data.details?.map((d: { champ: string; message: string }) => `${d.champ} : ${d.message}`).join(" · ");
                toast.error(detail || data.error || "Modification refusée");
                return;
            }
            setClient(data.client);
            setEditing(false);
            toast.success("Fiche client mise à jour");
        } finally {
            setSaving(false);
        }
    };
    const archiver = async () => {
        if (!client) return;
        if (!window.confirm(`Archiver « ${nomClient(client)} » ? Le dossier reste consultable mais n'apparaîtra plus dans les listes actives et son portail sera coupé.`)) return;
        const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
        if (res.ok) { toast.success("Client archivé"); router.push("/clients"); }
        else toast.error("Archivage impossible");
    };

    // ── Portail ────────────────────────────────────────────────────────────
    const chargerPortail = async () => {
        setPortalBusy(true);
        try {
            const r = await fetch(`/api/clients/${id}/portal-link`);
            const d = await r.json();
            if (!r.ok) { toast.error(d.error || "Lien indisponible"); return; }
            setPortal(d);
        } finally { setPortalBusy(false); }
    };
    const actionPortail = async (action: "regenerate" | "revoke") => {
        if (action === "revoke" && !window.confirm("Révoquer l'accès portail ? Le lien transmis au client cessera de fonctionner immédiatement.")) return;
        setPortalBusy(true);
        try {
            const r = await fetch(`/api/clients/${id}/portal-link`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
            const d = await r.json();
            if (!r.ok) { toast.error(d.error || "Action impossible"); return; }
            setPortal(d);
            setClient((c) => (c ? { ...c, portalEnabled: d.enabled } : c));
            toast.success(action === "revoke" ? "Accès portail révoqué" : "Nouveau lien portail généré — l'ancien est invalide");
        } finally { setPortalBusy(false); }
    };
    const copierPortail = async () => {
        if (!portal?.url) return;
        await navigator.clipboard.writeText(portal.url);
        toast.success("Lien portail copié dans le presse-papiers");
    };

    if (notFound) {
        return <EmptyState icon={Building2} title="Client introuvable" description="Ce dossier n'existe pas ou a été supprimé." action={{ label: "Retour aux clients", href: "/clients" }} />;
    }
    if (loading || !client) {
        return <LoadingState label="Chargement du dossier client…" skeleton="cards" count={3} />;
    }

    const champ = (label: string, key: keyof Client, opts?: { type?: string; as?: "select"; options?: [string, string][] }) => (
        <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{label}</span>
            {opts?.as === "select" ? (
                <select value={String(form[key] ?? "")} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm">
                    {opts.options!.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
            ) : (
                <input type={opts?.type ?? "text"} value={String(form[key] ?? "")} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" />
            )}
        </label>
    );

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="min-w-0">
                    <Link href="/clients" className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary mb-2">
                        <ArrowLeft className="w-3.5 h-3.5" /> Portefeuille clients
                    </Link>
                    <h1 className="page-title flex items-center gap-3 text-2xl sm:text-3xl font-bold m-0">
                        <span className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0"><Building2 className="w-6 h-6" /></span>
                        <span className="truncate">{nomClient(client)}</span>
                    </h1>
                    <p className="page-subtitle mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                        <span>{client.sector || client.type}</span>
                        <span>·</span><span>{REGIMES[client.fiscalRegime] ?? client.fiscalRegime}</span>
                        <span>·</span><span className="inline-flex items-center gap-1"><Globe className="w-3.5 h-3.5" />{client.country}</span>
                        {!client.isActive && <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[11px] font-bold">Archivé</span>}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                    {!editing ? (
                        <>
                            <button onClick={demarrerEdition} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-sm"><Pencil className="w-4 h-4" /> Modifier</button>
                            <Link href={`/missions/new?clientId=${client.id}`} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card font-bold text-sm hover:border-primary"><Briefcase className="w-4 h-4" /> Nouvelle mission</Link>
                            <Link href={`/billing/new?clientId=${client.id}`} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card font-bold text-sm hover:border-primary"><Receipt className="w-4 h-4" /> Facturer</Link>
                            {client.isActive && <button onClick={archiver} className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-rose-600 hover:border-rose-300 text-sm" title="Archiver le client"><Archive className="w-4 h-4" /></button>}
                        </>
                    ) : (
                        <>
                            <button onClick={enregistrer} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-sm"><Save className="w-4 h-4" /> {saving ? "Enregistrement…" : "Enregistrer"}</button>
                            <button onClick={() => setEditing(false)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card font-bold text-sm"><X className="w-4 h-4" /> Annuler</button>
                        </>
                    )}
                </div>
            </div>

            {/* Indicateurs */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {[
                    { l: "Missions actives", v: String(synthese.actives), i: Briefcase },
                    { l: "Facturé", v: fcfa(synthese.facture), i: Receipt },
                    { l: "Encaissé", v: fcfa(synthese.encaisse), i: CheckCircle2 },
                    { l: "En retard", v: fcfa(synthese.enRetard), i: AlertTriangle, alert: synthese.enRetard > 0 },
                    { l: "Heures saisies", v: `${synthese.heures.toLocaleString("fr-FR")} h`, i: Clock },
                ].map((k) => (
                    <div key={k.l} className="apix-card p-4">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5"><k.i className="w-3.5 h-3.5" />{k.l}</p>
                        <p className={cn("text-lg font-extrabold mt-1 tabular-nums", k.alert ? "text-rose-600" : "text-foreground")}>{k.v}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Identité */}
                <div className="apix-card p-5 space-y-4 lg:col-span-1">
                    <h2 className="font-bold text-base flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Identité</h2>
                    {editing ? (
                        <div className="space-y-3">
                            {champ("Raison sociale", "companyName")}
                            <div className="grid grid-cols-2 gap-3">{champ("Prénom", "firstName")}{champ("Nom", "lastName")}</div>
                            {champ("Email", "email", { type: "email" })}
                            {champ("Téléphone", "phone", { type: "tel" })}
                            <div className="grid grid-cols-2 gap-3">{champ("RCCM", "rccm")}{champ("NINEA", "ninea")}</div>
                            <div className="grid grid-cols-2 gap-3">{champ("IFU", "ifu")}{champ("NIF", "nif")}</div>
                            {champ("Régime fiscal", "fiscalRegime", { as: "select", options: Object.entries(REGIMES) })}
                            {champ("Secteur", "sector")}
                            <div className="grid grid-cols-2 gap-3">{champ("Pays (code)", "country")}{champ("Ville", "city")}</div>
                            {champ("Adresse", "address")}
                            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.subjectToTva} onChange={(e) => setForm((f) => ({ ...f, subjectToTva: e.target.checked }))} /> Assujetti à la TVA</label>
                        </div>
                    ) : (
                        <dl className="text-sm space-y-2.5">
                            <div className="flex items-start gap-2"><Mail className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" /><a href={`mailto:${client.email}`} className="hover:text-primary break-all">{client.email}</a></div>
                            <div className="flex items-start gap-2"><Phone className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" /><a href={`tel:${client.phone}`} className="hover:text-primary">{client.phone}</a></div>
                            <div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" /><span>{[client.address, client.city, client.country].filter(Boolean).join(", ") || "Adresse non renseignée"}</span></div>
                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                                {[["RCCM", client.rccm], ["NINEA", client.ninea], ["IFU", client.ifu], ["NIF", client.nif]].map(([l, v]) => (
                                    <div key={l as string}><dt className="text-[11px] font-bold uppercase text-muted-foreground">{l}</dt><dd className="font-mono text-xs break-all">{v || "—"}</dd></div>
                                ))}
                            </div>
                            <div className="pt-2 border-t border-border text-xs text-muted-foreground">
                                {client.subjectToTva ? "Assujetti à la TVA" : "Non assujetti à la TVA"} · Client depuis le {dateFr(client.createdAt)}
                            </div>
                        </dl>
                    )}

                    {/* Portail */}
                    <div className="pt-4 border-t border-border space-y-2">
                        <h3 className="font-bold text-sm flex items-center gap-2"><Link2 className="w-4 h-4 text-primary" /> Espace client (portail)</h3>
                        {!portal ? (
                            <button onClick={chargerPortail} disabled={portalBusy} className="text-sm font-bold text-primary hover:underline">
                                {portalBusy ? "Chargement…" : client.portalEnabled ? "Afficher le lien d'accès" : "Portail désactivé — voir les options"}
                            </button>
                        ) : portal.enabled && portal.url ? (
                            <>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 min-w-0 truncate text-xs bg-muted rounded-lg px-2 py-1.5">{portal.url}</code>
                                    <button onClick={copierPortail} className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20" title="Copier le lien"><Copy className="w-4 h-4" /></button>
                                </div>
                                <p className="text-[11px] text-muted-foreground">Ce lien vaut authentification : ne le transmettez qu'au client, par un canal sûr.</p>
                                <div className="flex gap-2">
                                    <button onClick={() => actionPortail("regenerate")} disabled={portalBusy} className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-border hover:border-primary"><RefreshCw className="w-3.5 h-3.5" /> Régénérer</button>
                                    <button onClick={() => actionPortail("revoke")} disabled={portalBusy} className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-border text-rose-600 hover:border-rose-300"><ShieldOff className="w-3.5 h-3.5" /> Révoquer</button>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-xs text-muted-foreground">Aucun lien actif.</p>
                                <button onClick={() => actionPortail("regenerate")} disabled={portalBusy} className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-primary text-white"><RefreshCw className="w-3.5 h-3.5" /> Activer le portail</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Activité */}
                <div className="apix-card p-0 lg:col-span-2 overflow-hidden">
                    <div className="tabs-scroll flex gap-1 p-2 border-b border-border">
                        {([["missions", "Missions", missions.length], ["factures", "Factures", invoices.length], ["temps", "Temps", times.length], ["documents", "Documents", docs.length], ["lettres", "Lettres de mission", letters.length]] as const).map(([k, l, n]) => (
                            <button key={k} onClick={() => setOnglet(k)} className={cn("px-3.5 py-2 rounded-lg text-sm font-bold transition-colors", onglet === k ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted")}>
                                {l} <span className={cn("ml-1 text-[11px]", onglet === k ? "opacity-80" : "opacity-60")}>{n}</span>
                            </button>
                        ))}
                    </div>
                    <div className="p-4">
                        {onglet === "missions" && (missions.length === 0 ? (
                            <EmptyState size="compact" icon={Briefcase} title="Aucune mission" description="Créez la première mission de ce dossier : tenue comptable, audit, paie…" action={{ label: "Nouvelle mission", href: `/missions/new?clientId=${client.id}` }} />
                        ) : (
                            <ul className="divide-y divide-border">
                                {missions.map((m) => (
                                    <li key={m.id} className="py-3 flex items-center justify-between gap-3">
                                        <Link href={`/missions/${m.id}`} className="min-w-0 hover:text-primary">
                                            <p className="font-bold text-sm truncate">{m.title}</p>
                                            <p className="text-xs text-muted-foreground">{m.type.replace(/_/g, " ")} · échéance {dateFr(m.deadline)}{m.fixedPrice ? ` · ${fcfa(m.fixedPrice)}` : ""}</p>
                                        </Link>
                                        <Badge map={STATUT_MISSION} value={m.status} />
                                    </li>
                                ))}
                            </ul>
                        ))}
                        {onglet === "factures" && (invoices.length === 0 ? (
                            <EmptyState size="compact" icon={Receipt} title="Aucune facture" description="Les honoraires facturés à ce client apparaîtront ici avec leur statut d'encaissement." action={{ label: "Facturer", href: `/billing/new?clientId=${client.id}` }} />
                        ) : (
                            <ul className="divide-y divide-border">
                                {invoices.map((i) => (
                                    <li key={i.id} className="py-3 flex items-center justify-between gap-3">
                                        <div className="min-w-0"><p className="font-bold text-sm">{i.invoiceNumber}</p><p className="text-xs text-muted-foreground">Échéance {dateFr(i.dueDate)}{i.paidDate ? ` · payée le ${dateFr(i.paidDate)}` : ""}</p></div>
                                        <div className="flex items-center gap-3 shrink-0"><span className="font-bold text-sm tabular-nums">{fcfa(i.total)}</span><Badge map={STATUT_FACTURE} value={i.status} /></div>
                                    </li>
                                ))}
                            </ul>
                        ))}
                        {onglet === "temps" && (times.length === 0 ? (
                            <EmptyState size="compact" icon={Clock} title="Aucun temps saisi" description="Les heures passées sur ce dossier alimentent sa rentabilité." action={{ label: "Saisir du temps", href: "/timesheets" }} />
                        ) : (
                            <ul className="divide-y divide-border">
                                {times.slice(0, 30).map((t) => (
                                    <li key={t.id} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                                        <div className="min-w-0"><p className="truncate">{t.description || t.category}</p><p className="text-xs text-muted-foreground">{dateFr(t.date)} · {t.user ? `${t.user.firstName} ${t.user.lastName}` : ""}</p></div>
                                        <span className="font-bold tabular-nums shrink-0">{t.duration} h</span>
                                    </li>
                                ))}
                            </ul>
                        ))}
                        {onglet === "documents" && (docs.length === 0 ? (
                            <EmptyState size="compact" icon={FolderOpen} title="Aucun document" description="Déposez factures et relevés : l'OCR en extrait les montants." action={{ label: "Scanner une pièce", href: "/scan" }} />
                        ) : (
                            <ul className="divide-y divide-border">
                                {docs.map((d) => (
                                    <li key={d.id} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                                        <div className="min-w-0"><p className="truncate font-medium">{d.fileName.replace(/^\d+-/, "")}</p><p className="text-xs text-muted-foreground">{d.type} · {dateFr(d.createdAt)}</p></div>
                                        <span className={cn("px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0", d.status === "PROCESSED" ? "bg-emerald-100 text-emerald-700" : d.status === "ERROR" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700")}>{d.status}</span>
                                    </li>
                                ))}
                            </ul>
                        ))}
                        {onglet === "lettres" && (letters.length === 0 ? (
                            <EmptyState size="compact" icon={PenTool} title="Aucune lettre de mission" description="Formalisez la relation : objet, honoraires, signature électronique." action={{ label: "Rédiger une lettre", href: "/lettres-mission" }} />
                        ) : (
                            <ul className="divide-y divide-border">
                                {letters.map((l) => (
                                    <li key={l.id} className="py-3 flex items-center justify-between gap-3">
                                        <div className="min-w-0"><p className="font-bold text-sm">{l.reference}</p><p className="text-xs text-muted-foreground">{l.fees ? fcfa(l.fees) : "Honoraires non fixés"}{l.signedAt ? ` · signée le ${dateFr(l.signedAt)}` : ""}</p></div>
                                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 shrink-0">{l.status}</span>
                                    </li>
                                ))}
                            </ul>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
