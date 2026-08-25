"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

// Rapport imprimable du simulateur de droits de douane. Recalcule les memes
// formules reelles que /douanes/simulateur a partir des parametres transmis
// dans l'URL, plutot que de dupliquer un resultat deja calcule cote client.
const RS_RATE = 0.01;
const PCS_RATE = 0.008;
const TVA_RATE = 0.18;

const CATEGORY_LABELS: Record<string, string> = {
  "0": "Cat 0 : Biens sociaux essentiels (0%)",
  "5": "Cat 1 : Biens de première nécessité (5%)",
  "10": "Cat 2 : Intrants et biens d'équipement (10%)",
  "20": "Cat 3 : Biens finaux de consommation (20%)",
  "35": "Cat 4 : Biens spécifiques de développement économique (35%)",
};

function formatFCFA(val: number) {
  return new Intl.NumberFormat("fr-FR").format(Math.round(val)) + " FCFA";
}

function PrintSimulateurInner() {
  const searchParams = useSearchParams();
  const caf = parseInt(searchParams?.get("caf") || "0", 10) || 0;
  const category = parseInt(searchParams?.get("category") || "10", 10);

  const droitsDouane = caf * (category / 100);
  const rs = caf * RS_RATE;
  const pcs = caf * PCS_RATE;
  const assietteTva = caf + droitsDouane + rs + pcs;
  const tva = assietteTva * TVA_RATE;
  const total = droitsDouane + rs + pcs + tva;

  useEffect(() => {
    const timer = setTimeout(() => window.print(), 400);
    return () => clearTimeout(timer);
  }, []);

  if (!caf) {
    return <div className="p-8 text-sm">Valeur CAF manquante (paramètre ?caf= requis).</div>;
  }

  return (
    <div className="font-serif text-sm p-8 max-w-3xl mx-auto text-slate-900">
      <header className="border-b-2 border-black pb-4 mb-8 text-center">
        <p className="text-xs uppercase tracking-widest text-slate-500">Cabinet 360 — Document produit par le cabinet</p>
        <h1 className="text-2xl font-bold uppercase mt-2">Simulation de Droits de Douane</h1>
        <p className="text-xs mt-1">TEC CEDEAO/CEMAC — estimation indicative, non contractuelle</p>
      </header>

      <table className="w-full border-collapse border border-black text-sm">
        <tbody>
          <tr>
            <td className="border border-black px-3 py-2 font-bold w-1/2">Valeur CAF d&apos;origine</td>
            <td className="border border-black px-3 py-2 text-right font-mono">{formatFCFA(caf)}</td>
          </tr>
          <tr>
            <td className="border border-black px-3 py-2">Catégorie tarifaire</td>
            <td className="border border-black px-3 py-2 text-right">{CATEGORY_LABELS[String(category)] || `${category}%`}</td>
          </tr>
          <tr>
            <td className="border border-black px-3 py-2">Droits de Douane (DD {category}%)</td>
            <td className="border border-black px-3 py-2 text-right font-mono">{formatFCFA(droitsDouane)}</td>
          </tr>
          <tr>
            <td className="border border-black px-3 py-2">Redevance Statistique (RS 1%)</td>
            <td className="border border-black px-3 py-2 text-right font-mono">{formatFCFA(rs)}</td>
          </tr>
          <tr>
            <td className="border border-black px-3 py-2">Prélèvement Communautaire (PCS 0,8%)</td>
            <td className="border border-black px-3 py-2 text-right font-mono">{formatFCFA(pcs)}</td>
          </tr>
          <tr>
            <td className="border border-black px-3 py-2">TVA (18%)</td>
            <td className="border border-black px-3 py-2 text-right font-mono">{formatFCFA(tva)}</td>
          </tr>
          <tr className="bg-slate-100">
            <td className="border border-black px-3 py-2 font-bold uppercase">Total Taxes à Payer</td>
            <td className="border border-black px-3 py-2 text-right font-mono font-bold text-base">{formatFCFA(total)}</td>
          </tr>
        </tbody>
      </table>

      <p className="text-[10px] text-slate-500 mt-6 italic">
        Simulation générée le {new Date().toLocaleDateString("fr-FR")} à partir des taux TEC standards. Les taux réels applicables dépendent du code SH exact de la marchandise et doivent être confirmés auprès des services douaniers.
      </p>
    </div>
  );
}

export default function PrintSimulateurPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm">Chargement…</div>}>
      <PrintSimulateurInner />
    </Suspense>
  );
}
