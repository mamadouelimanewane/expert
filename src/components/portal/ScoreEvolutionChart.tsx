"use client";

import { useEffect, useRef } from "react";

interface ScorePoint {
  month: string;
  score: number;
}

interface ScoreEvolutionChartProps {
  data: ScorePoint[];
  color?: string;
  height?: number;
}

export function ScoreEvolutionChart({ data, color = "#6366f1", height = 120 }: ScoreEvolutionChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length < 2) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const pad = { top: 10, right: 16, bottom: 28, left: 32 };
    const chartW = w - pad.left - pad.right;
    const chartH = h - pad.top - pad.bottom;

    ctx.clearRect(0, 0, w, h);

    const maxScore = 100;
    const minScore = Math.max(0, Math.min(...data.map(d => d.score)) - 10);

    const xStep = chartW / (data.length - 1);
    const yScale = (score: number) =>
      pad.top + chartH - ((score - minScore) / (maxScore - minScore)) * chartH;

    const points = data.map((d, i) => ({ x: pad.left + i * xStep, y: yScale(d.score) }));

    // Grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    [25, 50, 75, 100].forEach(val => {
      const y = yScale(val);
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + chartW, y);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.font = "10px Inter, sans-serif";
      ctx.fillText(String(val), 2, y + 4);
    });

    // Gradient fill
    const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
    grad.addColorStop(0, color + "40");
    grad.addColorStop(1, color + "00");

    ctx.beginPath();
    ctx.moveTo(points[0].x, pad.top + chartH);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, pad.top + chartH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((p, i) => {
      if (i === 0) return;
      const prev = points[i - 1];
      const cpX = (prev.x + p.x) / 2;
      ctx.bezierCurveTo(cpX, prev.y, cpX, p.y, p.x, p.y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.stroke();

    // Points & month labels
    data.forEach((d, i) => {
      const p = points[i];
      // Dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.strokeStyle = color + "44";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Month label
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.font = "9px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(d.month, p.x, h - 6);

      // Score on last point
      if (i === data.length - 1) {
        ctx.fillStyle = color;
        ctx.font = "bold 11px Inter, sans-serif";
        ctx.fillText(String(d.score), p.x, p.y - 12);
      }
    });

  }, [data, color, height]);

  return <canvas ref={canvasRef} width={480} height={height} className="w-full" />;
}
