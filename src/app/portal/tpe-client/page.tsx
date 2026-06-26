"use client";

import { useState, useRef, useEffect } from "react";
import {
  Camera,
  Receipt,
  MessageCircle,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Send,
  X,
  FileText,
  Clock,
  ChevronRight,
  Paperclip,
  Bell,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Expense {
  id: string;
  fileName: string;
  amount: string | null;
  date: string;
  status: "received" | "processing";
  category: string;
}

interface Message {
  id: string;
  sender: "accountant" | "client";
  text: string;
  time: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const EXPENSES: Expense[] = [
  {
    id: "1",
    fileName: "facture_electricite_mai.pdf",
    amount: "45 000 FCFA",
    date: "22 juin 2026",
    status: "received",
    category: "Énergie",
  },
  {
    id: "2",
    fileName: "achat_stock_juin.jpg",
    amount: "320 000 FCFA",
    date: "20 juin 2026",
    status: "processing",
    category: "Stock",
  },
  {
    id: "3",
    fileName: "loyer_juin_2026.pdf",
    amount: "150 000 FCFA",
    date: "18 juin 2026",
    status: "received",
    category: "Loyer",
  },
  {
    id: "4",
    fileName: "transport_livraison.jpg",
    amount: null,
    date: "15 juin 2026",
    status: "processing",
    category: "Transport",
  },
  {
    id: "5",
    fileName: "materiel_bureau_recu.pdf",
    amount: "87 500 FCFA",
    date: "10 juin 2026",
    status: "received",
    category: "Matériel",
  },
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    sender: "accountant",
    text: "Bonjour M. Traoré ! 👋 Votre bilan du mois de mai est prêt. Tout se passe bien côté trésorerie.",
    time: "09:14",
  },
  {
    id: "2",
    sender: "accountant",
    text: "⚠️ Petit rappel : vos charges de personnel ont augmenté de 12% ce mois. Je vous enverrai un rapport détaillé.",
    time: "09:15",
  },
  {
    id: "3",
    sender: "client",
    text: "Merci ! Je prends note pour les charges. On peut se parler cette semaine ?",
    time: "10:32",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function HealthGauge({ score, max }: { score: number; max: number }) {
  const radius = 58;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const percentage = score / max;
  const arcLength = circumference * 0.75;

  const isGood = score > 130;

  return (
    <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
      <svg width={160} height={160} viewBox="0 0 120 120" className="-rotate-[135deg]">
        {/* Background arc */}
        <circle
          cx="60"
          cy="60"
          r={normalizedRadius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={stroke}
          strokeDasharray={`${arcLength} ${circumference - arcLength}`}
          strokeLinecap="round"
        />
        {/* Foreground arc */}
        <circle
          cx="60"
          cy="60"
          r={normalizedRadius}
          fill="none"
          stroke={isGood ? "#10b981" : "#f59e0b"}
          strokeWidth={stroke}
          strokeDasharray={`${arcLength * percentage} ${circumference - arcLength * percentage}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-2xl sm:text-3xl lg:text-4xl font-black", isGood ? "text-emerald-600" : "text-amber-500")}>
          {score}
        </span>
        <span className="text-xs text-slate-400 font-medium">sur {max}</span>
      </div>
    </div>
  );
}

function IndicatorPill({
  label,
  status,
}: {
  label: string;
  status: "ok" | "warn";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold",
        status === "ok"
          ? "bg-emerald-100 text-emerald-700"
          : "bg-amber-100 text-amber-700"
      )}
    >
      {status === "ok" ? (
        <CheckCircle2 size={13} className="shrink-0" />
      ) : (
        <AlertTriangle size={13} className="shrink-0" />
      )}
      {label}
    </span>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-1">
      <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</span>
      <span className={cn("text-lg font-black leading-tight", accent)}>{value}</span>
      {sub && <span className="text-xs text-slate-400">{sub}</span>}
    </div>
  );
}

// ─── Chat Widget ──────────────────────────────────────────────────────────────

function ChatWidget({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    setMessages((prev) => [
      ...prev,
      { id: String(Date.now()), sender: "client", text: trimmed, time },
    ]);
    setDraft("");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: "accountant",
          text: "Bien reçu ! 👍 Je vous réponds dans les plus brefs délais.",
          time,
        },
      ]);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:justify-end sm:p-6 bg-black/40 backdrop-blur-sm">
      <div
        className="w-full sm:w-[380px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: "80vh" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4 bg-gradient-to-r from-violet-600 to-violet-700">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">KO</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm truncate">Mme Koné — Votre comptable</p>
            <p className="text-violet-200 text-xs flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
              En ligne
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-2",
                msg.sender === "client" ? "flex-row-reverse" : "flex-row"
              )}
            >
              {msg.sender === "accountant" && (
                <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center shrink-0 self-end">
                  <span className="text-violet-700 font-bold text-xs">K</span>
                </div>
              )}
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-3.5 py-2.5",
                  msg.sender === "client"
                    ? "bg-violet-600 text-white rounded-br-sm"
                    : "bg-white text-slate-800 shadow-sm border border-slate-100 rounded-bl-sm"
                )}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <p
                  className={cn(
                    "text-[10px] mt-1 text-right",
                    msg.sender === "client" ? "text-violet-200" : "text-slate-400"
                  )}
                >
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-3 py-3 bg-white border-t border-slate-100 flex items-center gap-2">
          <button className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors shrink-0">
            <Paperclip size={16} />
          </button>
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Écrivez un message…"
            className="flex-1 bg-slate-100 rounded-full px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-violet-300"
          />
          <button
            onClick={handleSend}
            disabled={!draft.trim()}
            className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-white shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-violet-700 transition-colors"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TPEClientPortalPage() {
  const [chatOpen, setChatOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file.name);
      setTimeout(() => setUploadedFile(null), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-10">
      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-10 pb-20 px-4 sm:px-6">
        <div className="max-w-lg mx-auto">
          {/* Nav row */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
                <span className="text-white font-black text-xs">C</span>
              </div>
              <span className="text-slate-400 text-sm font-medium">Cabinet 360</span>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-slate-300 hover:bg-white/20 transition-colors">
                <Bell size={18} />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                  3
                </span>
              </button>
              <button className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-slate-300 hover:bg-white/20 transition-colors">
                <LogOut size={16} />
              </button>
            </div>
          </div>

          {/* Greeting */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-xl shrink-0">
              <span className="text-white font-black text-lg tracking-wide">MT</span>
            </div>
            <div>
              <h1 className="text-white text-2xl font-black leading-tight">
                Bonjour, M. Traoré 👋
              </h1>
              <p className="text-slate-400 text-sm mt-1 leading-snug">
                Voici la santé financière de votre entreprise aujourd&apos;hui.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <div className="max-w-lg mx-auto px-4 sm:px-6 -mt-12 space-y-5">

        {/* ── Health Score Card ────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-4">
            Score de Santé 💚
          </p>
          <div className="flex flex-col items-center gap-4">
            <HealthGauge score={150} max={200} />
            <div>
              <p className="text-center text-slate-600 text-sm font-medium mb-3">
                Votre entreprise est en bonne santé !
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <IndicatorPill label="Trésorerie" status="ok" />
                <IndicatorPill label="Charges" status="warn" />
                <IndicatorPill label="Croissance" status="ok" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Quick Stats ──────────────────────────────────────────────── */}
        <div>
          <h2 className="text-slate-700 font-bold text-base mb-3">
            📊 Votre situation
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard
              label="Trésorerie disponible"
              value="3 420 000 F"
              sub="FCFA · Compte principal"
              accent="text-emerald-600"
            />
            <StatCard
              label="Factures reçues"
              value="8 à payer"
              sub="Dont 2 urgentes"
              accent="text-amber-500"
            />
            <StatCard
              label="Prochaine échéance fiscale"
              value="15 jours"
              sub="TVA — 10 juillet 2026"
              accent="text-violet-600"
            />
          </div>
        </div>

        {/* ── Quick Actions ────────────────────────────────────────────── */}
        <div>
          <h2 className="text-slate-700 font-bold text-base mb-3">
            ⚡ Actions rapides
          </h2>

          {uploadedFile && (
            <div className="mb-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 flex items-center gap-3">
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
              <div>
                <p className="text-emerald-800 font-semibold text-sm">Dépense envoyée ! ✅</p>
                <p className="text-emerald-600 text-xs truncate">{uploadedFile}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {/* Envoyer une dépense */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl p-5 flex flex-col items-start gap-3 active:scale-95 transition-transform shadow-lg shadow-indigo-200 text-left"
            >
              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
                <Camera size={22} className="text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-tight">Envoyer une</p>
                <p className="text-white font-bold text-sm leading-tight">dépense 📸</p>
              </div>
              <div className="absolute -bottom-3 -right-3 w-16 h-16 rounded-full bg-white/10" />
            </button>

            {/* Voir mes factures */}
            <a
              href="/billing"
              className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 flex flex-col items-start gap-3 active:scale-95 transition-transform shadow-lg shadow-emerald-200"
            >
              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
                <Receipt size={22} className="text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-tight">Voir mes</p>
                <p className="text-white font-bold text-sm leading-tight">factures 🧾</p>
              </div>
              <div className="absolute -bottom-3 -right-3 w-16 h-16 rounded-full bg-white/10" />
            </a>

            {/* Contacter le comptable */}
            <button
              onClick={() => setChatOpen(true)}
              className="relative overflow-hidden bg-gradient-to-br from-violet-500 to-purple-700 rounded-2xl p-5 flex flex-col items-start gap-3 active:scale-95 transition-transform shadow-lg shadow-violet-200 text-left"
            >
              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
                <MessageCircle size={22} className="text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-tight">Contacter mon</p>
                <p className="text-white font-bold text-sm leading-tight">comptable 💬</p>
              </div>
              <div className="absolute -bottom-3 -right-3 w-16 h-16 rounded-full bg-white/10" />
            </button>

            {/* Calendrier fiscal */}
            <a
              href="/fiscal-calendar"
              className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 flex flex-col items-start gap-3 active:scale-95 transition-transform shadow-lg shadow-amber-200"
            >
              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
                <Calendar size={22} className="text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-tight">Calendrier</p>
                <p className="text-white font-bold text-sm leading-tight">fiscal 📅</p>
              </div>
              <div className="absolute -bottom-3 -right-3 w-16 h-16 rounded-full bg-white/10" />
            </a>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* ── Recent Expenses ──────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-slate-700 font-bold text-base flex items-center gap-2">
              🧾 Mes dernières dépenses
            </h2>
            <button className="text-indigo-600 text-xs font-semibold flex items-center gap-0.5 hover:text-indigo-800 transition-colors">
              Tout voir <ChevronRight size={14} />
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-50">
            {EXPENSES.map((expense) => (
              <div key={expense.id} className="flex items-center gap-3 px-4 py-3.5">
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    expense.status === "received" ? "bg-emerald-100" : "bg-amber-100"
                  )}
                >
                  <FileText
                    size={18}
                    className={
                      expense.status === "received" ? "text-emerald-600" : "text-amber-600"
                    }
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-slate-800 font-semibold text-sm truncate">
                    {expense.fileName}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-slate-400 text-xs">{expense.date}</span>
                    <span className="text-slate-200 text-xs">·</span>
                    <span className="text-slate-400 text-xs">{expense.category}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  {expense.amount && (
                    <span className="text-slate-700 text-xs font-bold">{expense.amount}</span>
                  )}
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold",
                      expense.status === "received"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    )}
                  >
                    {expense.status === "received" ? (
                      <>
                        <CheckCircle2 size={10} />
                        Reçu
                      </>
                    ) : (
                      <>
                        <Clock size={10} />
                        En cours
                      </>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-3 flex items-center gap-4 px-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs text-slate-400">Reçu par le cabinet</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span className="text-xs text-slate-400">En cours de traitement</span>
            </div>
          </div>
        </div>

        {/* ── Tip Banner ───────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl px-5 py-4 flex items-start gap-3">
          <TrendingUp size={22} className="text-indigo-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-indigo-800 font-semibold text-sm">Conseil du mois 💡</p>
            <p className="text-indigo-600 text-xs mt-1 leading-relaxed">
              Vos charges ont augmenté de 12% ce mois. Votre comptable vous a préparé des
              recommandations pour optimiser vos coûts.
            </p>
            <button className="mt-2 text-indigo-700 text-xs font-bold underline underline-offset-2">
              Voir les recommandations →
            </button>
          </div>
        </div>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <div className="text-center py-4">
          <p className="text-slate-400 text-xs leading-relaxed">
            Propulsé par{" "}
            <span className="font-bold text-slate-500">Cabinet 360</span>
            {" "}· En partenariat avec{" "}
            <span className="font-bold text-slate-500">Cabinet Expertise OHADA</span>
          </p>
          <p className="text-slate-300 text-xs mt-1">© 2026 — Tous droits réservés</p>
        </div>
      </div>

      {/* ── Chat Widget ──────────────────────────────────────────────────── */}
      {chatOpen && <ChatWidget onClose={() => setChatOpen(false)} />}
    </div>
  );
}
