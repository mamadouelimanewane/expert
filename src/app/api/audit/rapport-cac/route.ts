import { NextRequest, NextResponse } from "next/server";
import { requireStaff, requireWriteAccess } from "@/lib/api-auth";
import {
  genererRapportsCAC,
  DonneesRapportCAC,
} from "@/lib/ohada/audit-rapport-cac";
import { AuditService } from "@/lib/audit";

export async function GET() {
  const { denied } = await requireStaff();
  if (denied) return denied;
  return NextResponse.json({ ok: false, error: "Aucun dossier CAC n'est relié à des états financiers et pièces validés. Transmettez les données documentées au générateur." }, { status: 409 });
}

export async function POST(req: NextRequest) {
  const { session, denied } = await requireWriteAccess();
  if (denied) return denied;

  try {
    const donnees = (await req.json()) as DonneesRapportCAC;
    const textesRequis = [donnees.societe?.denomination, donnees.societe?.formeJuridique, donnees.societe?.rccm, donnees.societe?.siegeSocial, donnees.exerciceClos, donnees.cabinet?.denomination, donnees.cabinet?.ville, donnees.cabinet?.associeSignataire, donnees.cabinet?.ordreNational, donnees.dateRapport];
    const montants = [donnees.societe?.capitalSocial, donnees.chiffreAffaires, donnees.resultatNet, donnees.totalBilan];
    if (textesRequis.some((value) => typeof value !== "string" || !value.trim())
      || montants.some((value) => typeof value !== "number" || !Number.isFinite(value) || value < 0)
      || !["CERTIFICATION_SANS_RESERVE", "CERTIFICATION_AVEC_RESERVES", "REFUS_DE_CERTIFIER", "IMPOSSIBILITE_DE_CONCLURE"].includes(donnees.opinion)
      || !Array.isArray(donnees.reserves) || !Array.isArray(donnees.pointsClesAudit) || !Array.isArray(donnees.conventionsReglementeesMentionnees)) {
      return NextResponse.json({ ok: false, error: "Les informations de l'entité, de la mission, des états financiers et l'opinion sont obligatoires et doivent être valides." }, { status: 400 });
    }
    if (donnees.conventionsReglementeesMentionnees.some((item) => !item.beneficiaire.trim() || !item.natureConvention.trim() || !Number.isFinite(item.montantExercice) || item.montantExercice < 0)
      || donnees.reserves.some((item) => !item.titre.trim() || !item.motif.trim())
      || donnees.pointsClesAudit.some((item) => !item.titre.trim() || !item.risqueIdentifie.trim() || !item.reponseAuditApportee.trim())) {
      return NextResponse.json({ ok: false, error: "Complétez les fondements d'opinion, points clés et conventions saisis." }, { status: 400 });
    }
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
