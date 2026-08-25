"use client";

import { useEffect, useState } from "react";

// Feuille d'etiquettes imprimables pour les immobilisations (code + libelle +
// categorie), a coller sur le bien lors de l'inventaire physique. Recharge
// la liste reelle depuis l'API, aucune generation de QR code (non disponible
// dans le projet) : l'etiquette porte le code d'immobilisation en texte,
// exploitable comme reference de rapprochement manuel.

interface FixedAsset {
  id: string;
  code: string;
  label: string;
  category: string;
  client: { companyName: string | null; firstName: string | null; lastName: string | null };
}

function clientName(c: FixedAsset["client"]) {
  return c.companyName || `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() || "—";
}

export default function PrintFixedAssetLabels() {
  const [assets, setAssets] = useState<FixedAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/audit/fixed-assets")
      .then((r) => r.json())
      .then((d) => setAssets(d.assets || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => window.print(), 400);
    return () => clearTimeout(timer);
  }, [loading]);

  if (loading) return <div className="p-8 text-sm">Chargement…</div>;

  if (assets.length === 0) {
    return <div className="p-8 text-sm">Aucune immobilisation enregistrée — rien à étiqueter.</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="grid grid-cols-3 gap-3">
        {assets.map((a) => (
          <div key={a.id} className="border border-black rounded-md p-3 text-slate-900 break-inside-avoid">
            <p className="text-[9px] uppercase tracking-widest text-slate-500">Cabinet 360 — Inventaire</p>
            <p className="font-mono font-bold text-sm mt-1">{a.code}</p>
            <p className="text-xs font-bold leading-tight mt-1">{a.label}</p>
            <p className="text-[10px] text-slate-600 mt-1">{a.category}</p>
            <p className="text-[9px] text-slate-500 mt-1 truncate">{clientName(a.client)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
