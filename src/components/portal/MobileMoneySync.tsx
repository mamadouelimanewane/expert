"use client";

import { useState } from "react";
import { Smartphone, RefreshCw, CheckCircle, AlertCircle, Zap, ChevronDown } from "lucide-react";

const OPERATORS = [
  { id: "wave", name: "Wave", color: "#1a73e8", emoji: "🌊", countries: ["CI", "SN"] },
  { id: "orange", name: "Orange Money", color: "#ff6600", emoji: "🟠", countries: ["CI", "SN", "CM", "ML"] },
  { id: "mtn", name: "MTN MoMo", color: "#ffd700", emoji: "🟡", countries: ["CI", "CM", "GH"] },
  { id: "moov", name: "Moov Money", color: "#00b4d8", emoji: "💙", countries: ["CI", "BJ", "TG"] },
];

// Transactions Mobile Money simulées
const MOCK_TRANSACTIONS = [
  { ref: "WV-2026-001", operator: "Wave", sender: "SENELEC", amount: 45000, type: "OUT", date: "2026-06-01" },
  { ref: "WV-2026-002", operator: "Wave", sender: "Client ABC", amount: 150000, type: "IN", date: "2026-06-02" },
  { ref: "OM-2026-003", operator: "Orange Money", sender: "Shell Cocody", amount: 25000, type: "OUT", date: "2026-06-03" },
  { ref: "MTN-2026-004", operator: "MTN MoMo", sender: "Pharmacie Centrale", amount: 12500, type: "OUT", date: "2026-06-03" },
  { ref: "WV-2026-005", operator: "Wave", sender: "Transfert interne", amount: 75000, type: "IN", date: "2026-06-04" },
];

type SyncState = "idle" | "syncing" | "done" | "error";

export function MobileMoneySync({ clientId }: { clientId?: string }) {
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [syncState, setSyncState] = useState<SyncState>("idle");
  const [importedTx, setImportedTx] = useState<typeof MOCK_TRANSACTIONS>([]);
  const [showTx, setShowTx] = useState(false);

  const handleSync = async (operatorId: string) => {
    setSelectedOperator(operatorId);
    setSyncState("syncing");
    setShowTx(false);

    // Simulation appel API opérateur
    await new Promise(r => setTimeout(r, 2000));

    const filtered = MOCK_TRANSACTIONS.filter(tx =>
      tx.operator.toLowerCase().includes(operatorId) || operatorId === "all"
    );
    setImportedTx(MOCK_TRANSACTIONS); // On prend tout pour la démo
    setSyncState("done");
    setShowTx(true);
  };

  const handleSendToCabinet = async () => {
    setSyncState("idle");
    setShowTx(false);
    setImportedTx([]);
    alert(`${importedTx.length} transactions envoyées au moteur IA pour traitement comptable !`);
  };

  return (
    <div className="rounded-[28px] border border-white/5 bg-slate-900/50 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/20 flex items-center justify-center">
          <Smartphone className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h3 className="font-black text-white">Sync Mobile Money</h3>
          <p className="text-xs text-slate-500">Importez vos flux Wave, Orange Money, MTN en 1 clic</p>
        </div>
        <span className="ml-auto px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[10px] font-black uppercase tracking-widest">Option</span>
      </div>

      {/* Operators Grid */}
      <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {OPERATORS.map(op => (
          <button
            key={op.id}
            onClick={() => handleSync(op.id)}
            disabled={syncState === "syncing"}
            className={`
              relative p-4 rounded-2xl border text-center transition-all group
              ${selectedOperator === op.id && syncState !== "idle"
                ? "bg-white/10 border-white/20 scale-95"
                : "bg-slate-800/50 border-white/5 hover:border-white/20 hover:bg-slate-700/50"}
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            <span className="text-3xl block mb-2">{op.emoji}</span>
            <p className="text-xs font-black text-white">{op.name}</p>
            <p className="text-[9px] text-slate-500 mt-0.5">{op.countries.join(" · ")}</p>

            {selectedOperator === op.id && syncState === "syncing" && (
              <div className="absolute inset-0 rounded-2xl flex items-center justify-center bg-slate-900/80">
                <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" />
              </div>
            )}
            {selectedOperator === op.id && syncState === "done" && (
              <div className="absolute top-2 right-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Results */}
      {syncState === "done" && importedTx.length > 0 && (
        <div className="px-6 pb-6 space-y-4 animate-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-bold text-sm">{importedTx.length} transactions récupérées</span>
            </div>
            <button onClick={() => setShowTx(!showTx)} className="text-slate-400 hover:text-white text-xs flex items-center gap-1 transition-colors">
              {showTx ? "Masquer" : "Voir"} <ChevronDown className={`w-3 h-3 transition-transform ${showTx ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {showTx && (
            <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar">
              {importedTx.map(tx => (
                <div key={tx.ref} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-white/5">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${tx.type === "IN" ? "bg-emerald-400" : "bg-rose-400"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{tx.sender}</p>
                    <p className="text-[10px] text-slate-500">{tx.date} · {tx.operator}</p>
                  </div>
                  <span className={`font-black text-sm tabular-nums ${tx.type === "IN" ? "text-emerald-400" : "text-rose-400"}`}>
                    {tx.type === "IN" ? "+" : "-"}{tx.amount.toLocaleString()} F
                  </span>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleSendToCabinet}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 active:scale-95"
          >
            <Zap className="w-4 h-4" />
            Envoyer au Moteur IA pour Traitement Comptable
          </button>
        </div>
      )}
    </div>
  );
}
