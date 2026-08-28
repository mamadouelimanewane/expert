"use client";

import { useState, useEffect } from "react";
import {
  Smartphone,
  RefreshCw,
  Zap,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Link2,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────

type Provider = "Wave" | "Orange Money" | "MTN";
type ApiProvider = "WAVE" | "ORANGE_MONEY" | "MTN_MOMO";

interface MobileMoneyTx {
  id: string;
  operator: string;
  senderName: string | null;
  senderPhone: string;
  amount: number;
  type: string;
  status: string;
  transactionDate: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PROVIDERS: { name: Provider; apiValue: ApiProvider; color: string; dotColor: string }[] = [
  { name: "Wave", apiValue: "WAVE", color: "text-blue-400", dotColor: "bg-blue-400" },
  { name: "Orange Money", apiValue: "ORANGE_MONEY", color: "text-orange-400", dotColor: "bg-orange-400" },
  { name: "MTN", apiValue: "MTN_MOMO", color: "text-yellow-400", dotColor: "bg-yellow-400" },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, accent }: { label: string; value: string; icon: React.ElementType; accent: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-white/4 p-5 backdrop-blur-sm">
      <div className={cn("absolute -top-4 -right-4 h-20 w-20 rounded-full blur-2xl opacity-20", accent)} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">{label}</p>
          <p className="text-2xl font-bold text-white leading-none">{value}</p>
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl border border-white/10", accent, "bg-opacity-20")}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}

function ProviderTag({ provider }: { provider: string }) {
  const map: Record<string, { label: string; className: string }> = {
    Wave: { label: "WAVE", className: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
    "Orange Money": { label: "OM", className: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
    "MTN MoMo": { label: "MTN", className: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
    MTN: { label: "MTN", className: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  };
  const { label, className } = map[provider] || { label: provider.slice(0, 4).toUpperCase(), className: "bg-slate-500/20 text-slate-300 border-slate-500/30" };
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-widest", className)}>
      {label}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string; dot: string }> = {
    RECONCILED: { label: "RAPPROCHÉ", className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", dot: "bg-emerald-400" },
    PENDING: { label: "EN ATTENTE", className: "bg-amber-500/15 text-amber-300 border-amber-500/30", dot: "bg-amber-400 animate-pulse" },
  };
  const s = map[status] || { label: status, className: "bg-slate-500/15 text-slate-300 border-slate-500/30", dot: "bg-slate-400" };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wider", s.className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PaymentsPage() {
  const [provider, setProvider] = useState<Provider>("Wave");
  const [amount, setAmount] = useState<string>("");
  const [reference, setReference] = useState<string>("");
  const [client, setClient] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [providerOpen, setProviderOpen] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; transactionId?: string; checkoutUrl?: string } | null>(null);

  const [transactions, setTransactions] = useState<MobileMoneyTx[]>([]);
  const [loadingTx, setLoadingTx] = useState(true);

  useEffect(() => {
    fetch("/api/fintech/mobile-money")
      .then((r) => r.json())
      .then((data) => setTransactions(Array.isArray(data?.transactions) ? data.transactions : []))
      .finally(() => setLoadingTx(false));
  }, []);

  const handleGenerate = async () => {
    if (!amount || Number(amount) <= 0 || !phoneNumber) return;
    setGenerating(true);
    setResult(null);
    try {
      const selectedProvider = PROVIDERS.find((p) => p.name === provider)!;
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: reference || `PAY-${Date.now()}`,
          amount,
          provider: selectedProvider.apiValue,
          phoneNumber,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResult({ success: true, message: data.message || "Paiement initié.", transactionId: data.transactionId, checkoutUrl: data.checkoutUrl });
      } else {
        setResult({ success: false, message: data.error || "Échec de l'initiation du paiement." });
      }
    } catch {
      setResult({ success: false, message: "Erreur réseau lors de l'appel au fournisseur de paiement." });
    } finally {
      setGenerating(false);
    }
  };

  const selectedProvider = PROVIDERS.find((p) => p.name === provider)!;

  const reconciled = transactions.filter((tx) => tx.status === "RECONCILED");
  const pending = transactions.filter((tx) => tx.status === "PENDING");
  const totalConfirmed = reconciled.reduce((acc, tx) => acc + tx.amount, 0);
  const reconciliationRate = transactions.length > 0 ? Math.round((reconciled.length / transactions.length) * 100) : null;

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute top-1/2 -right-24 h-80 w-80 rounded-full bg-emerald-600/8 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-violet-600/8 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
            <Smartphone className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="page-title-dark">
              Hub Paiements Mobile Money
            </h1>
            <p className="page-subtitle-dark">
              Initiez des paiements réels Wave, Orange Money et MTN via les API des fournisseurs.
            </p>
          </div>
        </div>

        {/* Stats Row — calculées à partir des transactions réelles */}
        <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Encaissements confirmés" value={`${totalConfirmed.toLocaleString("fr-FR")} FCFA`} icon={TrendingUp} accent="bg-emerald-500" />
          <StatCard label="Transactions enregistrées" value={String(transactions.length)} icon={Link2} accent="bg-blue-500" />
          <StatCard label="En attente" value={String(pending.length)} icon={Clock} accent="bg-amber-500" />
          <StatCard label="Taux de rapprochement" value={reconciliationRate !== null ? `${reconciliationRate} %` : "—"} icon={CheckCircle2} accent="bg-indigo-500" />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">

          {/* Left: Generator Form */}
          <div className="rounded-2xl border border-white/8 bg-white/4 backdrop-blur-sm p-6">
            <h2 className="mb-5 flex items-center gap-2 text-base font-semibold text-white">
              <Zap className="h-4 w-4 text-indigo-400" />
              Initier un Paiement
            </h2>

            <div className="space-y-4">
              {/* Provider dropdown */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">Opérateur Mobile Money</label>
                <div className="relative">
                  <button
                    onClick={() => setProviderOpen((v) => !v)}
                    className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:border-indigo-500/50 hover:bg-white/8 focus:outline-none"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className={cn("h-2.5 w-2.5 rounded-full", selectedProvider.dotColor)} />
                      {provider}
                    </span>
                    <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-200", providerOpen && "rotate-180")} />
                  </button>
                  {providerOpen && (
                    <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-white/10 bg-slate-800 shadow-xl shadow-black/40">
                      {PROVIDERS.map((p) => (
                        <button
                          key={p.name}
                          onClick={() => { setProvider(p.name); setProviderOpen(false); setResult(null); }}
                          className={cn("flex w-full items-center gap-2.5 px-4 py-3 text-sm transition hover:bg-white/8", provider === p.name ? "text-white font-medium" : "text-slate-300")}
                        >
                          <span className={cn("h-2.5 w-2.5 rounded-full", p.dotColor)} />
                          {p.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">Montant (FCFA)</label>
                <input
                  type="number" min="100" value={amount}
                  onChange={(e) => { setAmount(e.target.value); setResult(null); }}
                  placeholder="Ex : 150 000"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-600 transition hover:border-indigo-500/40 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">Numéro Mobile Money (requis)</label>
                <input
                  type="tel" value={phoneNumber}
                  onChange={(e) => { setPhoneNumber(e.target.value); setResult(null); }}
                  placeholder="Ex : +225 07 00 00 00 00"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-600 transition hover:border-indigo-500/40 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">Référence / Facture</label>
                <input
                  type="text" value={reference}
                  onChange={(e) => { setReference(e.target.value); setResult(null); }}
                  placeholder="Ex : FAC-2024-0895"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-600 transition hover:border-indigo-500/40 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">Client (optionnel)</label>
                <input
                  type="text" value={client}
                  onChange={(e) => setClient(e.target.value)}
                  placeholder="Ex : Konan Yves Emmanuel"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-600 transition hover:border-indigo-500/40 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={generating || !amount || Number(amount) <= 0 || !phoneNumber}
                className={cn(
                  "relative w-full overflow-hidden rounded-xl px-4 py-3.5 text-sm font-semibold text-white transition-all duration-300",
                  "bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/25",
                  "hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-500/40 hover:-translate-y-0.5",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0",
                  "focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                )}
              >
                {generating ? (
                  <span className="flex items-center justify-center gap-2"><RefreshCw className="h-4 w-4 animate-spin" /> Initiation en cours…</span>
                ) : (
                  <span className="flex items-center justify-center gap-2"><Zap className="h-4 w-4" /> Initier le Paiement</span>
                )}
              </button>

              {result && (
                <div className={cn(
                  "mt-2 animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-xl border p-4 text-xs leading-relaxed",
                  result.success ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                )}>
                  <div className="flex items-start gap-2">
                    {result.success ? <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" /> : <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />}
                    <div>
                      <p className="font-semibold">{result.success ? "Paiement initié" : "Intégration non disponible"}</p>
                      <p className="mt-1">{result.message}</p>
                      {result.transactionId && <p className="mt-1 font-mono text-[10px] opacity-80">Réf. transaction : {result.transactionId}</p>}
                      {result.checkoutUrl && (
                        <a href={result.checkoutUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block underline font-semibold">
                          Ouvrir la page de paiement →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Recent Transactions */}
          <div className="rounded-2xl border border-white/8 bg-white/4 backdrop-blur-sm p-6">
            <h2 className="mb-5 flex items-center justify-between text-base font-semibold text-white">
              <span className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-emerald-400" /> Transactions Enregistrées</span>
              <span className="rounded-full bg-white/8 px-2.5 py-0.5 text-xs text-slate-400">{transactions.length} transactions</span>
            </h2>

            {loadingTx ? (
              <div className="py-16 text-center text-sm text-slate-500">Chargement…</div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/10 py-16 text-center">
                <XCircle className="h-8 w-8 text-slate-600" />
                <p className="text-sm text-slate-400">Aucune transaction enregistrée pour le moment.</p>
                <p className="max-w-xs text-xs text-slate-600">Les transactions Mobile Money réelles apparaîtront ici une fois synchronisées depuis le Hub Rapprochement Mobile Money.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.id} className="group flex items-center gap-4 rounded-xl border border-white/6 bg-white/3 p-4 transition-all hover:border-white/12 hover:bg-white/6">
                    <div className={cn(
                      "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-xs font-bold",
                      tx.status === "RECONCILED" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                    )}>
                      {(tx.senderName || tx.senderPhone).slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium text-white">{tx.senderName || tx.senderPhone}</p>
                        <p className={cn("flex-shrink-0 text-sm font-bold", tx.type === "IN" ? "text-emerald-400" : "text-slate-300")}>
                          {tx.type === "IN" ? "+" : "-"} {tx.amount.toLocaleString("fr-FR")} F
                        </p>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <StatusBadge status={tx.status} />
                        <ProviderTag provider={tx.operator} />
                        <span className="ml-auto text-[10px] text-slate-500">
                          {new Date(tx.transactionDate).toLocaleDateString("fr-FR", { dateStyle: "short" })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom: Webhook documentation (non interactive) */}
        <div className="mt-6 rounded-2xl border border-white/8 bg-white/4 backdrop-blur-sm p-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-white">
            <Link2 className="h-4 w-4 text-violet-400" /> Endpoint Webhook
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Les confirmations de paiement des fournisseurs (Wave, Orange Money, MTN) sont reçues sur cet endpoint, une fois l'intégration configurée.
          </p>
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-white/8 bg-slate-950/80 px-4 py-3 font-mono text-xs text-slate-400">
            POST /api/payments/webhook?provider=WAVE|ORANGE_MONEY|MTN_MOMO
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-slate-600">
          Cabinet 360 · Hub Paiements Mobile Money · Zone OHADA
        </p>
      </div>
    </div>
  );
}
