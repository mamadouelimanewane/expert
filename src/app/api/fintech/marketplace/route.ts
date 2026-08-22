import { NextResponse } from "next/server";

import { requireStaff } from "@/lib/api-auth";
export async function GET() {
    const { denied } = await requireStaff();
    if (denied) return denied;

  const partners = [
    { id: "p1", name: "Banque Atlantique", type: "Banque Commerciale", initials: "BA", color: "blue", products: ["Crédit Trésorerie", "Financement BFR"], minScore: 65 },
    { id: "p2", name: "Ecobank", type: "Banque Panafricaine", initials: "ECO", color: "emerald", products: ["Prêt Investissement", "Leasing"], minScore: 70 },
    { id: "p3", name: "SGBS", type: "Banque Internationale", initials: "SG", color: "red", products: ["Ligne d'Escompte", "Crédit Bail"], minScore: 75 },
    { id: "p4", name: "BICIS", type: "Banque Commerciale", initials: "BIC", color: "emerald", products: ["Prêt Moyen Terme", "Financement Export"], minScore: 70 },
    { id: "p5", name: "Microcred", type: "Microfinance", initials: "MC", color: "orange", products: ["Microcrédit", "Avance sur Facture"], minScore: 40 },
    { id: "p6", name: "Orange Bank Africa", type: "Mobile Banking", initials: "OBA", color: "orange", products: ["Crédit Express", "Micro-épargne"], minScore: 50 },
  ];
  return NextResponse.json({ partners });
}

export async function POST(req: Request) {
    const { denied } = await requireStaff();
    if (denied) return denied;

  const body = await req.json();
  return NextResponse.json({
    success: true,
    requestId: `REQ-${Date.now()}`
  });
}
