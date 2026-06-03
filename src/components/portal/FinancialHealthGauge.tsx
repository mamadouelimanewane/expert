"use client";

import { useEffect, useRef } from "react";
import { TrendingUp, TrendingDown, Star, Award, AlertTriangle, ShieldCheck } from "lucide-react";

interface FinancialHealthGaugeProps {
  score: number; // 0 - 100
  rating: string; // AAA, AA, A, B, C
  clientName?: string;
  compact?: boolean;
}

function getRatingConfig(rating: string) {
  switch (rating) {
    case "AAA":
      return { label: "Excellent", color: "#10b981", bg: "from-emerald-500/20 to-emerald-600/5", border: "border-emerald-500/30", icon: Award, text: "text-emerald-400" };
    case "AA":
      return { label: "Très Bon", color: "#6366f1", bg: "from-indigo-500/20 to-indigo-600/5", border: "border-indigo-500/30", icon: ShieldCheck, text: "text-indigo-400" };
    case "A":
      return { label: "Bon", color: "#3b82f6", bg: "from-blue-500/20 to-blue-600/5", border: "border-blue-500/30", icon: TrendingUp, text: "text-blue-400" };
    case "B":
      return { label: "Moyen", color: "#f59e0b", bg: "from-amber-500/20 to-amber-600/5", border: "border-amber-500/30", icon: Star, text: "text-amber-400" };
    case "C":
      return { label: "À améliorer", color: "#ef4444", bg: "from-rose-500/20 to-rose-600/5", border: "border-rose-500/30", icon: AlertTriangle, text: "text-rose-400" };
    default:
      return { label: "Non évalué", color: "#64748b", bg: "from-slate-500/20 to-slate-600/5", border: "border-slate-500/30", icon: Star, text: "text-slate-400" };
  }
}

export function FinancialHealthGauge({ score, rating, clientName, compact = false }: FinancialHealthGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const config = getRatingConfig(rating);
  const Icon = config.icon;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h * 0.72;
    const radius = compact ? 70 : 100;
    const startAngle = Math.PI;
    const endAngle = 2 * Math.PI;
    const progressAngle = startAngle + (score / 100) * Math.PI;

    ctx.clearRect(0, 0, w, h);

    // Track (background arc)
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.lineWidth = compact ? 12 : 16;
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineCap = "round";
    ctx.stroke();

    // Score arc with gradient
    const grad = ctx.createLinearGradient(cx - radius, cy, cx + radius, cy);
    grad.addColorStop(0, "#6366f1");
    grad.addColorStop(0.5, config.color);
    grad.addColorStop(1, config.color);

    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, progressAngle);
    ctx.lineWidth = compact ? 12 : 16;
    ctx.strokeStyle = grad;
    ctx.lineCap = "round";
    ctx.stroke();

    // Glow effect at tip
    const tipX = cx + radius * Math.cos(progressAngle);
    const tipY = cy + radius * Math.sin(progressAngle);
    const glow = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, compact ? 16 : 22);
    glow.addColorStop(0, config.color + "cc");
    glow.addColorStop(1, "transparent");
    ctx.beginPath();
    ctx.arc(tipX, tipY, compact ? 14 : 20, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

  }, [score, rating, compact, config.color]);

  if (compact) {
    return (
      <div className={`relative flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br ${config.bg} border ${config.border}`}>
        <div className="relative">
          <canvas ref={canvasRef} width={120} height={70} />
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
            <span className={`text-xl font-black ${config.text}`}>{score}</span>
          </div>
        </div>
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Score Santé</p>
          <p className={`text-xl font-black ${config.text}`}>{rating}</p>
          <p className="text-xs text-slate-400">{config.label}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative p-6 rounded-[28px] bg-gradient-to-br ${config.bg} border ${config.border} overflow-hidden`}>
      {/* Background glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10 blur-3xl" style={{ background: config.color }} />

      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black">Score de Santé Financière</p>
          {clientName && <p className="text-slate-300 text-sm font-semibold mt-0.5">{clientName}</p>}
        </div>
        <div className={`p-2 rounded-xl ${config.border} border bg-white/5`}>
          <Icon className={`w-5 h-5 ${config.text}`} />
        </div>
      </div>

      {/* Gauge Canvas */}
      <div className="relative flex justify-center">
        <canvas ref={canvasRef} width={240} height={140} />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <span className={`text-5xl font-black tabular-nums ${config.text}`}>{score}</span>
          <span className="text-slate-500 text-xs font-bold">/ 100</span>
        </div>
      </div>

      {/* Rating badge */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-3xl font-black ${config.text}`}>{rating}</span>
          <span className="text-slate-400 text-sm">{config.label}</span>
        </div>
        <div className="flex gap-1">
          {["C", "B", "A", "AA", "AAA"].map((r) => (
            <div
              key={r}
              className={`h-1.5 rounded-full transition-all ${r === rating ? "w-6" : "w-2 opacity-30"}`}
              style={{ background: r === rating ? config.color : "#475569" }}
            />
          ))}
        </div>
      </div>

      {/* Facteurs clés */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          { label: "Régularité", val: Math.min(100, score + 5), icon: "📋" },
          { label: "Trésorerie", val: Math.max(0, score - 10), icon: "💰" },
          { label: "Croissance", val: Math.min(100, score + 12), icon: "📈" },
        ].map((f) => (
          <div key={f.label} className="bg-white/5 rounded-xl p-2 text-center border border-white/5">
            <span className="text-lg">{f.icon}</span>
            <div className="mt-1 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${f.val}%`, background: config.color }} />
            </div>
            <p className="text-[9px] text-slate-500 font-bold mt-1 uppercase">{f.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
