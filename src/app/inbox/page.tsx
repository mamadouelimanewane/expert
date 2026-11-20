"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowUpRight, Bell, Check, ClipboardList, FileCheck2, RefreshCw, ShieldCheck } from "lucide-react";

type Item = { id: string; category: string; kind: string; title: string; detail: string; href: string; createdAt: string; priority: number };
const CATEGORY_LABEL: Record<string, string> = {
  NOTIFICATION: "Notification", TASK: "Tâche", MISSION_REVIEW: "Mission à réviser", AUDIT_REVIEW: "Point de revue",
  AUDIT_SAMPLE: "Échantillonnage", ACCOUNTING_VALIDATION: "Écriture à valider", DOCUMENT_REVIEW: "Document à vérifier",
  CLIENT_REQUEST: "Demande client", OVERDUE_INVOICE: "Facture en retard",
};
const FILTERS = [{ id: "ALL", label: "Tout" }, { id: "TASK", label: "Tâches" }, { id: "REVIEW", label: "Revues" }, { id: "VALIDATION", label: "Validations" }, { id: "ALERT", label: "Alertes" }];

function appartientAuFiltre(item: Item, filter: string) {
  if (filter === "ALL") return true;
  if (filter === "TASK") return item.category === "TASK";
  if (filter === "REVIEW") return ["MISSION_REVIEW", "AUDIT_REVIEW", "AUDIT_SAMPLE"].includes(item.category);
  if (filter === "VALIDATION") return ["ACCOUNTING_VALIDATION", "DOCUMENT_REVIEW", "CLIENT_REQUEST"].includes(item.category);
  return ["NOTIFICATION", "OVERDUE_INVOICE"].includes(item.category) || item.priority >= 4;
}

export default function InboxPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/inbox");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Chargement impossible.");
      setItems(data.items ?? []);
    } catch (e) { setError(e instanceof Error ? e.message : "Chargement impossible."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const visible = useMemo(() => items.filter((item) => appartientAuFiltre(item, filter)), [items, filter]);
  const unreadNotifications = items.filter((item) => item.category === "NOTIFICATION").length;

  const markRead = async (id: string) => {
    const response = await fetch("/api/inbox", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ notificationId: id }) });
    if (!response.ok) { setError("La notification n’a pas pu être marquée comme lue."); return; }
    setItems((current) => current.filter((item) => !(item.category === "NOTIFICATION" && item.id === id)));
  };

  return <main className="mx-auto max-w-6xl space-y-6 p-4 sm:p-8">
    <header className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Pilotage du cabinet</p><h1 className="mt-1 text-2xl font-black text-white">Boîte de réception</h1><p className="mt-1 text-sm text-slate-400">Travaux, validations, revues et anomalies enregistrés dans le cabinet.</p></div><button onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200 disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />Actualiser</button></header>
    <div className="grid gap-3 sm:grid-cols-3"><div className="apix-card flex items-center gap-3"><ClipboardList className="h-5 w-5 text-primary" /><div><p className="text-xl font-black text-white">{items.filter((item) => item.category === "TASK").length}</p><p className="text-xs text-slate-400">Tâches en cours</p></div></div><div className="apix-card flex items-center gap-3"><FileCheck2 className="h-5 w-5 text-amber-300" /><div><p className="text-xl font-black text-white">{items.filter((item) => ["ACCOUNTING_VALIDATION", "DOCUMENT_REVIEW", "CLIENT_REQUEST"].includes(item.category)).length}</p><p className="text-xs text-slate-400">Validations et demandes</p></div></div><div className="apix-card flex items-center gap-3"><Bell className="h-5 w-5 text-rose-300" /><div><p className="text-xl font-black text-white">{items.filter((item) => item.priority >= 4).length}</p><p className="text-xs text-slate-400">Éléments prioritaires · {unreadNotifications} notifications non lues</p></div></div></div>
    <nav className="flex flex-wrap gap-2" aria-label="Filtrer la boîte de réception">{FILTERS.map((entry) => <button key={entry.id} onClick={() => setFilter(entry.id)} aria-pressed={filter === entry.id} className={`rounded-full px-4 py-2 text-xs font-bold ${filter === entry.id ? "bg-primary text-white" : "border border-white/10 text-slate-300 hover:bg-white/5"}`}>{entry.label}</button>)}</nav>
    {error && <p role="alert" className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}
    {loading ? <p className="apix-card text-sm text-slate-400">Chargement des éléments à traiter…</p> : visible.length === 0 ? <div className="apix-card py-12 text-center"><ShieldCheck className="mx-auto h-10 w-10 text-emerald-400" /><h2 className="mt-3 font-bold text-white">Rien à traiter dans cette vue</h2><p className="mt-1 text-sm text-slate-400">Cette boîte rassemble uniquement les éléments réels encore ouverts.</p></div> : <div className="space-y-3">{visible.map((item) => <article key={`${item.category}-${item.id}`} className="apix-card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-white/5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">{CATEGORY_LABEL[item.category] ?? item.category}</span>{item.priority >= 4 && <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-1 text-[10px] font-bold text-rose-300"><AlertTriangle className="h-3 w-3" />Prioritaire</span>}</div><h2 className="mt-2 truncate font-bold text-white">{item.title}</h2><p className="mt-1 text-sm text-slate-400">{item.detail}</p><p className="mt-1 text-[11px] text-slate-500">{new Date(item.createdAt).toLocaleString("fr-FR")}</p></div><div className="flex shrink-0 items-center gap-2"><Link href={item.href} className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/20">Ouvrir<ArrowUpRight className="h-3.5 w-3.5" /></Link>{item.category === "NOTIFICATION" && <button onClick={() => void markRead(item.id)} className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300"><Check className="h-3.5 w-3.5" />Lu</button>}</div></article>)}</div>}
  </main>;
}
