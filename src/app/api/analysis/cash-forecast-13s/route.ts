import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth-helpers";
import { genererPrevisionCash13Semaines } from "@/lib/ohada/cash-forecast-13-semaines";

export async function POST(request: Request) {
  const authError = await requireStaff();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { societeRaisonSociale, soldeInitial_XOF, fluxHebdomadaires, dateDebut } = body;

    if (!societeRaisonSociale || typeof societeRaisonSociale !== "string") {
      return NextResponse.json(
        { error: "societeRaisonSociale est obligatoire." },
        { status: 400 }
      );
    }

    if (typeof soldeInitial_XOF !== "number") {
      return NextResponse.json(
        { error: "soldeInitial_XOF doit être un nombre." },
        { status: 400 }
      );
    }

    if (!Array.isArray(fluxHebdomadaires) || fluxHebdomadaires.length !== 13) {
      return NextResponse.json(
        { error: "fluxHebdomadaires doit être un tableau de 13 éléments." },
        { status: 400 }
      );
    }

    if (!dateDebut || typeof dateDebut !== "string") {
      return NextResponse.json(
        { error: "dateDebut est obligatoire (format YYYY-MM-DD)." },
        { status: 400 }
      );
    }

    // Validation des flux hebdomadaires
    for (let i = 0; i < fluxHebdomadaires.length; i++) {
      const f = fluxHebdomadaires[i];
      if (typeof f.encaissements !== "number" || typeof f.decaissements !== "number") {
        return NextResponse.json(
          {
            error: `Semaine ${i + 1} : encaissements et decaissements doivent être des nombres.`,
          },
          { status: 400 }
        );
      }
    }

    const prevision = genererPrevisionCash13Semaines(
      societeRaisonSociale,
      soldeInitial_XOF,
      fluxHebdomadaires,
      dateDebut
    );

    return NextResponse.json(prevision);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur interne du serveur.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
