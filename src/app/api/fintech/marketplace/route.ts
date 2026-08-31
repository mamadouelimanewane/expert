import { NextResponse } from "next/server";

import { requireStaff } from "@/lib/api-auth";

// Repertoire de reference (noms et gammes de produits publics des etablissements).
// Le POST de soumission de dossier a ete retire : il repondait { success: true,
// requestId: `REQ-${Date.now()}` } sans rien enregistrer ni transmettre a aucune
// banque — un horodatage deguise en numero de dossier de financement. Aucune
// integration bancaire n'existe ; la page renvoie l'utilisateur vers un contact
// direct avec l'etablissement.
//
// Les seuils d'eligibilite (minScore) ont ete retires : ils n'etaient pas publies
// par ces etablissements et n'etaient affiches nulle part.
export async function GET() {
    const { denied } = await requireStaff();
    if (denied) return denied;

  const partners = [
    { id: "p1", name: "Banque Atlantique", type: "Banque Commerciale", initials: "BA", color: "blue", products: ["Crédit Trésorerie", "Financement BFR"] },
    { id: "p2", name: "Ecobank", type: "Banque Panafricaine", initials: "ECO", color: "emerald", products: ["Prêt Investissement", "Leasing"] },
    { id: "p3", name: "SGBS", type: "Banque Internationale", initials: "SG", color: "red", products: ["Ligne d'Escompte", "Crédit Bail"] },
    { id: "p4", name: "BICIS", type: "Banque Commerciale", initials: "BIC", color: "emerald", products: ["Prêt Moyen Terme", "Financement Export"] },
    { id: "p5", name: "Microcred", type: "Microfinance", initials: "MC", color: "orange", products: ["Microcrédit", "Avance sur Facture"] },
    { id: "p6", name: "Orange Bank Africa", type: "Mobile Banking", initials: "OBA", color: "orange", products: ["Crédit Express", "Micro-épargne"] },
  ];
  return NextResponse.json({ partners });
}
