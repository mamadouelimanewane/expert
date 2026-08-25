"use client";

import { useEffect, useState } from "react";

// Rapport imprimable d'inventaire des immobilisations. Recharge la meme
// liste reelle que /audit/fixed-assets (aucune donnee serialisee transmise)
// et calcule le tableau d'amortissement lineaire a partir des champs reels
// du modele (usefulLifeYears / residualValue / serviceDate).

interface FixedAsset {
  id: string;
  code: string;
  label: string;
  category: string;
  purchaseDate: string;
  value: number;
  location: string | null;
  status: "FOUND" | "MISSING" | "TO_VERIFY" | "DISPOSED";
  depreciationMethod?: "LINEAIRE" | "DEGRESSIF" | "NON_AMORTISSABLE";
  usefulLifeYears?: number | null;
  residualValue?: number;
  serviceDate?: string | null;
  client: { companyName: string | null; firstName: string | null; lastName: string | null };
}

const STATUS_LABEL: Record<string, string> = {
  FOUND: "Trouvé",
  MISSING: "Manquant",
  TO_VERIFY: "À vérifier",
  DISPOSED: "Cédé/Rebut",
};

function fcfa(n: number) {
  return Math.round(n).toLocaleString("fr-FR") + " FCFA";
}

function clientName(c: FixedAsset["client"]) {
  return c.companyName || `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() || "—";
}

function computeLinear(asset: FixedAsset) {
  if (asset.depreciationMethod === "NON_AMORTISSABLE") return { status: "non-amortissable" as const };
  if (asset.depreciationMethod === "DEGRESSIF") return { status: "degressif" as const };
  if (!asset.usefulLifeYears || asset.usefulLifeYears <= 0) return { status: "non-renseigne" as const };

  const base = asset.value - (asset.residualValue || 0);
  const annuelle = base / asset.usefulLifeYears;
  const start = new Date(asset.serviceDate || asset.purchaseDate);
  const now = new Date();
  const monthsElapsed = Math.max(0, (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()));
  const yearsElapsed = Math.min(asset.usefulLifeYears, monthsElapsed / 12);
  const cumul = Math.min(base, annuelle * yearsElapsed);
  const vnc = Math.max(asset.residualValue || 0, asset.value - cumul);

  return { status: "ok" as const, annuelle, cumul, vnc };
}

export default function PrintFixedAssetsReport() {
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

  const foundCount = assets.filter((a) => a.status === "FOUND").length;
  const coveragePct = assets.length > 0 ? Math.round((foundCount / assets.length) * 100) : 0;
  const totalValue = assets.reduce((s, a) => s + a.value, 0);
  const ecarts = assets.filter((a) => a.status === "MISSING" || a.status === "TO_VERIFY");
  const amortissables = assets.filter((a) => a.depreciationMethod !== "NON_AMORTISSABLE" && a.usefulLifeYears);

  return (
    <div className="font-serif text-sm p-8 max-w-5xl mx-auto text-slate-900">
      <header className="border-b-2 border-black pb-4 mb-8 text-center">
        <p className="text-xs uppercase tracking-widest text-slate-500">Cabinet 360 — Document produit par le cabinet</p>
        <h1 className="text-2xl font-bold uppercase mt-2">Rapport d'Inventaire des Immobilisations</h1>
        <p className="text-xs mt-1">Audit physique et rapprochement — {new Date().toLocaleDateString("fr-FR")}</p>
      </header>

      <section className="grid grid-cols-3 gap-4 mb-8 text-center">
        <div className="border border-black p-3">
          <p className="text-[10px] uppercase text-slate-500">Taux de couverture</p>
          <p className="text-xl font-bold">{foundCount} / {assets.length} ({coveragePct}%)</p>
        </div>
        <div className="border border-black p-3">
          <p className="text-[10px] uppercase text-slate-500">Valeur d'acquisition totale</p>
          <p className="text-xl font-bold">{fcfa(totalValue)}</p>
        </div>
        <div className="border border-black p-3">
          <p className="text-[10px] uppercase text-slate-500">Écarts détectés</p>
          <p className="text-xl font-bold">{ecarts.length}</p>
        </div>
      </section>

      <h2 className="font-bold uppercase text-sm mb-2 mt-8">Inventaire complet</h2>
      <table className="w-full border-collapse border border-black text-xs mb-8">
        <thead>
          <tr className="bg-slate-100">
            <th className="border border-black px-2 py-1 text-left">Code</th>
            <th className="border border-black px-2 py-1 text-left">Libellé</th>
            <th className="border border-black px-2 py-1 text-left">Client</th>
            <th className="border border-black px-2 py-1 text-left">Catégorie</th>
            <th className="border border-black px-2 py-1 text-left">Lieu</th>
            <th className="border border-black px-2 py-1 text-right">Valeur</th>
            <th className="border border-black px-2 py-1 text-left">Statut</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((a) => (
            <tr key={a.id}>
              <td className="border border-black px-2 py-1 font-mono">{a.code}</td>
              <td className="border border-black px-2 py-1">{a.label}</td>
              <td className="border border-black px-2 py-1">{clientName(a.client)}</td>
              <td className="border border-black px-2 py-1">{a.category}</td>
              <td className="border border-black px-2 py-1">{a.location || "—"}</td>
              <td className="border border-black px-2 py-1 text-right font-mono">{fcfa(a.value)}</td>
              <td className="border border-black px-2 py-1">{STATUS_LABEL[a.status]}</td>
            </tr>
          ))}
          {assets.length === 0 && (
            <tr><td colSpan={7} className="border border-black px-2 py-4 text-center text-slate-500">Aucune immobilisation enregistrée.</td></tr>
          )}
        </tbody>
      </table>

      <h2 className="font-bold uppercase text-sm mb-2 mt-8">Écarts à régulariser</h2>
      {ecarts.length === 0 ? (
        <p className="text-xs text-slate-500 mb-8">Aucun écart — tous les biens inventoriés sont confirmés « Trouvé ».</p>
      ) : (
        <table className="w-full border-collapse border border-black text-xs mb-8">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-black px-2 py-1 text-left">Code</th>
              <th className="border border-black px-2 py-1 text-left">Libellé</th>
              <th className="border border-black px-2 py-1 text-left">Client</th>
              <th className="border border-black px-2 py-1 text-left">Statut</th>
            </tr>
          </thead>
          <tbody>
            {ecarts.map((a) => (
              <tr key={a.id}>
                <td className="border border-black px-2 py-1 font-mono">{a.code}</td>
                <td className="border border-black px-2 py-1">{a.label}</td>
                <td className="border border-black px-2 py-1">{clientName(a.client)}</td>
                <td className="border border-black px-2 py-1">{STATUS_LABEL[a.status]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 className="font-bold uppercase text-sm mb-2 mt-8">Tableau d'amortissement (méthode linéaire)</h2>
      {amortissables.length === 0 ? (
        <p className="text-xs text-slate-500">Aucune immobilisation ne comporte de durée d'utilité renseignée — tableau non calculable.</p>
      ) : (
        <table className="w-full border-collapse border border-black text-xs">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-black px-2 py-1 text-left">Code</th>
              <th className="border border-black px-2 py-1 text-left">Libellé</th>
              <th className="border border-black px-2 py-1 text-right">Valeur d'origine</th>
              <th className="border border-black px-2 py-1 text-right">Dotation annuelle</th>
              <th className="border border-black px-2 py-1 text-right">Cumul amortissements</th>
              <th className="border border-black px-2 py-1 text-right">Valeur nette comptable</th>
            </tr>
          </thead>
          <tbody>
            {amortissables.map((a) => {
              const d = computeLinear(a);
              return (
                <tr key={a.id}>
                  <td className="border border-black px-2 py-1 font-mono">{a.code}</td>
                  <td className="border border-black px-2 py-1">{a.label}</td>
                  <td className="border border-black px-2 py-1 text-right font-mono">{fcfa(a.value)}</td>
                  {d.status === "ok" ? (
                    <>
                      <td className="border border-black px-2 py-1 text-right font-mono">{fcfa(d.annuelle)}</td>
                      <td className="border border-black px-2 py-1 text-right font-mono">{fcfa(d.cumul)}</td>
                      <td className="border border-black px-2 py-1 text-right font-mono font-bold">{fcfa(d.vnc)}</td>
                    </>
                  ) : (
                    <td colSpan={3} className="border border-black px-2 py-1 text-center text-slate-500">
                      {d.status === "degressif" ? "Méthode dégressive — calcul non automatisé" : "Non applicable"}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <p className="text-[10px] text-slate-500 mt-6 italic">
        Rapport généré le {new Date().toLocaleDateString("fr-FR")}. Le tableau d'amortissement linéaire n'est calculé que pour les immobilisations dont la durée d'utilité est renseignée dans la fiche ; les autres méthodes ou biens sans durée renseignée sont signalés comme tels et doivent être traités séparément.
      </p>
    </div>
  );
}
