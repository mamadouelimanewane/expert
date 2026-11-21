"use client";

import { useState, useCallback } from "react";
import { genererPrevisionCash13Semaines, type PrevisionCash13S, type SemaineFlux } from "@/lib/ohada/cash-forecast-13-semaines";

// ─── Types locaux ────────────────────────────────────────────────────────────

interface FluxLigne {
  encaissements: string;
  decaissements: string;
}

function fluxVide(): FluxLigne {
  return { encaissements: "", decaissements: "" };
}

function initialiserFlux(): FluxLigne[] {
  return Array.from({ length: 13 }, fluxVide);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formaterXOF(val: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", maximumFractionDigits: 0 }).format(val);
}

function couleurAlerte(alerte: SemaineFlux["alerteSolde"]): string {
  if (alerte === "POSITIF") return "bg-green-100 text-green-800 border-green-300";
  if (alerte === "TENDU") return "bg-orange-100 text-orange-800 border-orange-300";
  return "bg-red-100 text-red-800 border-red-300";
}

function labelAlerte(alerte: SemaineFlux["alerteSolde"]): string {
  if (alerte === "POSITIF") return "Positif";
  if (alerte === "TENDU") return "Tendu";
  return "Négatif";
}

function barreProgression(soldeFin: number, soldeMax: number): number {
  if (soldeMax <= 0) return 0;
  const pct = (soldeFin / soldeMax) * 100;
  return Math.max(0, Math.min(100, pct));
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function CashForecast13SPage() {
  const [societe, setSociete] = useState("");
  const [soldeInitial, setSoldeInitial] = useState("");
  const [dateDebut, setDateDebut] = useState(() => new Date().toISOString().slice(0, 10));
  const [flux, setFlux] = useState<FluxLigne[]>(initialiserFlux);
  const [resultat, setResultat] = useState<PrevisionCash13S | null>(null);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const mettreAJourFlux = useCallback(
    (index: number, champ: keyof FluxLigne, valeur: string) => {
      setFlux((prev) => {
        const copie = [...prev];
        copie[index] = { ...copie[index], [champ]: valeur };
        return copie;
      });
    },
    []
  );

  const analyser = useCallback(async () => {
    setErreur(null);
    setResultat(null);

    // Validation basique
    if (!societe.trim()) {
      setErreur("Veuillez saisir la raison sociale.");
      return;
    }
    const soldeNum = parseFloat(soldeInitial.replace(/\s/g, "").replace(",", "."));
    if (isNaN(soldeNum)) {
      setErreur("Le solde initial doit être un nombre valide.");
      return;
    }

    const fluxParsed = flux.map((f, i) => {
      const enc = parseFloat(f.encaissements.replace(/\s/g, "").replace(",", "."));
      const dec = parseFloat(f.decaissements.replace(/\s/g, "").replace(",", "."));
      if (isNaN(enc) || isNaN(dec)) throw new Error(`Semaine ${i + 1} : valeurs invalides.`);
      return { encaissements: enc, decaissements: dec };
    });

    try {
      setChargement(true);

      // Essai via API
      let donneesResultat: PrevisionCash13S | null = null;
      try {
        const reponse = await fetch("/api/analysis/cash-forecast-13s", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            societeRaisonSociale: societe.trim(),
            soldeInitial_XOF: soldeNum,
            fluxHebdomadaires: fluxParsed,
            dateDebut,
          }),
        });
        if (reponse.ok) {
          donneesResultat = await reponse.json();
        }
      } catch {
        // Fallback sur le moteur local
      }

      // Fallback moteur local si API indisponible
      if (!donneesResultat) {
        donneesResultat = genererPrevisionCash13Semaines(
          societe.trim(),
          soldeNum,
          fluxParsed,
          dateDebut
        );
      }

      setResultat(donneesResultat);
    } catch (err: unknown) {
      setErreur(err instanceof Error ? err.message : "Erreur lors de l'analyse.");
    } finally {
      setChargement(false);
    }
  }, [societe, soldeInitial, flux, dateDebut]);

  const reinitialiser = useCallback(() => {
    setSociete("");
    setSoldeInitial("");
    setDateDebut(new Date().toISOString().slice(0, 10));
    setFlux(initialiserFlux());
    setResultat(null);
    setErreur(null);
  }, []);

  // Calcul du solde max pour la barre de progression
  const soldeMax = resultat
    ? Math.max(...resultat.semaines.map((s) => s.soldeFin_XOF), resultat.soldeInitial_XOF, 1)
    : 1;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* En-tête */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Prévision Cash 13 Semaines</h1>
        <p className="mt-1 text-sm text-gray-500">
          Standard Tesorio / Cashforce — Cabinet Expert OHADA 360
        </p>
      </div>

      {/* Formulaire */}
      <section className="bg-white rounded-xl border shadow-sm p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-800">Paramètres de la prévision</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Raison sociale */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Raison sociale *
            </label>
            <input
              type="text"
              value={societe}
              onChange={(e) => setSociete(e.target.value)}
              placeholder="ex: Société Alpha SA"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Solde initial */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Solde initial (XOF) *
            </label>
            <input
              type="text"
              value={soldeInitial}
              onChange={(e) => setSoldeInitial(e.target.value)}
              placeholder="ex: 10000000"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date de début */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de début
            </label>
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Tableau de saisie des flux */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Flux hebdomadaires prévisionnels (XOF)
          </h3>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Semaine</th>
                  <th className="px-3 py-2 text-right font-medium">Encaissements (XOF)</th>
                  <th className="px-3 py-2 text-right font-medium">Décaissements (XOF)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {flux.map((f, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                    <td className="px-3 py-1.5 font-medium text-gray-700">S{i + 1}</td>
                    <td className="px-3 py-1.5">
                      <input
                        type="text"
                        value={f.encaissements}
                        onChange={(e) => mettreAJourFlux(i, "encaissements", e.target.value)}
                        placeholder="0"
                        className="w-full text-right border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
                      />
                    </td>
                    <td className="px-3 py-1.5">
                      <input
                        type="text"
                        value={f.decaissements}
                        onChange={(e) => mettreAJourFlux(i, "decaissements", e.target.value)}
                        placeholder="0"
                        className="w-full text-right border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Erreur */}
        {erreur && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {erreur}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={analyser}
            disabled={chargement}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium px-6 py-2 rounded-lg text-sm transition-colors"
          >
            {chargement ? "Calcul en cours…" : "Générer la prévision"}
          </button>
          <button
            onClick={reinitialiser}
            className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Réinitialiser
          </button>
        </div>
      </section>

      {/* Résultats */}
      {resultat && (
        <section className="space-y-6">
          {/* KPI */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Solde initial</div>
              <div className="text-lg font-bold text-gray-900">{formaterXOF(resultat.soldeInitial_XOF)}</div>
            </div>
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Solde final prévu</div>
              <div className={`text-lg font-bold ${resultat.soldeFinalPrevu_XOF >= 0 ? "text-green-700" : "text-red-700"}`}>
                {formaterXOF(resultat.soldeFinalPrevu_XOF)}
              </div>
            </div>
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Semaines critiques</div>
              <div className={`text-lg font-bold ${resultat.semainesCritiques.length === 0 ? "text-green-700" : "text-red-700"}`}>
                {resultat.semainesCritiques.length} / 13
              </div>
            </div>
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Exercice</div>
              <div className="text-lg font-bold text-gray-900">{resultat.exercice}</div>
            </div>
          </div>

          {/* Alerte semaines critiques */}
          {resultat.semainesCritiques.length > 0 && (
            <div className="bg-red-50 border border-red-300 rounded-xl px-5 py-4">
              <div className="font-semibold text-red-800 mb-1">⚠ Semaines critiques détectées</div>
              <div className="text-sm text-red-700">
                Semaines {resultat.semainesCritiques.map((s) => `S${s}`).join(", ")} présentent un
                solde tendu ou négatif.
              </div>
            </div>
          )}

          {/* Tableau des 13 semaines */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b">
              <h2 className="font-semibold text-gray-800">Tableau des 13 semaines</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left">Sem.</th>
                    <th className="px-4 py-3 text-left">Période</th>
                    <th className="px-4 py-3 text-right">Encaissements</th>
                    <th className="px-4 py-3 text-right">Décaissements</th>
                    <th className="px-4 py-3 text-right">Solde fin</th>
                    <th className="px-4 py-3 text-left">Progression</th>
                    <th className="px-4 py-3 text-center">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {resultat.semaines.map((s) => {
                    const critique = s.alerteSolde !== "POSITIF";
                    return (
                      <tr key={s.semaine} className={critique ? "bg-red-50/40" : ""}>
                        <td className="px-4 py-2.5 font-semibold text-gray-700">S{s.semaine}</td>
                        <td className="px-4 py-2.5 text-gray-500 text-xs whitespace-nowrap">
                          {s.dateDebut} → {s.dateFin}
                        </td>
                        <td className="px-4 py-2.5 text-right text-green-700">
                          {formaterXOF(s.encaissementsPrevisionnels_XOF)}
                        </td>
                        <td className="px-4 py-2.5 text-right text-red-600">
                          {formaterXOF(s.decaissementsPrevisionnels_XOF)}
                        </td>
                        <td className={`px-4 py-2.5 text-right font-semibold ${s.soldeFin_XOF < 0 ? "text-red-700" : "text-gray-900"}`}>
                          {formaterXOF(s.soldeFin_XOF)}
                        </td>
                        <td className="px-4 py-2.5 w-32">
                          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                s.alerteSolde === "POSITIF"
                                  ? "bg-green-500"
                                  : s.alerteSolde === "TENDU"
                                  ? "bg-orange-400"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${barreProgression(s.soldeFin_XOF, soldeMax)}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full border ${couleurAlerte(
                              s.alerteSolde
                            )}`}
                          >
                            {labelAlerte(s.alerteSolde)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Conseil trésorier */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4">
            <div className="text-sm font-semibold text-blue-800 mb-2">
              💡 Conseil du trésorier OHADA
            </div>
            <p className="text-sm text-blue-900 leading-relaxed">{resultat.conseilTresorier}</p>
          </div>
        </section>
      )}
    </div>
  );
}
