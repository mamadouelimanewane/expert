import { NextRequest, NextResponse } from "next/server";
import { requireStaff, requireWriteAccess } from "@/lib/api-auth";
import {
  genererRequeteInjonctionPayer,
  calculerDelaisProceduraux,
  RequeteIPParams,
} from "@/lib/ohada/recouvrement-aupsrve";
import { AuditService } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const { session, denied } = await requireStaff();
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

  // Exemple démo
  const demoParams: RequeteIPParams = {
    juridiction: "Tribunal de Commerce Hors Classe de Dakar",
    ville: "Dakar",
    creancier: {
      denominationOuNom: "Cabinet 360 Conseils SARL",
      formeJuridique: "SARL",
      rccmOuNinea: "SN-DKR-2022-B-1234",
      adresse: "Almadies Zone 4",
      ville: "Dakar",
      pays: "Sénégal",
      representantLegal: "Monsieur le Gérant",
    },
    debiteur: {
      denominationOuNom: "Société Commerciale Ouest-Africaine SA",
      formeJuridique: "SA",
      rccmOuNinea: "SN-DKR-2020-B-5678",
      adresse: "Boulevard de la République",
      ville: "Dakar",
      pays: "Sénégal",
    },
    creancePrincipale: 12_500_000,
    tauxInteretLegalAnnuel: 5.5,
    dateExigibilite: "2026-01-15",
    dateRequete: new Date().toISOString().split("T")[0],
    fraisPoursuiteEstimes: 200_000,
    natureCreance: "Factures de révision comptable et d'audit contractuel impayées",
    miseEnDemeureDate: "2026-03-01",
    miseEnDemeureHuissier: "Maître Babacar Diop, Huissier de Justice",
    piecesJustificatives: [
      {
        numero: 1,
        description: "Contrat de mission signé",
        referencePiece: "CM-2025-04",
        datePiece: "2025-01-10",
      },
      {
        numero: 2,
        description: "Facture impayée N° 2025-F-102",
        referencePiece: "FAC-102",
        datePiece: "2025-12-15",
        montantPiece: 12_500_000,
      },
    ],
  };

  const resultat = genererRequeteInjonctionPayer(demoParams);
  return NextResponse.json({ ok: true, params: demoParams, resultat });
}

export async function POST(req: NextRequest) {
  const { session, denied } = await requireWriteAccess();
  if (denied) return denied;

  try {
    const params = (await req.json()) as RequeteIPParams;
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
