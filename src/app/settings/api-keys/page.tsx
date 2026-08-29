"use client";

import { useState, useEffect } from "react";
import {
  Code2, Key, Copy, Check, Trash2, Plus, AlertTriangle,
  Activity, Webhook, ExternalLink, ChevronDown, ChevronUp, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

const ENDPOINTS = [
  { method: "GET", path: "/api/clients", description: "Lister les clients du cabinet" },
  { method: "POST", path: "/api/clients", description: "Créer un nouveau client" },
  { method: "GET", path: "/api/invoices", description: "Lister les factures" },
  { method: "GET", path: "/api/missions", description: "Lister les missions" },
];

interface ApiKeyRow { id: string; label: string; keyPrefix: string; scopes: string[]; status: string; lastUsedAt: string | null; createdAt: string; }
interface LogRow { id: string; endpoint: string; method: string; statusCode: number; createdAt: string; apiKey: { label: string; keyPrefix: string } | null; }
interface WebhookRow { id: string; url: string; event: string; isActive: boolean; createdAt: string; }

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [newKeyLabel, setNewKeyLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [expandedEndpoint, setExpandedEndpoint] = useState<number | null>(0);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookEvent, setWebhookEvent] = useState("invoice.created");

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/settings/api-keys").then(r => r.json()),
      fetch("/api/settings/webhooks").then(r => r.json()),
    ]).then(([keysData, whData]) => {
      setKeys(keysData.apiKeys ?? []);
      setLogs(keysData.logs ?? []);
      setWebhooks(whData.webhooks ?? []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleRevoke = async (id: string) => {
    await fetch("/api/settings/api-keys", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  };

  const handleGenerateKey = async () => {
    if (!newKeyLabel.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/settings/api-keys", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ label: newKeyLabel }) });
      const data = await res.json();
      if (res.ok) { setNewKey(data.plaintextKey); setNewKeyLabel(""); load(); }
    } finally {
      setCreating(false);
    }
  };

  const handleAddWebhook = async () => {
    if (!webhookUrl) return;
    const res = await fetch("/api/settings/webhooks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: webhookUrl, event: webhookEvent }) });
    if (res.ok) { setWebhookUrl(""); load(); }
  };

  const handleDeleteWebhook = async (id: string) => {
    await fetch(`/api/settings/webhooks?id=${id}`, { method: "DELETE" });
    load();
  };

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-cyan-500" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in zoom-in-95 duration-700 pb-16">

      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Code2 className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="page-title">Developer Hub & API</h1>
          <p className="page-subtitle">Clés API et webhooks pour connecter vos outils à Cabinet 360.</p>
        </div>
      </div>

      <div className="glass-card rounded-[32px] border border-white/5 bg-slate-900/40 overflow-hidden">
        <div className="p-8 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-cyan-400" /> Clés API
          </h2>
          <div className="flex gap-2">
            <input
              placeholder="Nom de la clé"
              value={newKeyLabel}
              onChange={(e) => setNewKeyLabel(e.target.value)}
              className="px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500"
            />
            <button
              onClick={handleGenerateKey}
              disabled={creating || !newKeyLabel.trim()}
              className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-cyan-600/20"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Générer
            </button>
          </div>
        </div>

        {newKey && (
          <div className="mx-6 mt-6 p-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-start gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-amber-400 font-bold text-sm">Copiez cette clé maintenant, elle ne sera plus jamais affichée.</p>
            </div>
            <div className="flex items-center gap-3 bg-black/30 rounded-xl p-4 font-mono text-sm text-emerald-400">
              <span className="flex-1 break-all">{newKey}</span>
              <button onClick={() => handleCopy(newKey, "new")} className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg text-emerald-400 transition-all shrink-0">
                {copied === "new" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <button onClick={() => setNewKey(null)} className="mt-3 text-xs text-slate-500 hover:text-white transition-colors">
              J'ai copié ma clé ✓
            </button>
          </div>
        )}

        <div className="p-6 space-y-4">
          {keys.length === 0 ? (
            <p className="text-center text-slate-500 text-sm py-6">Aucune clé API générée.</p>
          ) : keys.map((k) => (
            <div key={k.id} className="p-5 rounded-2xl bg-slate-950/50 border border-white/5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-sm font-bold text-white">{k.label}</h3>
                  <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-black uppercase", k.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400")}>
                    {k.status}
                  </span>
                </div>
                <code className="font-mono text-xs text-slate-400 bg-slate-800 px-3 py-1.5 rounded-lg inline-block">{k.keyPrefix}••••••••••••</code>
                <div className="flex gap-6 mt-2">
                  <span className="text-[10px] text-slate-600">Créée le {new Date(k.createdAt).toLocaleDateString("fr-FR")}</span>
                  <span className="text-[10px] text-slate-600">Dernière utilisation: {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString("fr-FR") : "Jamais"}</span>
                </div>
              </div>
              {k.status === "ACTIVE" && (
                <button onClick={() => handleRevoke(k.id)} className="flex items-center gap-2 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl text-xs font-bold text-rose-400 transition-all border border-rose-500/20 shrink-0">
                  <Trash2 className="w-3.5 h-3.5" /> Révoquer
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-black text-white flex items-center gap-2">
          <ExternalLink className="w-5 h-5 text-cyan-400" /> Endpoints Disponibles
        </h2>
        {ENDPOINTS.map((ep, i) => (
          <div key={i} className="glass-card rounded-[24px] border border-white/5 bg-slate-900/40 overflow-hidden">
            <button className="w-full p-6 flex items-center gap-4 text-left hover:bg-white/3 transition-colors" onClick={() => setExpandedEndpoint(expandedEndpoint === i ? null : i)}>
              <span className={cn("px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest shrink-0", ep.method === "GET" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20")}>
                {ep.method}
              </span>
              <code className="font-mono text-sm text-cyan-300 flex-1">{ep.path}</code>
              <span className="text-xs text-slate-500 hidden sm:block">{ep.description}</span>
              {expandedEndpoint === i ? <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
            </button>
            {expandedEndpoint === i && (
              <div className="border-t border-white/5 p-6 space-y-2 animate-in fade-in duration-200">
                <p className="text-xs text-slate-400">Authentification requise via session — l'authentification par clé API (Bearer token) pour un usage externe n'est pas encore implémentée côté serveur.</p>
                <pre className="bg-[#0a0f1a] border border-white/10 rounded-xl p-5 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
{`curl -X ${ep.method} "https://votre-domaine.com${ep.path}" \\
  -H "Cookie: next-auth.session-token=..."`}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="glass-card rounded-[28px] border border-white/5 bg-slate-900/40 overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" /> Logs API récents
          </h3>
        </div>
        {logs.length === 0 ? (
          <p className="text-center text-slate-500 text-sm py-8">Aucune requête authentifiée par clé API pour le moment.</p>
        ) : (
          <div className="divide-y divide-white/5">
            {logs.map((log) => (
              <div key={log.id} className="px-5 py-3 flex items-center gap-3 text-xs hover:bg-white/3 transition-colors">
                <span className={cn("px-2 py-0.5 rounded font-mono font-black text-[10px] shrink-0", log.method === "GET" ? "bg-blue-500/10 text-blue-400" : log.method === "POST" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400")}>{log.method}</span>
                <code className="font-mono text-slate-400 flex-1 truncate text-[11px]">{log.endpoint}</code>
                <span className={cn("font-bold shrink-0", log.statusCode < 300 ? "text-emerald-400" : "text-rose-400")}>{log.statusCode}</span>
                <span className="text-slate-600 shrink-0">{new Date(log.createdAt).toLocaleTimeString("fr-FR")}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="apix-card">
        <h2 className="text-lg font-black text-white flex items-center gap-2 mb-6">
          <Webhook className="w-5 h-5 text-violet-400" /> Webhooks
        </h2>

        <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
          <input
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://votre-app.com/webhooks/cabinet360"
            className="flex-1 w-full px-4 py-3 bg-slate-950/50 border border-white/10 focus:border-violet-500 rounded-xl text-white outline-none font-mono text-sm transition-all"
          />
          <select value={webhookEvent} onChange={(e) => setWebhookEvent(e.target.value)} className="px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white text-sm">
            <option value="invoice.created">invoice.created</option>
            <option value="invoice.paid">invoice.paid</option>
            <option value="mission.completed">mission.completed</option>
          </select>
          <button onClick={handleAddWebhook} className="px-5 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shrink-0 shadow-lg shadow-violet-600/20">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {webhooks.length === 0 ? (
            <p className="text-center text-slate-500 text-sm py-4">Aucun webhook configuré.</p>
          ) : webhooks.map((wh) => (
            <div key={wh.id} className="p-5 bg-slate-950/50 border border-white/5 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <code className="font-mono text-sm text-violet-300 block truncate mb-2">{wh.url}</code>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono">{wh.event}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={cn("px-2 py-1 rounded-full text-[10px] font-black uppercase", wh.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-500")}>{wh.isActive ? "ACTIVE" : "INACTIVE"}</span>
                <button onClick={() => handleDeleteWebhook(wh.id)} className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg text-rose-400 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
