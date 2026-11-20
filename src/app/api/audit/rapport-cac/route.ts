import { NextRequest, NextResponse } from "next/server";
import { requireStaff, requireWriteAccess } from "@/lib/api-auth";
import {
  genererRapportsCAC,
  DonneesRapportCAC,
} from "@/lib/ohada/audit-rapport-cac";
import { AuditService } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const { session, denied } = await requireStaff();
  if (denied) return denied;

  const demoData: DonneesRapportCAC = {
    societe: {
      denomination: "AGRO-INDUSTRIES SAHEL SA",
      formeJuridique: "Société Anonyme",
      rccm: "SN-DKR-2015-B-1122",
      siegeSocial: "Zone Industrielle de Dakar",
      capitalSocial: 500_000_000,
    },
    exerciceClos: "31 décembre 2025",
    chiffreAffaires: 4_500_000_000,
    resultatNet: 280_000_000,
    totalBilan: 3_200_000_000,
    opinion: "CERTIFICATION_SANS_RESERVE",
    reserves: [],
    pointsClesAudit: [
      {
        titre: "Évaluation et dépréciation des stocks",
        risqueIdentifie: "Risque de dépréciation sur stocks à rotation lente",
        reponseAuditApportee: "Test des coûts unitaires et revue de l'inventaire physique contradictoire",
      },
    ],
    conventionsReglementeesMentionnees: [
      {
        beneficiaire: "Société Holding Africaine",
        natureConvention: "Contrat d'assistance technique et prestations informatiques",
        montantExercice: 45_000_000,
        autorisationPrealableConseil: true,
      },
    ],
    cabinet: {
      denomination: "Cabinet 360 Audit & Advisory",
      ville: "Dakar",
      associeSignataire: "Mamadou Sow, Expert-Comptable Associé",
      ordreNational: "ONECCA Sénégal",
    },
    dateRapport: new Date().toISOString().split("T")[0],
  };

  const resultat = genererRapportsCAC(demoData);
  return NextResponse.json({ ok: true, params: demoData, resultat });
}

export async function POST(req: NextRequest) {
  const { session, denied } = await requireWriteAccess();
  if (denied) return denied;

  try {
    const donnees = (await req.json()) as DonneesRapportCAC;
    const resultat = genererRapportsCAC(donnees);

    await AuditService.log(session.id, "GENERER_RAPPORT_CAC", "audit", {
      societe: donnees.societe.denomination,
      opinion: donnees.opinion,
    });

    return NextResponse.json({ ok: true, resultat });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Erreur de génération" },
      { status: 400 }
    );
  }
}
