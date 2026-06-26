"use client";

import { useState } from "react";
import {
  Code2, Key, Copy, Check, Trash2, Plus, AlertTriangle,
  Eye, EyeOff, Activity, Webhook, ExternalLink, ShieldCheck,
  ChevronDown, ChevronUp, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

const INITIAL_KEYS = [
  {
    id: "1",
    name: "Production Key",
    key: "c360_live_sk_••••••••••••••••••••••••••••3a7f",
    fullKey: "c360_live_sk_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p63a7f",
    created: "12 Jan 2026",
    lastUsed: "Il y a 2 min",
    status: "ACTIVE",
    type: "live"
  },
  {
    id: "2",
    name: "Test Key",
    key: "c360_test_sk_••••••••••••••••••••••••••••9c2e",
    fullKey: "c360_test_sk_z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k49c2e",
    created: "12 Jan 2026",
    lastUsed: "Jamais",
    status: "ACTIVE",
    type: "test"
  },
];

const ENDPOINTS = [
  {
    method: "GET",
    path: "/api/v1/invoices",
    description: "Récupérer toutes les factures du cabinet",
    curl: `curl -X GET "https://api.cabinet360.com/v1/invoices" \\
  -H "Authorization: Bearer c360_live_sk_..." \\
  -H "Content-Type: application/json"`,
    response: `{
  "data": [
    {
      "id": "inv_01HX9K",
      "number": "FAC-2026-001",
      "client": "Sahel Construction SA",
      "amount": 4500000,
      "currency": "XOF",
      "status": "PAID",
      "created_at": "2026-01-15T10:30:00Z"
    }
  ],
  "total": 26,
  "page": 1
}`
  },
  {
    method: "POST",
    path: "/api/v1/invoices",
    description: "Créer une nouvelle facture",
    curl: `curl -X POST "https://api.cabinet360.com/v1/invoices" \\
  -H "Authorization: Bearer c360_live_sk_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "client_id": "cl_01HX",
    "amount": 1800000,
    "currency": "XOF",
    "due_date": "2026-02-15"
  }'`,
    response: `{
  "id": "inv_01HX9L",
  "number": "FAC-2026-027",
  "status": "DRAFT",
  "amount": 1800000,
  "currency": "XOF",
  "created_at": "2026-01-20T09:00:00Z"
}`
  },
  {
    method: "GET",
    path: "/api/v1/clients",
    description: "Lister tous les clients actifs",
    curl: `curl -X GET "https://api.cabinet360.com/v1/clients?status=active" \\
  -H "Authorization: Bearer c360_live_sk_..." \\
  -H "Content-Type: application/json"`,
    response: `{
  "data": [
    {
      "id": "cl_01HX",
      "name": "Sahel Construction SA",
      "country": "SN",
      "ninea": "SN-2024-001234",
      "status": "active"
    }
  ],
  "total": 6
}`
  },
];

const LOG_ENTRIES = [
  { method: "GET", endpoint: "/api/v1/invoices", status: 200, duration: 42, ip: "41.82.12.4", time: "Il y a 2 min" },
  { method: "POST", endpoint: "/api/v1/invoices", status: 201, duration: 87, ip: "41.82.12.4", time: "Il y a 15 min" },
  { method: "GET", endpoint: "/api/v1/clients", status: 200, duration: 35, ip: "197.210.8.91", time: "Il y a 1 h" },
  { method: "GET", endpoint: "/api/v1/invoices/inv_01", status: 200, duration: 28, ip: "197.210.8.91", time: "Il y a 3 h" },
  { method: "POST", endpoint: "/api/v1/webhooks", status: 401, duration: 12, ip: "89.40.11.5", time: "Il y a 5 h" },
];

const WEBHOOKS = [
  { url: "https://myapp.com/webhooks/payment", events: ["payment.received", "invoice.paid"], status: "ACTIVE" },
];

export default function ApiKeysPage() {
  const [keys, setKeys] = useState(INITIAL_KEYS);
  const [copied, setCopied] = useState<string | null>(null);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [expandedEndpoint, setExpandedEndpoint] = useState<number | null>(0);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhooks, setWebhooks] = useState(WEBHOOKS);

  const generateRandomKey = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "c360_live_sk_";
    for (let i = 0; i < 32; i++) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleRevoke = (id: string) => {
    setKeys(prev => prev.filter(k => k.id !== id));
  };

  const handleGenerateKey = () => {
    const generated = generateRandomKey();
    setNewKey(generated);
  };

  const handleAddWebhook = () => {
    if (!webhookUrl) return;
    setWebhooks(prev => [...prev, {
      url: webhookUrl,
      events: ["invoice.created"],
      status: "ACTIVE"
    }]);
    setWebhookUrl("");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in zoom-in-95 duration-700 pb-16">

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Code2 className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">Developer Hub & API</h1>
          <p className="text-slate-400 font-medium text-sm">Connectez vos outils à Cabinet 360 via notre API REST sécurisée.</p>
        </div>
      </div>

      {/* API Keys */}
      <div className="glass-card rounded-[32px] border border-white/5 bg-slate-900/40 overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-cyan-400" /> Clés API
          </h2>
          <button
            onClick={handleGenerateKey}
            className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-cyan-600/20"
          >
            <Plus className="w-4 h-4" /> Générer une nouvelle clé
          </button>
        </div>

        {/* New Key Banner */}
        {newKey && (
          <div className="mx-6 mt-6 p-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-start gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-amber-400 font-bold text-sm">Copiez cette clé maintenant, elle ne sera plus affichée.</p>
            </div>
            <div className="flex items-center gap-3 bg-black/30 rounded-xl p-4 font-mono text-sm text-emerald-400">
              <span className="flex-1 break-all">{newKey}</span>
              <button
                onClick={() => handleCopy(newKey, "new")}
                className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg text-emerald-400 transition-all shrink-0"
              >
                {copied === "new" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <button onClick={() => setNewKey(null)} className="mt-3 text-xs text-slate-500 hover:text-white transition-colors">
              J'ai copié ma clé ✓
            </button>
          </div>
        )}

        <div className="p-6 space-y-4">
          {keys.map((k) => (
            <div key={k.id} className="p-5 rounded-2xl bg-slate-950/50 border border-white/5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-sm font-bold text-white">{k.name}</h3>
                  <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-black uppercase",
                    k.type === "live" ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"
                  )}>
                    {k.type}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400">ACTIVE</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="font-mono text-xs text-slate-400 bg-slate-800 px-3 py-1.5 rounded-lg flex-1 truncate">
                    {revealedKey === k.id ? k.fullKey : k.key}
                  </code>
                  <button onClick={() => setRevealedKey(revealedKey === k.id ? null : k.id)} className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-400 transition-all" title="Afficher/masquer">
                    {revealedKey === k.id ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="flex gap-6 mt-2">
                  <span className="text-[10px] text-slate-600">Créée le {k.created}</span>
                  <span className="text-[10px] text-slate-600">Dernière utilisation: {k.lastUsed}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleCopy(k.fullKey, k.id)}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-xs font-bold text-white transition-all"
                >
                  {copied === k.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied === k.id ? "Copié!" : "Copier"}
                </button>
                <button
                  onClick={() => handleRevoke(k.id)}
                  className="flex items-center gap-2 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl text-xs font-bold text-rose-400 transition-all border border-rose-500/20"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Révoquer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* API Endpoints Documentation */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-white flex items-center gap-2">
          <ExternalLink className="w-5 h-5 text-cyan-400" /> Documentation API (v1)
        </h2>
        {ENDPOINTS.map((ep, i) => (
          <div key={i} className="glass-card rounded-[24px] border border-white/5 bg-slate-900/40 overflow-hidden">
            <button
              className="w-full p-6 flex items-center gap-4 text-left hover:bg-white/3 transition-colors"
              onClick={() => setExpandedEndpoint(expandedEndpoint === i ? null : i)}
            >
              <span className={cn("px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest shrink-0",
                ep.method === "GET" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              )}>
                {ep.method}
              </span>
              <code className="font-mono text-sm text-cyan-300 flex-1">{ep.path}</code>
              <span className="text-xs text-slate-500 hidden sm:block">{ep.description}</span>
              {expandedEndpoint === i ? <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
            </button>
            {expandedEndpoint === i && (
              <div className="border-t border-white/5 p-6 space-y-4 animate-in fade-in duration-200">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Requête cURL</p>
                  <pre className="bg-[#0a0f1a] border border-white/10 rounded-xl p-5 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
                    {ep.curl}
                  </pre>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Réponse (200 OK)</p>
                  <pre className="bg-[#0a0f1a] border border-white/10 rounded-xl p-5 text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed">
                    {ep.response}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Rate Limits + Logs row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Rate Limits */}
        <div className="glass-card rounded-[28px] p-7 border border-white/5 bg-slate-900/40">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" /> Limites de Taux (Plan Pro)
          </h3>
          {[
            { label: "Requêtes / heure", limit: 1000, current: 312 },
            { label: "Webhooks / jour", limit: 5000, current: 87 },
          ].map((item, i) => (
            <div key={i} className="mb-5">
              <div className="flex justify-between mb-2">
                <span className="text-xs font-bold text-slate-400">{item.label}</span>
                <span className="text-xs font-bold text-white">{item.current} / {item.limit}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
                  style={{ width: `${(item.current / item.limit) * 100}%` }}
                />
              </div>
            </div>
          ))}
          <p className="text-[10px] text-slate-600 mt-4">Remise à zéro toutes les heures.</p>
        </div>

        {/* API Logs */}
        <div className="glass-card rounded-[28px] border border-white/5 bg-slate-900/40 overflow-hidden">
          <div className="p-5 border-b border-white/5">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" /> Logs API récents
            </h3>
          </div>
          <div className="divide-y divide-white/5">
            {LOG_ENTRIES.map((log, i) => (
              <div key={i} className="px-5 py-3 flex items-center gap-3 text-xs hover:bg-white/3 transition-colors">
                <span className={cn("px-2 py-0.5 rounded font-mono font-black text-[10px] shrink-0",
                  log.method === "GET" ? "bg-blue-500/10 text-blue-400" :
                  log.method === "POST" ? "bg-emerald-500/10 text-emerald-400" :
                  "bg-rose-500/10 text-rose-400"
                )}>{log.method}</span>
                <code className="font-mono text-slate-400 flex-1 truncate text-[11px]">{log.endpoint}</code>
                <span className={cn("font-bold shrink-0",
                  log.status < 300 ? "text-emerald-400" : "text-rose-400"
                )}>{log.status}</span>
                <span className="text-slate-600 shrink-0">{log.duration}ms</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Webhooks */}
      <div className="glass-card rounded-[32px] p-8 border border-white/5 bg-slate-900/40">
        <h2 className="text-lg font-black text-white flex items-center gap-2 mb-6">
          <Webhook className="w-5 h-5 text-violet-400" /> Webhooks
        </h2>

        <div className="flex items-center gap-3 mb-8">
          <input
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://votre-app.com/webhooks/cabinet360"
            className="flex-1 px-4 py-3 bg-slate-950/50 border border-white/10 focus:border-violet-500 rounded-xl text-white outline-none font-mono text-sm transition-all"
          />
          <button
            onClick={handleAddWebhook}
            className="px-5 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shrink-0 shadow-lg shadow-violet-600/20"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {webhooks.map((wh, i) => (
            <div key={i} className="p-5 bg-slate-950/50 border border-white/5 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <code className="font-mono text-sm text-violet-300 block truncate mb-2">{wh.url}</code>
                <div className="flex flex-wrap gap-2">
                  {wh.events.map((ev, j) => (
                    <span key={j} className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono">{ev}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400">ACTIVE</span>
                <button className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg text-rose-400 transition-all">
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
