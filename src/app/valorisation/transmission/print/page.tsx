"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { calculateDCF, calculateEBITDAMultiple, calculateANR } from "@/lib/valuation-engine";

// Rapport imprimable de valorisation. Recalcule les memes formules reelles
// que /valorisation/transmission a partir des parametres transmis dans
// l'URL (mêmes hypothèses que celles saisies par l'utilisateur).

function fcfa(n: number) {
  return Math.round(n).toLocaleString("fr-FR") + " FCFA";
}

function PrintValorisationInner() {
  const sp = useSearchParams();
  const num = (key: string, fallback: number) => {
    const v = sp?.get(key);
    return v !== null ? Number(v) : fallback;
  };

  const dcfInputs = {
    ca: num("ca", 0),
    croissance: num("croissance", 5),
    actualisation: num("actualisation", 10),
    annees: num("annees", 5),
  };
  const ebitdaInputs = { ebitda: num("ebitda", 0), multiple: num("multiple", 6) };
  const anrInputs = { actif: num("actif", 0), dettes: num("dettes", 0), ajustements: num("ajustements", 0) };
  const dcfComputed = sp?.get("dcfComputed") === "1";

  const valEbitda = calculateEBITDAMultiple(ebitdaInputs.ebitda, ebitdaInputs.multiple);
  const valAnr = calculateANR(anrInputs.actif, anrInputs.dettes, anrInputs.ajustements);

  const dcfResult = useMemo(() => {
    if (!dcfComputed || dcfInputs.ca <= 0) return null;
    try {
      return calculateDCF(dcfInputs.ca, dcfInputs.croissance, dcfInputs.actualisation, dcfInputs.annees);
    } catch {
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dcfComputed, dcfInputs.ca, dcfInputs.croissance, dcfInputs.actualisation, dcfInputs.annees]);

  const valDcf = dcfResult ? dcfResult.enterpriseValue : null;
  const composantes = [valAnr, valEbitda, valDcf].filter((v): v is number => v !== null && v > 0);
  const avgValuation = composantes.length > 0 ? composantes.reduce((a, b) => a + b, 0) / composantes.length : 0;

  useEffect(() => {
    const timer = setTimeout(() => window.print(), 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="font-serif text-sm p-8 max-w-3xl mx-auto text-slate-900">
      <header className="border-b-2 border-black pb-4 mb-8 text-center">
        <p className="text-xs uppercase tracking-widest text-slate-500">Cabinet 360 — Document produit par le cabinet</p>
        <h1 className="text-2xl font-bold uppercase mt-2">Rapport de Valorisation</h1>
        <p className="text-xs mt-1">Évaluation multicritères — estimation indicative, non contractuelle</p>
      </header>

      <section className="mb-8 text-center bg-slate-50 border border-black p-6">
        <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Valeur de synthèse (moyenne des méthodes disponibles)</p>
        <p className="text-3xl font-bold">{composantes.length > 0 ? fcfa(avgValuation) : "Non calculable — aucune méthode renseignée"}</p>
      </section>

      <table className="w-full border-collapse border border-black text-sm mb-8">
        <thead>
          <tr className="bg-slate-100">
            <th className="border border-black px-3 py-2 text-left">Méthode</th>
            <th className="border border-black px-3 py-2 text-left">Hypothèses</th>
            <th className="border border-black px-3 py-2 text-right">Valeur estimée</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-black px-3 py-2 font-bold">Actif Net Réévalué (ANR)</td>
            <td className="border border-black px-3 py-2 text-xs">Actif {fcfa(anrInputs.actif)} — Dettes {fcfa(anrInputs.dettes)} — Ajustements {fcfa(anrInputs.ajustements)}</td>
            <td className="border border-black px-3 py-2 text-right font-mono">{fcfa(valAnr)}</td>
          </tr>
          <tr>
            <td className="border border-black px-3 py-2 font-bold">Multiple EBITDA</td>
            <td className="border border-black px-3 py-2 text-xs">EBITDA {fcfa(ebitdaInputs.ebitda)} × {ebitdaInputs.multiple}</td>
            <td className="border border-black px-3 py-2 text-right font-mono">{fcfa(valEbitda)}</td>
          </tr>
          <tr>
            <td className="border border-black px-3 py-2 font-bold">DCF (flux actualisés)</td>
            <td className="border border-black px-3 py-2 text-xs">
              {dcfComputed
                ? `CA ${fcfa(dcfInputs.ca)} — croissance ${dcfInputs.croissance}% — actualisation ${dcfInputs.actualisation}% — horizon ${dcfInputs.annees} ans`
                : "Non calculé dans la session"}
            </td>
            <td className="border border-black px-3 py-2 text-right font-mono">{valDcf !== null ? fcfa(valDcf) : "N/A"}</td>
          </tr>
        </tbody>
      </table>

      <p className="text-[10px] text-slate-500 italic">
        Rapport généré le {new Date().toLocaleDateString("fr-FR")}. Les méthodes DCF, EBITDA et ANR reposent sur des hypothèses saisies par l&apos;utilisateur ; ce document ne constitue pas un avis de valeur opposable et doit être revu par un professionnel avant toute utilisation dans le cadre d&apos;une transaction.
      </p>
    </div>
  );
}

export default function PrintValorisationPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm">Chargement…</div>}>
      <PrintValorisationInner />
    </Suspense>
  );
}
