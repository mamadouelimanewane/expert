import { NextRequest, NextResponse } from "next/server";
import { requireStaff, requireWriteAccess } from "@/lib/api-auth";
import {
  selectionnerEchantillonCircularisation,
  genererLettreCircularisation,
  rapprocherReponseTiers,
  TiersACirculariser,
  ReponseTiersConfirmation,
} from "@/lib/ohada/audit-circularisation";
import { AuditService } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const { session, denied } = await requireStaff();
  if (denied) return denied;

  const demoTiers: TiersACirculariser[] = [
    { id: "1", categorie: "FOURNISSEUR", numeroCompte: "401100", denominationOuNom: "TOTAL ENERGIES MARKETING SENEGAL", adresse: "Route des hydrocarbures, Dakar", soldeComptableLivre: 28_500_000, devise: "XOF" },
    { id: "2", categorie: "FOURNISSEUR", numeroCompte: "401200", denominationOuNom: "SONATEL ENTREPRISES", adresse: "Boulevard de la République, Dakar", soldeComptableLivre: 4_200_000, devise: "XOF" },
    { id: "3", categorie: "CLIENT", numeroCompte: "411100", denominationOuNom: "DISTRIBUTEUR SAHEL SARL", adresse: "Avenue Malick Sy, Dakar", soldeComptableLivre: 16_800_000, devise: "XOF" },
    { id: "4", categorie: "BANQUE", numeroCompte: "521100", denominationOuNom: "CBAO GROUPE ATTIJARIWAFA BANK", adresse: "Place de l'Indépendance, Dakar", soldeComptableLivre: 85_400_000, devise: "XOF" },
  ];

  const seuil = 5_000_000;
  const echantillon = selectionnerEchantillonCircularisation(demoTiers, seuil);

  const societeAuditee = { denomination: "INDUSTRIES DU SAHEL SA", ville: "Dakar" };
  const cabinetAudit = { denomination: "Cabinet 360 Audit & Advisory", adresse: "Plateau Dakar", email: "audit@cabinet360.sn" };

  const lettres = echantillon.map((t) => ({
    tiers: t,
    lettre: genererLettreCircularisation(societeAuditee, t, cabinetAudit, "31/12/2025"),
  }));

  return NextResponse.json({ ok: true, tiers: demoTiers, echantillon, lettres });
}

export async function POST(req: NextRequest) {
  const { session, denied } = await requireWriteAccess();
  if (denied) return denied;

  try {
    const body = (await req.json()) as {
      tiers: TiersACirculariser;
      reponse: ReponseTiersConfirmation;
    };

    const rapprochement = rapprocherReponseTiers(body.tiers, body.reponse);

    await AuditService.log(session.id, "AUDIT_CIRCULARISATION_RAPPROCHEMENT", "audit", {
      tiersId: body.tiers.id,
      statut: rapprochement.statutAudit,
      ecartBrut: rapprochement.ecartBrut,
    });

    return NextResponse.json({ ok: true, rapprochement });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Erreur de traitement" },
      { status: 400 }
    );
  }
}
