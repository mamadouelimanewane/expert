"use client";

import { useState } from "react";
import {
  Smartphone,
  Copy,
  Check,
  RefreshCw,
  Zap,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Link2,
  Send,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────

type Provider = "Wave" | "Orange Money" | "MTN" | "Moov";
type TxStatus = "PAID" | "PENDING" | "EXPIRED";

interface Transaction {
  id: string;
  client: string;
  amount: number;
  status: TxStatus;
  provider: Provider;
  timeAgo: string;
  ref: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PROVIDERS: { name: Provider; color: string; bgColor: string; dotColor: string }[] = [
  { name: "Wave", color: "text-blue-400", bgColor: "bg-blue-500/20", dotColor: "bg-blue-400" },
  { name: "Orange Money", color: "text-orange-400", bgColor: "bg-orange-500/20", dotColor: "bg-orange-400" },
  { name: "MTN", color: "text-yellow-400", bgColor: "bg-yellow-500/20", dotColor: "bg-yellow-400" },
  { name: "Moov", color: "text-cyan-400", bgColor: "bg-cyan-500/20", dotColor: "bg-cyan-400" },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: "tx001", client: "Kouassi Aman Thierry", amount: 450000, status: "PAID", provider: "Wave", timeAgo: "il y a 3 min", ref: "FAC-2024-0891" },
  { id: "tx002", client: "Traoré Aminata", amount: 120000, status: "PENDING", provider: "Orange Money", timeAgo: "il y a 11 min", ref: "FAC-2024-0892" },
  { id: "tx003", client: "Diallo Mamadou Lamine", amount: 890000, status: "PAID", provider: "MTN", timeAgo: "il y a 28 min", ref: "FAC-2024-0890" },
  { id: "tx004", client: "N'Guessan Brou Edmond", amount: 65000, status: "PENDING", provider: "Wave", timeAgo: "il y a 45 min", ref: "FAC-2024-0889" },
  { id: "tx005", client: "Koné Fatoumata", amount: 310000, status: "EXPIRED", provider: "Moov", timeAgo: "il y a 2h", ref: "FAC-2024-0888" },
  { id: "tx006", client: "Sow Ibrahim Cheikh", amount: 175000, status: "PAID", provider: "Orange Money", timeAgo: "il y a 3h", ref: "FAC-2024-0887" },
];

// Random but deterministic 8x8 QR-like grid pattern
function generateQRPattern(seed: string): boolean[][] {
  const chars = (seed + "cabinet360").split("").map((c) => c.charCodeAt(0));
  const total = chars.reduce((a, b) => a + b, 0);
  return Array.from({ length: 8 }, (_, r) =>
    Array.from({ length: 8 }, (_, c) => {
      if ((r < 2 && c < 2) || (r < 2 && c > 5) || (r > 5 && c < 2)) return true;
      const v = (total * (r + 1) * (c + 1) * 37 + r * 17 + c * 13) % 100;
      return v > 42;
    })
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  accent: string;
}) {
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

function ProviderTag({ provider }: { provider: Provider }) {
  const map: Record<Provider, { label: string; className: string }> = {
    Wave: { label: "WAVE", className: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
    "Orange Money": { label: "OM", className: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
    MTN: { label: "MTN", className: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
    Moov: { label: "MOOV", className: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
  };
  const { label, className } = map[provider];
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-widest", className)}>
      {label}
    </span>
  );
}

function StatusBadge({ status, animate }: { status: TxStatus; animate?: boolean }) {
  const map: Record<TxStatus, { label: string; className: string; dot: string }> = {
    PAID: { label: "PAYÉ", className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", dot: "bg-emerald-400" },
    PENDING: { label: "EN ATTENTE", className: "bg-amber-500/15 text-amber-300 border-amber-500/30", dot: "bg-amber-400 animate-pulse" },
    EXPIRED: { label: "EXPIRÉ", className: "bg-red-500/15 text-red-300 border-red-500/30", dot: "bg-red-400" },
  };
  const { label, className, dot } = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wider transition-all duration-700",
        className,
        animate && "ring-2 ring-emerald-400/50 scale-105"
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
      {label}
    </span>
  );
}

function QRCodeBlock({ seed }: { seed: string }) {
  const pattern = generateQRPattern(seed);
  return (
    <div className="flex flex-col items-center gap-3 animate-in fade-in zoom-in-95 duration-500">
      <div className="rounded-xl border-2 border-indigo-500/40 bg-white p-3 shadow-lg shadow-indigo-500/20">
        <div className="grid grid-cols-8 gap-0.5">
          {pattern.flat().map((filled, i) => (
            <div
              key={i}
              className={cn(
                "h-4 w-4 rounded-[2px]",
                filled ? "bg-slate-900" : "bg-white"
              )}
            />
          ))}
        </div>
      </div>
      <p className="text-xs text-slate-400 italic">Scannez pour payer</p>
    </div>
  );
}

// ─── Webhook JSON ─────────────────────────────────────────────────────────────

const WEBHOOK_JSON = `{
  "event": "payment.completed",
  "timestamp": "2026-06-24T08:06:55Z",
  "gateway": "cabinet360.pay",
  "transaction": {
    "id": "tx_OHADA_7f3a2c",
    "ref": "FAC-2024-0892",
    "amount": 120000,
    "currency": "XOF",
    "provider": "Orange Money",
    "status": "PAID",
    "client": "Traoré Aminata",
    "phone": "+225 07 00 00 00",
    "paid_at": "2026-06-24T08:06:55Z"
  },
  "signature": "sha256=3b9a1f7..."
}`;

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PaymentsPage() {
  const [provider, setProvider] = useState<Provider>("Wave");
  const [amount, setAmount] = useState<string>("");
  const [reference, setReference] = useState<string>("");
  const [client, setClient] = useState<string>("");
  const [providerOpen, setProviderOpen] = useState(false);

  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [qrSeed, setQrSeed] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [animatedTxId, setAnimatedTxId] = useState<string | null>(null);

  const [simulating, setSimulating] = useState(false);
  const [simDone, setSimDone] = useState(false);

  const handleGenerate = async () => {
    if (!amount || Number(amount) <= 0) return;
    setGenerating(true);
    setGeneratedLink(null);
    await new Promise((r) => setTimeout(r, 900));
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    const link = `cabinet360.pay/${code}`;
    setGeneratedLink(link);
    setQrSeed(`${provider}-${amount}-${reference}-${code}`);
    setGenerating(false);
  };

  const handleCopy = async () => {
    if (!generatedLink) return;
    await navigator.clipboard.writeText(`https://${generatedLink}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateWebhook = async () => {
    setSimulating(true);
    setSimDone(false);
    await new Promise((r) => setTimeout(r, 1200));
    const pendingTx = transactions.find((tx) => tx.status === "PENDING");
    if (pendingTx) {
      setAnimatedTxId(pendingTx.id);
      setTransactions((prev) =>
        prev.map((tx) =>
          tx.id === pendingTx.id
            ? { ...tx, status: "PAID", timeAgo: "à l'instant" }
            : tx
        )
      );
      setTimeout(() => setAnimatedTxId(null), 2500);
    }
    setSimulating(false);
    setSimDone(true);
    setTimeout(() => setSimDone(false), 3000);
  };

  const selectedProvider = PROVIDERS.find((p) => p.name === provider)!;
  const hasPending = transactions.some((tx) => tx.status === "PENDING");

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Ambient background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute top-1/2 -right-24 h-80 w-80 rounded-full bg-emerald-600/8 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-violet-600/8 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="mb-10 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
            <Smartphone className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Hub Paiements Mobile Money
            </h1>
            <p className="mt-0.5 text-sm text-slate-400">
              Générez des liens de paiement Wave, Orange Money et MTN.
            </p>
          </div>
        </div>

        {/* ── Stats Row ──────────────────────────────────────────────────── */}
        <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Encaissements du jour"
            value="2 400 000 FCFA"
            icon={TrendingUp}
            accent="bg-emerald-500"
          />
          <StatCard
            label="Liens actifs"
            value="7"
            icon={Link2}
            accent="bg-blue-500"
          />
          <StatCard
            label="En attente"
            value="3"
            icon={Clock}
            accent="bg-amber-500"
          />
          <StatCard
            label="Taux de succès"
            value="94.2 %"
            icon={CheckCircle2}
            accent="bg-indigo-500"
          />
        </div>

        {/* ── Main Content Grid ───────────────────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">

          {/* ── Left: Generator Form ─────────────────────────────────────── */}
          <div className="rounded-2xl border border-white/8 bg-white/4 backdrop-blur-sm p-6">
            <h2 className="mb-5 flex items-center gap-2 text-base font-semibold text-white">
              <Zap className="h-4 w-4 text-indigo-400" />
              Générer un Lien de Paiement
            </h2>

            <div className="space-y-4">
              {/* Provider dropdown */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">
                  Opérateur Mobile Money
                </label>
                <div className="relative">
                  <button
                    onClick={() => setProviderOpen((v) => !v)}
                    className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:border-indigo-500/50 hover:bg-white/8 focus:outline-none"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className={cn("h-2.5 w-2.5 rounded-full", selectedProvider.dotColor)} />
                      {provider}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-slate-400 transition-transform duration-200",
                        providerOpen && "rotate-180"
                      )}
                    />
                  </button>
                  {providerOpen && (
                    <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-white/10 bg-slate-800 shadow-xl shadow-black/40">
                      {PROVIDERS.map((p) => (
                        <button
                          key={p.name}
                          onClick={() => {
                            setProvider(p.name);
                            setProviderOpen(false);
                            setGeneratedLink(null);
                          }}
                          className={cn(
                            "flex w-full items-center gap-2.5 px-4 py-3 text-sm transition hover:bg-white/8",
                            provider === p.name ? "text-white font-medium" : "text-slate-300"
                          )}
                        >
                          <span className={cn("h-2.5 w-2.5 rounded-full", p.dotColor)} />
                          {p.name}
                          {provider === p.name && (
                            <Check className="ml-auto h-3.5 w-3.5 text-indigo-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">
                  Montant (FCFA)
                </label>
                <input
                  type="number"
                  min="100"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setGeneratedLink(null);
                  }}
                  placeholder="Ex : 150 000"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-600 transition hover:border-indigo-500/40 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                />
              </div>

              {/* Reference */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">
                  Référence / Facture
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => {
                    setReference(e.target.value);
                    setGeneratedLink(null);
                  }}
                  placeholder="Ex : FAC-2024-0895"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-600 transition hover:border-indigo-500/40 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                />
              </div>

              {/* Client */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">
                  Client
                </label>
                <input
                  type="text"
                  value={client}
                  onChange={(e) => {
                    setClient(e.target.value);
                    setGeneratedLink(null);
                  }}
                  placeholder="Ex : Konan Yves Emmanuel"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-600 transition hover:border-indigo-500/40 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                />
              </div>

              {/* Generate button */}
              <button
                onClick={handleGenerate}
                disabled={generating || !amount || Number(amount) <= 0}
                className={cn(
                  "relative w-full overflow-hidden rounded-xl px-4 py-3.5 text-sm font-semibold text-white transition-all duration-300",
                  "bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/25",
                  "hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-500/40 hover:-translate-y-0.5",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0",
                  "focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                )}
              >
                {generating ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Génération en cours…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Zap className="h-4 w-4" />
                    Générer le QR Code &amp; Lien
                  </span>
                )}
              </button>

              {/* Generated output */}
              {generatedLink && (
                <div className="mt-2 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-white/8" />
                    <span className="text-[10px] uppercase tracking-widest text-slate-500">
                      Résultat
                    </span>
                    <div className="h-px flex-1 bg-white/8" />
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-white/4 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <ProviderTag provider={provider} />
                      <span className="text-xs text-slate-300">
                        {Number(amount).toLocaleString("fr-FR")} FCFA
                      </span>
                    </div>
                    {reference && (
                      <span className="text-[10px] text-slate-500">{reference}</span>
                    )}
                  </div>

                  <QRCodeBlock seed={qrSeed} />

                  <div className="flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/8 px-3 py-2.5">
                    <Link2 className="h-3.5 w-3.5 flex-shrink-0 text-indigo-400" />
                    <span className="flex-1 truncate font-mono text-xs text-indigo-300">
                      {generatedLink}
                    </span>
                    <button
                      onClick={handleCopy}
                      className="flex-shrink-0 rounded-lg bg-indigo-600/30 p-1.5 transition hover:bg-indigo-600/50"
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-indigo-400" />
                      )}
                    </button>
                  </div>
                  {copied && (
                    <p className="text-center text-[10px] text-emerald-400 animate-in fade-in duration-300">
                      ✓ Lien copié dans le presse-papiers
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Recent Transactions ───────────────────────────────── */}
          <div className="rounded-2xl border border-white/8 bg-white/4 backdrop-blur-sm p-6">
            <h2 className="mb-5 flex items-center justify-between text-base font-semibold text-white">
              <span className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                Transactions Récentes
              </span>
              <span className="rounded-full bg-white/8 px-2.5 py-0.5 text-xs text-slate-400">
                {transactions.length} transactions
              </span>
            </h2>

            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className={cn(
                    "group flex items-center gap-4 rounded-xl border p-4 transition-all duration-700",
                    animatedTxId === tx.id
                      ? "border-emerald-500/50 bg-emerald-500/10 shadow-lg shadow-emerald-500/10"
                      : "border-white/6 bg-white/3 hover:border-white/12 hover:bg-white/6"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-all duration-700",
                      tx.status === "PAID"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : tx.status === "PENDING"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-red-500/20 text-red-400"
                    )}
                  >
                    {tx.client
                      .split(" ")
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join("")}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-white">
                        {tx.client}
                      </p>
                      <p
                        className={cn(
                          "flex-shrink-0 text-sm font-bold transition-all duration-700",
                          tx.status === "PAID" ? "text-emerald-400" : "text-slate-300"
                        )}
                      >
                        {tx.amount.toLocaleString("fr-FR")} F
                      </p>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <StatusBadge
                        status={tx.status}
                        animate={animatedTxId === tx.id}
                      />
                      <ProviderTag provider={tx.provider} />
                      <span className="text-[10px] text-slate-500">{tx.ref}</span>
                      <span className="ml-auto text-[10px] text-slate-500">
                        {tx.timeAgo}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom: Webhook Simulation ──────────────────────────────────── */}
        <div className="mt-6 rounded-2xl border border-white/8 bg-white/4 backdrop-blur-sm p-6">
          <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-base font-semibold text-white">
                <Send className="h-4 w-4 text-violet-400" />
                Simulation Webhook
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Payload JSON envoyé à votre endpoint lors d&apos;un paiement confirmé.
              </p>
            </div>
            <button
              onClick={handleSimulateWebhook}
              disabled={simulating || !hasPending}
              className={cn(
                "mt-3 sm:mt-0 flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300",
                "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20",
                "hover:from-violet-500 hover:to-indigo-500 hover:shadow-violet-500/30 hover:-translate-y-0.5",
                "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0",
                "focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              )}
            >
              {simulating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Simulation…
                </>
              ) : simDone ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Paiement simulé !
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Simuler un paiement reçu
                </>
              )}
            </button>
          </div>

          {!hasPending && !simulating && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
              <XCircle className="h-4 w-4 flex-shrink-0 text-amber-400" />
              <p className="text-xs text-amber-300">
                Aucune transaction en attente — toutes les transactions ont été traitées.
              </p>
            </div>
          )}

          {/* Code block */}
          <div className="relative overflow-hidden rounded-xl border border-white/8 bg-slate-950/80">
            <div className="flex items-center justify-between border-b border-white/8 bg-white/3 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
              </div>
              <span className="font-mono text-[10px] text-slate-500">
                POST /api/webhooks/payment-confirmed
              </span>
              <span className="text-[10px] text-slate-600">application/json</span>
            </div>
            <pre className="overflow-x-auto p-5 text-xs leading-relaxed">
              <code>
                {WEBHOOK_JSON.split("\n").map((line, i) => {
                  const colored = line
                    .replace(
                      /("[\w_.]+")(\s*):/g,
                      '<span style="color:#a78bfa">$1</span>$2:'
                    )
                    .replace(
                      /:(\s*)("(?:[^"\\]|\\.)*")/g,
                      ':$1<span style="color:#6ee7b7">$2</span>'
                    )
                    .replace(
                      /:(\s*)(\d+)/g,
                      ':$1<span style="color:#fcd34d">$2</span>'
                    );
                  return (
                    <span
                      key={i}
                      className="block text-slate-300"
                      dangerouslySetInnerHTML={{ __html: colored }}
                    />
                  );
                })}
              </code>
            </pre>

            {simulating && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="flex flex-col items-center gap-3">
                  <RefreshCw className="h-8 w-8 animate-spin text-violet-400" />
                  <p className="text-sm font-medium text-violet-300">
                    Envoi du webhook en cours…
                  </p>
                </div>
              </div>
            )}
            {simDone && (
              <div className="absolute bottom-3 right-4 flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xs font-medium text-emerald-300">
                  200 OK — Webhook reçu
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-center text-[11px] text-slate-600">
          Cabinet 360 · Hub Paiements Mobile Money · Zone OHADA · Données simulées à des fins de démonstration
        </p>
      </div>
    </div>
  );
}
