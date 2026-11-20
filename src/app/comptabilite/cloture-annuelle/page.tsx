"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarCheck2, CheckCircle2, Circle, LockKeyhole, RefreshCw, ShieldCheck } from "lucide-react";

type Client = { id: string; companyName: string | null; firstName: string | null; lastName: string | null };
type Item = { id: string; key: string; title: string; status: string; evidence: string | null; notes: string | null; assignedToId: string | null; assignedTo?: { id: string; firstName: string; lastName: string } | null; completedBy?: { firstName: string; lastName: string } | null; completedAt: string | null };
type Close = { id: string; status: string; closedAt: string | null; closedBy?: { firstName: string; lastName: string } | null; items: Item[] };
type Period = { periode: string; verrouillee: boolean; lock: { lockedAt: string; reason: string } | null };
type TeamMember = { id: string; nom: string; role: string };

const nomClient = (client: Client) => client.companyName || [client.firstName, client.lastName].filter(Boolean).join(" ") || "Client sans nom";
const mois = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

export default function ClotureAnnuellePage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState("");
  const [fiscalYear, setFiscalYear] = useState(new Date().getFullYear() - 1);
  const [close, setClose] = useState<Close | null>(null);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [pendingEntries, setPendingEntries] = useState(0);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/clients?limit=500&isActive=true").then((r) => r.json()).then((d) => {
      const loaded = (d.clients ?? []) as Client[]; setClients(loaded); setClientId(loaded[0]?.id ?? "");
    }).catch(() => setError("Impossible de charger les clients."));
    fetch("/api/annuaire").then((r) => r.json()).then((d) => setTeam(d.membres ?? [])).catch(() => setTeam([]));
  }, []);

  const load = useCallback(async () => {
    if (!clientId) { setClose(null); setPeriods([]); return; }
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/comptabilite/cloture-annuelle?clientId=${encodeURIComponent(clientId)}&fiscalYear=${fiscalYear}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Chargement impossible.");
      setClose(data.close); setPeriods(data.periods ?? []); setPendingEntries(data.pendingEntries ?? 0); setRole(data.currentRole ?? "");
    } catch (e) { setError(e instanceof Error ? e.message : "Chargement impossible."); }
    finally { setLoading(false); }
  }, [clientId, fiscalYear]);
  useEffect(() => { void load(); }, [load]);

  const progression = useMemo(() => close?.items.length ? Math.round(close.items.filter((item) => item.status === "DONE").length / close.items.length * 100) : 0, [close]);
  const periodsLocked = periods.filter((period) => period.verrouillee).length;
  const estExpert = role === "EXPERT" || role === "ADMIN";

  const startClose = async () => {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/comptabilite/cloture-annuelle", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "START", clientId, fiscalYear }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error ?? "Démarrage impossible."); await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Démarrage impossible."); }
    finally { setBusy(false); }
  };

  const saveItem = async (item: Item, nextStatus: string) => {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/comptabilite/cloture-annuelle", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ itemId: item.id, status: nextStatus, evidence: item.evidence, notes: item.notes, assignedToId: item.assignedToId }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error ?? "Mise à jour impossible.");
      setClose((current) => current ? { ...current, items: current.items.map((row) => row.id === item.id ? { ...row, ...data.item } : row) } : current);
    } catch (e) { setError(e instanceof Error ? e.message : "Mise à jour impossible."); }
    finally { setBusy(false); }
  };

  const mutateClose = async (action: "CLOSE" | "REOPEN") => {
    const reason = action === "REOPEN" ? window.prompt("Motif de réouverture de l’exercice (10 caractères minimum)") : null;
    if (action === "REOPEN" && !reason) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/comptabilite/cloture-annuelle", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, clientId, fiscalYear, reason }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error ?? "Action impossible."); await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Action impossible."); }
    finally { setBusy(false); }
  };

  const updateItem = (itemId: string, patch: Partial<Item>) => setClose((current) => current ? { ...current, items: current.items.map((item) => item.id === itemId ? { ...item, ...patch } : item) } : current);

  return <main className="mx-auto max-w-6xl space-y-6 p-4 sm:p-8">
    <header className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Comptabilité · contrôle de clôture</p><h1 className="mt-1 text-2xl font-black text-white">Clôture annuelle guidée</h1><p className="mt-1 max-w-2xl text-sm text-slate-400">Responsables, pièces justificatives, rapprochements, contrôles et verrouillage des douze périodes.</p></div><button onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />Actualiser</button></header>
    <section className="apix-card grid gap-4 md:grid-cols-[1fr_180px_auto] md:items-end"><label className="text-xs font-bold text-slate-400">Dossier client<select value={clientId} onChange={(e) => setClientId(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 p-3 text-sm text-white"><option value="">Sélectionner un client</option>{clients.map((client) => <option key={client.id} value={client.id}>{nomClient(client)}</option>)}</select></label><label className="text-xs font-bold text-slate-400">Exercice<input type="number" min="2000" max="2100" value={fiscalYear} onChange={(e) => setFiscalYear(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 p-3 text-sm text-white" /></label>{close?.status === "CLOSED" ? <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-300"><ShieldCheck className="h-4 w-4" />Exercice clôturé</span> : <span className="inline-flex items-center gap-2 rounded-lg bg-amber-500/10 px-4 py-3 text-sm font-bold text-amber-300"><CalendarCheck2 className="h-4 w-4" />{close ? `${progression}% terminé` : "Non démarré"}</span>}</section>
    {error && <p role="alert" className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}
    {loading ? <div className="apix-card text-sm text-slate-400">Chargement de l’exercice…</div> : !clientId ? <div className="apix-card text-sm text-slate-400">Sélectionnez un client.</div> : !close ? <section className="apix-card space-y-3"><h2 className="font-bold text-white">Aucune clôture enregistrée pour {fiscalYear}</h2><p className="text-sm text-slate-400">Démarrez la liste de contrôle pour ce dossier; les pièces et responsables seront conservés au fil de l’exercice.</p><button disabled={busy} onClick={() => void startClose()} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Démarrer la clôture</button></section> : <>
      <section className="apix-card space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold text-white">Périodes comptables</h2><p className="text-sm text-slate-400">{periodsLocked}/12 verrouillées · {pendingEntries} écriture(s) TPE encore en attente</p></div><Link href="/etats-financiers/import" className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-slate-200">Ouvrir la balance et les verrous mensuels</Link></div><div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">{periods.map((period, index) => <div key={period.periode} className={`rounded-lg border p-3 ${period.verrouillee ? "border-emerald-500/20 bg-emerald-500/5" : "border-amber-500/20 bg-amber-500/5"}`}><div className="flex items-center gap-2">{period.verrouillee ? <LockKeyhole className="h-3.5 w-3.5 text-emerald-300" /> : <Circle className="h-3.5 w-3.5 text-amber-300" />}<span className="text-xs font-bold text-white">{mois[index]}</span></div><p className="mt-1 text-[10px] text-slate-400">{period.verrouillee ? "Verrouillée" : "À verrouiller"}</p></div>)}</div></section>
      <section className="space-y-3"><div className="flex items-end justify-between"><div><h2 className="text-lg font-bold text-white">Liste de contrôle · {fiscalYear}</h2><p className="text-sm text-slate-400">Une référence de pièce ou de contrôle est requise pour terminer chaque étape.</p></div><span className="text-sm font-black text-primary">{progression}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full bg-primary transition-all" style={{ width: `${progression}%` }} /></div>
        {close.items.map((item) => <article key={item.id} className={`apix-card space-y-3 ${close.status === "CLOSED" ? "opacity-80" : ""}`}><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2">{item.status === "DONE" ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Circle className="h-4 w-4 text-slate-500" />}<h3 className="font-semibold text-white">{item.title}</h3></div>{item.completedBy && <span className="text-[10px] text-slate-500">Terminé par {item.completedBy.firstName} {item.completedBy.lastName}</span>}</div>
          <div className="grid gap-3 md:grid-cols-3"><label className="text-[11px] font-bold text-slate-500">Référence de pièce / contrôle<input disabled={close.status === "CLOSED"} value={item.evidence ?? ""} onChange={(e) => updateItem(item.id, { evidence: e.target.value })} placeholder="Ex. rapprochement bancaire, pièce P-12" className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 p-2 text-sm text-white disabled:opacity-70" /></label><label className="text-[11px] font-bold text-slate-500">Responsable<select disabled={close.status === "CLOSED"} value={item.assignedToId ?? ""} onChange={(e) => updateItem(item.id, { assignedToId: e.target.value || null })} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 p-2 text-sm text-white disabled:opacity-70"><option value="">Non assigné</option>{team.map((member) => <option key={member.id} value={member.id}>{member.nom} · {member.role}</option>)}</select></label><label className="text-[11px] font-bold text-slate-500">Notes<textarea disabled={close.status === "CLOSED"} value={item.notes ?? ""} onChange={(e) => updateItem(item.id, { notes: e.target.value })} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 p-2 text-sm text-white disabled:opacity-70" rows={1} /></label></div>
          {close.status === "OPEN" && <div className="flex justify-end gap-2"><button disabled={busy} onClick={() => void saveItem(item, "PENDING")} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 disabled:opacity-40">Enregistrer</button><button disabled={busy} onClick={() => void saveItem(item, item.status === "DONE" ? "PENDING" : "DONE")} className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-40">{item.status === "DONE" ? "Rouvrir ce contrôle" : "Terminer avec preuve"}</button></div>}
        </article>)}
      </section>
      <footer className="apix-card flex flex-wrap items-center justify-between gap-4"><div><p className="font-bold text-white">Clôture définitive de l’exercice</p><p className="text-xs text-slate-400">Requiert tous les contrôles terminés, douze périodes verrouillées, aucune écriture en attente et une validation experte.</p>{close.closedBy && <p className="mt-1 text-xs text-emerald-300">Validé par {close.closedBy.firstName} {close.closedBy.lastName} · {close.closedAt ? new Date(close.closedAt).toLocaleString("fr-FR") : ""}</p>}</div>{close.status === "CLOSED" ? estExpert && <button disabled={busy} onClick={() => void mutateClose("REOPEN")} className="rounded-lg border border-amber-500/20 px-4 py-2 text-sm font-bold text-amber-300">Rouvrir avec motif</button> : estExpert && <button disabled={busy} onClick={() => void mutateClose("CLOSE")} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-40">Clôturer l’exercice</button>}</footer>
    </>}
  </main>;
}
