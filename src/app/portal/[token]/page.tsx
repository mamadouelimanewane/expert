"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  TrendingUp, Upload, FileText, Bell, Banknote, Calendar,
  CheckCircle, Clock, ArrowRight, Smartphone, Shield,
  ChevronUp, ChevronDown, Award, AlertTriangle, Zap,
  Loader2, XCircle, Building2, Globe, Copy, Check, Camera,
  Send, MessageCircle
} from "lucide-react";

interface ClientData {
  id: string;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  sector?: string;
  country: string;
  rccm?: string;
  healthScore?: number;
  rating?: string;
  portalEnabled: boolean;
  portalCreatedAt?: string;
  tpeJournals: any[];
  missions: any[];
  declarations: any[];
  documents: any[];
  _count: { tpeJournals: number; missions: number; invoices: number };
}

const RATING_COLOR: Record<string, string> = {
  AAA: "#10b981", AA: "#6366f1", A: "#3b82f6", B: "#f59e0b", C: "#ef4444"
};

// Composant jauge inline
function MiniGauge({ score, color }: { score: number; color: string }) {
  return (
    <div className="relative w-full h-3 bg-white/5 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${score}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }}
      />
    </div>
  );
}

export default function PortalByToken() {
  const params = useParams();
  const token = params?.token as string;

  const [client, setClient] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"dashboard" | "saisie" | "documents">("dashboard");
  const [copied, setCopied] = useState(false);

  // Saisie rapide
  const [quickEntry, setQuickEntry] = useState({ date: "", libelle: "", montant: "", type: "recette" });
  const [sending, setSending] = useState(false);
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/portal/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); }
        else { setClient(data.client); setEntries(data.client.tpeJournals || []); }
      })
      .catch(() => setError("Impossible de charger le portail."))
      .finally(() => setLoading(false));
  }, [token]);

  const handleQuickSubmit = async () => {
    if (!quickEntry.libelle || !quickEntry.montant) return;
    setSending(true);
    // Simuler l'envoi — en prod: POST /api/portal/[token]/entries
    await new Promise(r => setTimeout(r, 800));
    const newEntry = {
      id: Date.now().toString(),
      date: quickEntry.date || new Date().toISOString().slice(0, 10),
      description: quickEntry.libelle,
      debitAmount: quickEntry.type === "depense" ? parseFloat(quickEntry.montant) : 0,
      creditAmount: quickEntry.type === "recette" ? parseFloat(quickEntry.montant) : 0,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    setEntries(prev => [newEntry, ...prev]);
    setQuickEntry({ date: "", libelle: "", montant: "", type: "recette" });
    setSending(false);
  };

  const clientName = client?.companyName || `${client?.firstName || ""} ${client?.lastName || ""}`.trim() || "Client";
  const score = client?.healthScore || 0;
  const rating = client?.rating || "—";
  const ratingColor = RATING_COLOR[rating] || "#64748b";

  // === LOADING ===
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center">
        <div className="text-center space-y-4 animate-pulse">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Chargement de votre portail…</p>
        </div>
      </div>
    );
  }

  // === ERROR ===
  if (error || !client) {
    return (
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-slate-900/60 border border-rose-500/20 rounded-[28px] p-10 text-center space-y-4">
          <XCircle className="w-16 h-16 text-rose-500 mx-auto" />
          <h2 className="text-2xl font-black text-white">Portail inaccessible</h2>
          <p className="text-slate-400 text-sm">{error || "Ce lien de portail n'est pas valide."}</p>
          <p className="text-slate-600 text-xs">Contactez votre cabinet comptable pour obtenir un lien valide.</p>
        </div>
      </div>
    );
  }

  // === PORTAIL PRINCIPAL ===
  return (
    <div className="min-h-screen bg-[#0a0a12] text-white">

      {/* Header portail */}
      <header className="bg-gradient-to-r from-indigo-900/30 to-violet-900/20 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xl font-black shadow-lg shadow-indigo-500/20">
              {clientName.charAt(0)}
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight">{clientName}</h1>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <Globe className="w-3 h-3" /> {client.country}
                {client.sector && <> · {client.sector}</>}
                {client.rccm && <> · RCCM: {client.rccm}</>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xl sm:text-2xl lg:text-3xl font-black tabular-nums" style={{ color: ratingColor }}>{score}</p>
              <p className="text-[10px] text-slate-500 font-bold">Score Santé</p>
            </div>
            <div className="px-3 py-1.5 rounded-xl text-xs font-black border"
              style={{ color: ratingColor, background: ratingColor + "15", borderColor: ratingColor + "30" }}>
              {rating}
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex gap-1 mt-6 bg-slate-900/40 rounded-2xl p-1.5 border border-white/5 w-fit">
          {([
            { key: "dashboard", label: "Mon Tableau de Bord", icon: TrendingUp },
            { key: "saisie", label: "Saisie Rapide", icon: Upload },
            { key: "documents", label: "Mes Documents", icon: FileText },
          ] as const).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                tab === t.key ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:text-white"
              }`}>
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* === TAB DASHBOARD === */}
        {tab === "dashboard" && (
          <>
            {/* Score & Stats */}
            <div className="grid sm:grid-cols-4 gap-4">
              <div className="sm:col-span-2 bg-gradient-to-br from-indigo-600/20 to-violet-600/10 border border-indigo-500/20 rounded-[24px] p-6 flex items-center gap-6">
                <div className="text-center">
                  <p className="text-6xl font-black tabular-nums" style={{ color: ratingColor }}>{score}</p>
                  <p className="text-lg font-black text-white mt-1">{rating}</p>
                  <p className="text-[10px] text-slate-500 mt-1">Score / 100</p>
                </div>
                <div className="flex-1 space-y-3">
                  <MiniGauge score={score} color={ratingColor} />
                  <p className="text-xs text-slate-400">
                    {score >= 70 ? "✅ Excellent — éligible au crédit bancaire" :
                     score >= 50 ? "⚡ Bon — quelques améliorations possibles" :
                     "⚠️ À améliorer — accompagnement recommandé"}
                  </p>
                </div>
              </div>
              {[
                { label: "Écritures envoyées", val: client._count.tpeJournals, icon: Upload, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
                { label: "Missions en cours", val: client._count.missions, icon: Clock, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
              ].map((s, i) => (
                <div key={i} className={`rounded-[20px] border p-5 ${s.color}`}>
                  <s.icon className="w-5 h-5 mb-3" />
                  <p className="text-xl sm:text-2xl lg:text-3xl font-black tabular-nums">{s.val}</p>
                  <p className="text-xs mt-1 opacity-70">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Dernières écritures */}
            <div className="bg-slate-900/40 border border-white/5 rounded-[24px] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-indigo-400" /> Mes Dernières Opérations
                </h3>
                <button onClick={() => setTab("saisie")} className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1">
                  Ajouter <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              {entries.length === 0 ? (
                <div className="text-center py-12">
                  <Upload className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">Aucune écriture pour le moment</p>
                  <button onClick={() => setTab("saisie")} className="mt-3 text-indigo-400 text-xs font-bold">
                    Commencer la saisie →
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {entries.slice(0, 8).map((e: any, i: number) => (
                    <div key={e.id || i} className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl border border-white/5">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${e.creditAmount > 0 ? "bg-emerald-400" : "bg-rose-400"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">{e.description || "Opération"}</p>
                        <p className="text-[10px] text-slate-500">{new Date(e.createdAt).toLocaleDateString("fr-FR")}</p>
                      </div>
                      <span className={`text-xs font-black tabular-nums flex-shrink-0 ${e.creditAmount > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {e.creditAmount > 0 ? `+${e.creditAmount.toLocaleString()}` : `-${e.debitAmount.toLocaleString()}`} F
                      </span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-black border flex-shrink-0 ${
                        e.status === "approved" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
                        e.status === "rejected" ? "text-rose-400 bg-rose-500/10 border-rose-500/20" :
                        "text-amber-400 bg-amber-500/10 border-amber-500/20"
                      }`}>
                        {e.status === "approved" ? "validé" : e.status === "rejected" ? "rejeté" : "en attente"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Missions & échéances */}
            {client.missions.length > 0 && (
              <div className="bg-slate-900/40 border border-white/5 rounded-[24px] p-6">
                <h3 className="font-black flex items-center gap-2 text-sm mb-4">
                  <Calendar className="w-4 h-4 text-indigo-400" /> Échéances Fiscales
                </h3>
                <div className="space-y-2">
                  {client.missions.map((m: any) => (
                    <div key={m.id} className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl border border-white/5">
                      <Clock className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      <p className="text-xs font-bold flex-1">{m.title}</p>
                      {m.deadline && (
                        <span className="text-[10px] text-slate-400 font-bold">
                          {new Date(m.deadline).toLocaleDateString("fr-FR")}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* === TAB SAISIE RAPIDE === */}
        {tab === "saisie" && (
          <div className="space-y-6">
            <div className="bg-slate-900/40 border border-white/5 rounded-[28px] p-8">
              <h3 className="text-lg font-black mb-2 flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-400" /> Saisie Rapide
              </h3>
              <p className="text-slate-500 text-xs mb-6">Envoyez vos recettes et dépenses directement à votre cabinet. Zéro jargon comptable.</p>

              <div className="space-y-4">
                {/* Type */}
                <div className="flex gap-3">
                  {[
                    { key: "recette", label: "💰 Recette", color: "emerald" },
                    { key: "depense", label: "💸 Dépense", color: "rose" },
                  ].map(t => (
                    <button key={t.key} onClick={() => setQuickEntry(p => ({ ...p, type: t.key }))}
                      className={`flex-1 py-3 rounded-xl text-sm font-black border transition-all ${
                        quickEntry.type === t.key
                          ? t.color === "emerald" ? "bg-emerald-600/20 text-emerald-400 border-emerald-500/30" : "bg-rose-600/20 text-rose-400 border-rose-500/30"
                          : "bg-slate-800/50 text-slate-500 border-white/5"
                      }`}>
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Champs */}
                <div className="grid sm:grid-cols-3 gap-3">
                  <input type="date" value={quickEntry.date} onChange={e => setQuickEntry(p => ({ ...p, date: e.target.value }))}
                    className="bg-slate-800 border border-white/5 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  <input placeholder="Ex: Vente marchandises" value={quickEntry.libelle} onChange={e => setQuickEntry(p => ({ ...p, libelle: e.target.value }))}
                    className="bg-slate-800 border border-white/5 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  <input type="number" placeholder="Montant (FCFA)" value={quickEntry.montant} onChange={e => setQuickEntry(p => ({ ...p, montant: e.target.value }))}
                    className="bg-slate-800 border border-white/5 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>

                <button onClick={handleQuickSubmit} disabled={!quickEntry.libelle || !quickEntry.montant || sending}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-2xl font-black text-sm transition-colors flex items-center justify-center gap-2">
                  {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Envoi…</> : <><Send className="w-4 h-4" /> Envoyer au cabinet</>}
                </button>
              </div>
            </div>

            {/* Options alternatives */}
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { icon: Camera, label: "Scanner une facture", desc: "OCR automatique", color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
                { icon: MessageCircle, label: "Envoyer par WhatsApp", desc: "Photo + message vocal", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
                { icon: Smartphone, label: "Sync Mobile Money", desc: "Orange, MTN, Wave", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
              ].map(o => (
                <button key={o.label} className={`p-5 rounded-2xl border text-left transition-all hover:scale-[1.02] ${o.color}`}>
                  <o.icon className="w-5 h-5 mb-2" />
                  <p className="text-xs font-black">{o.label}</p>
                  <p className="text-[10px] opacity-60 mt-0.5">{o.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* === TAB DOCUMENTS === */}
        {tab === "documents" && (
          <div className="space-y-4">
            <div className="bg-slate-900/40 border border-white/5 rounded-[24px] p-6">
              <h3 className="font-black flex items-center gap-2 text-sm mb-4">
                <FileText className="w-4 h-4 text-indigo-400" /> Documents & Déclarations
              </h3>
              {(!client.documents || client.documents.length === 0) ? (
                <div className="text-center py-12">
                  <FileText className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">Aucun document disponible</p>
                  <p className="text-slate-600 text-xs mt-1">Vos déclarations et bilans apparaîtront ici une fois traités par votre cabinet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {client.documents.map((d: any) => (
                    <a 
                      key={d.id} 
                      href={d.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 p-4 bg-slate-800/40 hover:bg-slate-800/60 rounded-xl border border-white/5 transition-colors group cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate text-white">{d.originalName || d.fileName}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Ajouté le: {new Date(d.createdAt).toLocaleDateString("fr-FR")}</p>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-black border text-emerald-400 bg-emerald-500/10 border-emerald-500/20 uppercase">
                        Nouveau
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Infos portail */}
            <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-5 flex items-start gap-3">
              <Shield className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-indigo-400 font-bold text-xs">Portail sécurisé</p>
                <p className="text-slate-500 text-[10px] mt-0.5">
                  Votre portail est accessible uniquement via ce lien unique. Vos données sont chiffrées et protégées.
                  Portail créé le {client.portalCreatedAt ? new Date(client.portalCreatedAt).toLocaleDateString("fr-FR") : "—"}.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-12 py-6 text-center">
        <p className="text-slate-600 text-[10px]">Portail PMI — Cabinet 360 OHADA · Confidentiel · Alimenté par IA</p>
      </footer>
    </div>
  );
}
