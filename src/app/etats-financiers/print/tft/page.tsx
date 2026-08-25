"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

// Rapport imprimable du Tableau des Flux de Trésorerie — méthode indirecte
// simplifiée (src/lib/ohada/tft-engine.ts). Recharge le calcul réel depuis
// l'API à partir des paramètres transmis dans l'URL, plutôt que de dupliquer
// un résultat déjà calculé côté client.

type LigneTFT = { code: string; label: string; montant: number; isTotal?: boolean };
type TFTData = {
  exploitation: LigneTFT[];
  investissement: LigneTFT[];
  financement: LigneTFT[];
  variationTresorerie: number;
  tresorerieOuverture: number;
  tresorerieClotureCalculee: number;
  ecartControle: number;
  equilibre: boolean;
};

function fcfa(n: number) {
  return Math.round(n).toLocaleString("fr-FR") + " FCFA";
}

function PrintTFTInner() {
  const searchParams = useSearchParams();
  const clientId = searchParams?.get("clientId") || "";
  const periode = searchParams?.get("periode") || "";
  const periodeN1 = searchParams?.get("periodeN1") || "";

  const parametresManquants = !clientId || !periode || !periodeN1;

  const [tft, setTft] = useState<TFTData | null>(null);
  const [clientNom, setClientNom] = useState("");
  const [loading, setLoading] = useState(!parametresManquants);
  const [erreur, setErreur] = useState<string | null>(
    parametresManquants ? "Paramètres manquants (clientId, periode, periodeN1 requis)." : null
  );

  useEffect(() => {
    if (parametresManquants) return;
    Promise.all([
      fetch(`/api/comptabilite/etats-financiers/tft?clientId=${clientId}&periode=${periode}&periodeN1=${periodeN1}`).then((r) => r.json().then((d) => ({ ok: r.ok, d }))),
      fetch(`/api/clients/${clientId}`).then((r) => r.json()).catch(() => null),
    ])
      .then(([{ ok, d }, clientData]) => {
        if (!ok) {
          setErreur(d.error || "Erreur lors du calcul du TFT.");
          return;
        }
        setTft(d.tft);
        setClientNom(clientData?.client?.companyName || [clientData?.client?.firstName, clientData?.client?.lastName].filter(Boolean).join(" ") || "");
      })
      .catch(() => setErreur("Impossible de charger le TFT."))
      .finally(() => setLoading(false));
  }, [clientId, periode, periodeN1, parametresManquants]);

  useEffect(() => {
    if (loading || !tft) return;
    const timer = setTimeout(() => window.print(), 400);
    return () => clearTimeout(timer);
  }, [loading, tft]);

  if (loading) return <div className="p-8 text-sm">Chargement…</div>;
  if (erreur || !tft) return <div className="p-8 text-sm text-red-600">{erreur || "TFT indisponible."}</div>;

  return (
    <div className="font-serif text-sm p-8 max-w-3xl mx-auto text-slate-900">
      <header className="border-b-2 border-black pb-4 mb-8 text-center">
        <p className="text-xs uppercase tracking-widest text-slate-500">Cabinet 360 — Document produit par le cabinet</p>
        <h1 className="text-2xl font-bold uppercase mt-2">Tableau des Flux de Trésorerie</h1>
        <p className="text-xs mt-1">{clientNom || "Client"} — période {periode} (comparé à {periodeN1})</p>
      </header>

      {!tft.equilibre && (
        <div className="mb-6 border border-black p-3 text-xs bg-slate-50">
          Écart de contrôle : {fcfa(tft.ecartControle)}. Vérifiez l&apos;équilibre des bilans N et N-1 avant diffusion.
        </div>
      )}

      {([
        ["FLUX DE TRÉSORERIE D'EXPLOITATION", tft.exploitation],
        ["FLUX DE TRÉSORERIE D'INVESTISSEMENT", tft.investissement],
        ["FLUX DE TRÉSORERIE DE FINANCEMENT", tft.financement],
      ] as const).map(([titre, lignes]) => (
        <table key={titre} className="w-full border-collapse border border-black text-sm mb-6">
          <thead>
            <tr className="bg-slate-100">
              <th colSpan={2} className="border border-black px-3 py-2 text-left">{titre}</th>
            </tr>
          </thead>
          <tbody>
            {lignes.map((l) => (
              <tr key={l.code} className={l.isTotal ? "font-bold bg-slate-50" : ""}>
                <td className="border border-black px-3 py-2">{l.label}</td>
                <td className="border border-black px-3 py-2 text-right font-mono">{fcfa(l.montant)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ))}

      <table className="w-full border-collapse border border-black text-sm">
        <tbody>
          <tr>
            <td className="border border-black px-3 py-2">Trésorerie nette à l&apos;ouverture</td>
            <td className="border border-black px-3 py-2 text-right font-mono">{fcfa(tft.tresorerieOuverture)}</td>
          </tr>
          <tr>
            <td className="border border-black px-3 py-2">Variation de la trésorerie nette</td>
            <td className="border border-black px-3 py-2 text-right font-mono">{fcfa(tft.variationTresorerie)}</td>
          </tr>
          <tr className="font-bold bg-slate-100">
            <td className="border border-black px-3 py-2">Trésorerie nette à la clôture</td>
            <td className="border border-black px-3 py-2 text-right font-mono">{fcfa(tft.tresorerieClotureCalculee)}</td>
          </tr>
        </tbody>
      </table>

      <p className="text-[10px] text-slate-500 mt-6 italic">
        Rapport généré le {new Date().toLocaleDateString("fr-FR")}. Méthode indirecte simplifiée : chaque flux est calculé à partir de la variation
        des postes du bilan entre les deux périodes, sans détail des mouvements de l&apos;exercice (acquisitions/cessions d&apos;immobilisations,
        dividendes versés) — contrairement à la présentation SYSCOHADA intégrale. À faire valider par un professionnel avant diffusion.
      </p>
    </div>
  );
}

export default function PrintTFTPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm">Chargement…</div>}>
      <PrintTFTInner />
    </Suspense>
  );
}
