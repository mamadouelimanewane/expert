import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-auth";

// Taux de change reels (USD, GNF vers FCFA/XOF), recuperes aupres d'une API
// publique gratuite sans cle (fawazahmed0/currency-api, source agregee de
// donnees de marche, CDN jsdelivr). La parite EUR/FCFA reste geree cote
// page car elle est fixe par traite UEMOA, pas une donnee de marche.
// Aucune cle API requise ; si la source est indisponible, la route renvoie
// une erreur explicite plutot qu'un taux invente.

const SOURCE = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json";

export async function GET() {
  const { denied } = await requireStaff();
  if (denied) return denied;

  try {
    const res = await fetch(SOURCE, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`Réponse ${res.status}`);
    const data = await res.json();

    const xofPerUsd = data?.usd?.xof;
    const gnfPerUsd = data?.usd?.gnf;
    if (typeof xofPerUsd !== "number" || typeof gnfPerUsd !== "number") {
      throw new Error("Format de réponse inattendu");
    }

    // FCFA (XOF) pour 1 unité de chaque devise.
    const xofPerGnf = xofPerUsd / gnfPerUsd;

    return NextResponse.json({
      xofPerUsd,
      xofPerGnf,
      date: data?.date ?? null,
      source: "fawazahmed0/currency-api",
    });
  } catch (error) {
    console.error("Erreur GET fx/rates:", error);
    return NextResponse.json({ error: "Impossible de récupérer les taux de change en temps réel." }, { status: 502 });
  }
}
