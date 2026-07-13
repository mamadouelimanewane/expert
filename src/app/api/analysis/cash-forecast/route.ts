import { NextResponse } from "next/server";
import { generateForecast, detectCriticalPoints } from "@/lib/forecast-engine";

export async function GET() {
  const baseCash = 18400000; // 18.4M FCFA

  const optimiste = generateForecast(baseCash, 'optimiste');
  const realiste = generateForecast(baseCash, 'realiste');
  const pessimiste = generateForecast(baseCash, 'pessimiste');

  const events = [
    { id: 1, date: optimiste[1].date, libelle: "Paiement Facture Sonatel", encaissement: 1200000, decaissement: 0, solde: 0 },
    { id: 2, date: optimiste[2].date, libelle: "TVA Mois précédent", encaissement: 0, decaissement: 4500000, solde: 0 },
    { id: 3, date: optimiste[3].date, libelle: "Salaires", encaissement: 0, decaissement: 8500000, solde: 0 },
    { id: 4, date: optimiste[5].date, libelle: "Acompte Client Eiffage", encaissement: 3500000, decaissement: 0, solde: 0 },
    { id: 5, date: optimiste[7].date, libelle: "Paiement Fournisseur IT", encaissement: 0, decaissement: 1100000, solde: 0 },
    { id: 6, date: optimiste[8].date, libelle: "Loyer Trimestre", encaissement: 0, decaissement: 3000000, solde: 0 },
    { id: 7, date: optimiste[10].date, libelle: "Solde Mission Conseil", encaissement: 5000000, decaissement: 0, solde: 0 },
    { id: 8, date: optimiste[12].date, libelle: "Charges Sociales", encaissement: 0, decaissement: 2100000, solde: 0 }
  ];

  // Calculate projected balance for events based on realiste scenario
  let currentEventCash = baseCash;
  events.forEach(ev => {
    currentEventCash = currentEventCash + ev.encaissement - ev.decaissement;
    ev.solde = currentEventCash;
  });

  return NextResponse.json({
    baseCash,
    scenarios: {
      optimiste,
      realiste,
      pessimiste
    },
    criticals: detectCriticalPoints(pessimiste),
    events
  });
}
