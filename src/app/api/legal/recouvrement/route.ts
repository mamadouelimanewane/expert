import { NextRequest, NextResponse } from "next/server";
import { requireStaff, requireWriteAccess } from "@/lib/api-auth";
import {
  genererRequeteInjonctionPayer,
  calculerDelaisProceduraux,
  RequeteIPParams,
} from "@/lib/ohada/recouvrement-aupsrve";
import { AuditService } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const { denied } = await requireStaff();
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const dateSignification = searchParams.get("dateSignification");

  if (dateSignification) {
    try {
      const delais = calculerDelaisProceduraux(dateSignification);
      return NextResponse.json({ ok: true, delais });
    } catch (e) {
      return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 400 });
    }
  }

  return NextResponse.json({ ok: false, error: "Aucune requête ne peut être générée sans les données et pièces justificatives du dossier réel." }, { status: 409 });
}

export async function POST(req: NextRequest) {
  const { session, denied } = await requireWriteAccess();
  if (denied) return denied;

  try {
    const params = (await req.json()) as RequeteIPParams;
    const textes = [params.juridiction, params.ville, params.creancier?.denominationOuNom, params.creancier?.formeJuridique, params.creancier?.rccmOuNinea, params.creancier?.adresse, params.creancier?.ville, params.creancier?.pays, params.creancier?.representantLegal, params.debiteur?.denominationOuNom, params.debiteur?.formeJuridique, params.debiteur?.rccmOuNinea, params.debiteur?.adresse, params.debiteur?.ville, params.debiteur?.pays, params.dateExigibilite, params.dateRequete, params.natureCreance];
    if (textes.some((value) => typeof value !== "string" || !value.trim())
      || !Number.isFinite(params.creancePrincipale) || params.creancePrincipale <= 0
      || !Number.isFinite(params.tauxInteretLegalAnnuel) || params.tauxInteretLegalAnnuel < 0 || params.tauxInteretLegalAnnuel > 100
      || !Number.isFinite(params.fraisPoursuiteEstimes) || params.fraisPoursuiteEstimes < 0
      || !Array.isArray(params.piecesJustificatives) || params.piecesJustificatives.length === 0
      || params.piecesJustificatives.some((piece) => !piece.description.trim() || !piece.referencePiece.trim() || !piece.datePiece)) {
      return NextResponse.json({ ok: false, error: "Renseignez des informations complètes et des pièces justificatives réelles." }, { status: 400 });
    }
    const resultat = genererRequeteInjonctionPayer(params);

    await AuditService.log(session.id, "GENERER_REQUETE_INJONCTION_PAYER", "recouvrement", {
      creancier: params.creancier.denominationOuNom,
      debiteur: params.debiteur.denominationOuNom,
      montant: params.creancePrincipale,
    });

    return NextResponse.json({ ok: true, resultat });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Erreur de traitement" },
      { status: 400 }
    );
  }
}
