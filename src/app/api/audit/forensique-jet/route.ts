import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth-helpers";
import {
  executerAuditForensiqueISA240,
  type EcritureGrandLivreJET,
} from "@/lib/ohada/audit-forensique-jet";

export async function POST(req: Request) {
  const denied = await requireStaff();
  if (denied) return denied;

  try {
    const body: unknown = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
    }
    const input = body as Record<string, unknown>;
    const societeRaisonSociale = input.societeRaisonSociale;
    const exercice = input.exercice;
    const lignes = input.ecritures;
    if (typeof societeRaisonSociale !== "string" || !societeRaisonSociale.trim()
      || typeof exercice !== "number" || !Number.isInteger(exercice) || exercice < 1900 || exercice > new Date().getFullYear()
      || !Array.isArray(lignes) || lignes.length === 0 || lignes.length > 50_000) {
      return NextResponse.json({ error: "Raison sociale, exercice valide et grand livre réel (1 à 50 000 lignes) requis." }, { status: 400 });
    }
    const ecrituresValidees: EcritureGrandLivreJET[] = [];
    const identifiants = new Set<string>();
    for (const value of lignes as unknown[]) {
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        return NextResponse.json({ error: "Une ligne du grand livre n’a pas le format attendu." }, { status: 400 });
      }
      const ligne = value as Record<string, unknown>;
      const dateComptable = ligne.dateComptable;
      const date = typeof dateComptable === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateComptable)
        ? new Date(`${dateComptable}T00:00:00Z`)
        : null;
      if (typeof ligne.id !== "string" || !ligne.id.trim() || ligne.id.length > 100 || identifiants.has(ligne.id)
        || !date || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== dateComptable || date.getUTCFullYear() !== exercice
        || typeof ligne.heureSaisie !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(ligne.heureSaisie)
        || typeof ligne.jourSemaine !== "number" || ligne.jourSemaine !== date.getUTCDay()
        || typeof ligne.utilisateur !== "string" || !ligne.utilisateur.trim() || ligne.utilisateur.length > 100
        || (ligne.valideur !== undefined && (typeof ligne.valideur !== "string" || ligne.valideur.length > 100))
        || typeof ligne.journalCode !== "string" || !ligne.journalCode.trim() || ligne.journalCode.length > 20
        || typeof ligne.compteDebit !== "string" || !/^[\da-zA-Z.-]{1,20}$/.test(ligne.compteDebit)
        || typeof ligne.compteCredit !== "string" || !/^[\da-zA-Z.-]{1,20}$/.test(ligne.compteCredit)
        || typeof ligne.libelle !== "string" || !ligne.libelle.trim() || ligne.libelle.length > 500
        || typeof ligne.montant_XOF !== "number" || !Number.isFinite(ligne.montant_XOF) || ligne.montant_XOF <= 0
        || typeof ligne.hasPieceJustificative !== "boolean") {
        return NextResponse.json({ error: "Une écriture est invalide ou ne correspond pas à l’exercice déclaré." }, { status: 400 });
      }
      identifiants.add(ligne.id);
      ecrituresValidees.push(ligne as unknown as EcritureGrandLivreJET);
    }
    const rapport = executerAuditForensiqueISA240(
      societeRaisonSociale.trim(),
      exercice,
      ecrituresValidees
    );
    return NextResponse.json(rapport);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur interne" },
      { status: 500 }
    );
  }
}
