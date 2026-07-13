"use client";

import { useRef, useEffect, useState } from "react";

interface SignaturePadProps {
  onSign: (dataUrl: string | null) => void;
}

export function SignaturePad({ onSign }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    }
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let x, y;
    if ("touches" in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = (e as React.MouseEvent).clientX - rect.left;
      y = (e as React.MouseEvent).clientY - rect.top;
    }
    return { x, y };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    setHasSignature(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      const { x, y } = getCoordinates(e);
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      const { x, y } = getCoordinates(e);
      if (ctx) {
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }
  };

  const endDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      onSign(canvasRef.current.toDataURL());
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasSignature(false);
        onSign(null);
      }
    }
  };

  return (
    <div className="w-full">
      <div className="relative border-2 border-dashed border-slate-600 rounded-xl overflow-hidden bg-slate-900 cursor-crosshair touch-none">
        <canvas
          ref={canvasRef}
          width={500}
          height={200}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
          className="w-full h-[200px]"
        />
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-slate-500 font-bold uppercase tracking-widest text-xs opacity-50">Signez ici</span>
          </div>
        )}
      </div>
      <div className="flex justify-end mt-2">
        <button 
          onClick={clear}
          className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
        >
          Effacer
        </button>
      </div>
    </div>
  );
}
