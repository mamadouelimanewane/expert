import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/api-auth";
import { echeancePour, OBLIGATIONS_FISCALES, type ObligationFiscale } from "@/lib/ohada/obligations-fiscales";
import { calculerStatutSuiviObligation } from "@/lib/compliance-obligation-tracker";
import { clientConcerneObligation } from "@/lib/obligation-eligibility";
import { regleActiveDansLeMois, regleEnVigueurDansLeMois } from "@/lib/regulatory-rule-policy";

type ProfilClient = {
  id: string;
  companyName: string | null;
  firstName: string | null;
  lastName: string | null;
  country: string;
  type: string;
  fiscalRegime: string;
  sector: string | null;
  subjectToTva: boolean;
  taxProfile: unknown;
};

type DeclarationSuivie = {
  id: string;
  type: string;
  status: string;
  amount: number | null;
  clientId: string;
  dueDate: Date;
  obligationCode: string | null;
  reference: string | null;
  client: { companyName: string | null; firstName: string | null; lastName: string | null };
};

const nomClient = (client: Pick<ProfilClient, "companyName" | "firstName" | "lastName">) =>
  client.companyName || [client.firstName, client.lastName].filter(Boolean).join(" ") || "Client";

function declarationCorrespond(obligation: ObligationFiscale, declaration: DeclarationSuivie, catalogue: ObligationFiscale[]) {
  if (declaration.obligationCode) return declaration.obligationCode === obligation.id;
  // Les déclarations historiques sans code sont rattachées seulement si leur
  // type ne peut correspondre qu'à une seule obligation du catalogue pays.
  const correspondances = catalogue.filter((item) => item.typesDeclaration.includes(declaration.type as never));
  return correspondances.length === 1 && correspondances[0].id === obligation.id && obligation.typesDeclaration.includes(declaration.type as never);
}

export async function GET(req: NextRequest) {
  const { denied } = await requireStaff();
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const pays = (searchParams.get("pays") || "SN").trim().toUpperCase();
  const annee = Number(searchParams.get("annee") || new Date().getUTCFullYear());
  const mois = Number(searchParams.get("mois") || new Date().getUTCMonth() + 1);
  if (!/^[A-Z]{2}$/.test(pays)) return NextResponse.json({ error: "Code pays invalide." }, { status: 400 });
  if (!Number.isInteger(annee) || annee < 2000 || annee > 2100) return NextResponse.json({ error: "Année invalide." }, { status: 400 });
  if (!Number.isInteger(mois) || mois < 1 || mois > 12) return NextResponse.json({ error: "Mois invalide (1 à 12)." }, { status: 400 });

  try {
    const debut = new Date(Date.UTC(annee, mois - 1, 1));
    const fin = new Date(Date.UTC(annee, mois, 1));
    const [clientsBruts, declarationsBrutes, reglesBrutes] = await Promise.all([
      prisma.client.findMany({
        where: { isActive: true, country: pays },
        select: { id: true, companyName: true, firstName: true, lastName: true, country: true, type: true, fiscalRegime: true, sector: true, subjectToTva: true, taxProfile: true },
      }),
      prisma.taxDeclaration.findMany({
        where: { dueDate: { gte: debut, lt: fin }, client: { country: pays } },
        select: {
          id: true, type: true, status: true, amount: true, clientId: true, dueDate: true,
          obligationCode: true, reference: true,
          client: { select: { companyName: true, firstName: true, lastName: true } },
        },
        orderBy: { dueDate: "asc" },
      }),
      prisma.regulatoryObligationRule.findMany({
        where: { country: pays, status: { in: ["VERIFIED", "RETIRED"] } },
        orderBy: [{ obligationCode: "asc" }, { version: "desc" }],
        select: {
          id: true, country: true, obligationCode: true, version: true, title: true, description: true,
          category: true, declarationType: true, periodicity: true, dueDay: true, dueMonth: true,
          sourceTitle: true, sourceUrl: true, sourceArticle: true, applicabilityNotes: true,
          clientTypes: true, fiscalRegimes: true, sectors: true, requiredTaxProfileFlags: true,
          status: true, effectiveFrom: true, effectiveUntil: true, retiredAt: true,
        },
      }),
    ]);
    const clients = clientsBruts as ProfilClient[];
    const declarations = declarationsBrutes as DeclarationSuivie[];
    const rulesReglees = reglesBrutes.filter((rule) => rule.status === "VERIFIED" || rule.status === "RETIRED");
    const codesReglesEnVigueur = new Set(rulesReglees
      .filter((rule) => regleEnVigueurDansLeMois(rule, annee, mois))
      .map((rule) => rule.obligationCode));
    const reglesApplicables = rulesReglees.filter((rule) => regleActiveDansLeMois(rule, annee, mois));
    const cataloguePersonnalise: ObligationFiscale[] = reglesApplicables.map((rule) => ({
      id: rule.obligationCode,
      titre: rule.title,
      description: rule.description,
      categorie: rule.category as ObligationFiscale["categorie"],
      pays: [rule.country],
      jourEcheance: rule.dueDay,
      periodicite: rule.periodicity as ObligationFiscale["periodicite"],
      typesDeclaration: [rule.declarationType],
      reference: `${rule.sourceTitle}${rule.sourceArticle ? ` · ${rule.sourceArticle}` : ""}`,
    }));
    const catalogue: ObligationFiscale[] = [
      ...OBLIGATIONS_FISCALES.filter((item) => item.pays.includes(pays) && !codesReglesEnVigueur.has(item.id)),
      ...cataloguePersonnalise,
    ];
    const regleParCode = new Map(reglesApplicables.map((rule) => [rule.obligationCode, rule]));

    const echeances = catalogue.map((obligation) => {
      const customRule = regleParCode.get(obligation.id);
      const eligibles = clients.filter((client) => clientConcerneObligation(obligation, client, customRule));
      const idsEligibles = new Set(eligibles.map((client) => client.id));
      const liees = declarations.filter((declaration) =>
        idsEligibles.has(declaration.clientId) && declarationCorrespond(obligation, declaration, catalogue),
      );
      const dateCatalogue = echeancePour(obligation, annee, mois - 1);
      const deposees = liees.filter((item) => item.status === "SUBMITTED" || item.status === "VALIDATED").length;
      const rejetees = liees.filter((item) => item.status === "REJECTED").length;
      const enCours = liees.filter((item) => item.status === "DRAFT" || item.status === "PENDING").length;
      const nonSaisiesDansOutil = Math.max(0, eligibles.length - liees.length);

      return {
        obligationId: obligation.id,
        titre: obligation.titre,
        categorie: obligation.categorie,
        pays,
        dateEcheance: dateCatalogue.toISOString(),
        statut: calculerStatutSuiviObligation(liees.map((item) => item.status), eligibles.length),
        reference: obligation.reference,
        source: regleParCode.has(obligation.id)
          ? `Version ${regleParCode.get(obligation.id)!.version} validée par un réviseur du cabinet · ${regleParCode.get(obligation.id)!.applicabilityNotes}`
          : "Catalogue indicatif ; échéance à confirmer dans le texte officiel applicable.",
        sourceUrl: regleParCode.get(obligation.id)?.sourceUrl ?? null,
        ruleVersion: regleParCode.get(obligation.id)?.version ?? null,
        nbDossiersEligibles: eligibles.length,
        nbDeclarationsSaisies: liees.length,
        nbDeclarationsDeposees: deposees,
        nbDeclarationsEnCours: enCours,
        nbDeclarationsRejetees: rejetees,
        nbNonSaisiesDansOutil: nonSaisiesDansOutil,
        montantRenseigne: liees.reduce((sum, item) => sum + (item.amount ?? 0), 0),
        declarations: liees.map((item) => ({
          id: item.id,
          clientId: item.clientId,
          client: nomClient(item.client),
          statut: item.status,
          montant: item.amount,
          echeance: item.dueDate.toISOString(),
          referenceDepot: item.reference,
        })),
      };
    });

    const totalEligibles = new Set(echeances.flatMap((item) => item.declarations.map((d) => d.clientId))).size;
    const declarationsSaisies = echeances.reduce((sum, item) => sum + item.nbDeclarationsSaisies, 0);
    const declarationsEnCours = echeances.reduce((sum, item) => sum + item.nbDeclarationsEnCours, 0);
    const declarationsRejetees = echeances.reduce((sum, item) => sum + item.nbDeclarationsRejetees, 0);
    const nonSaisiesDansOutil = echeances.reduce((sum, item) => sum + item.nbNonSaisiesDansOutil, 0);

    return NextResponse.json({
      pays, annee, mois, echeances,
      statutReglementaire: "INDICATIF_A_VERIFIER",
      avertissement: "Les lignes sans déclaration indiquent seulement qu’aucun dossier n’est saisi ici. Elles ne prouvent pas un défaut de dépôt. Les règles, l’assujettissement et les échéances doivent être confirmés dans le texte officiel applicable au client.",
      synthese: {
        clientsAvecDeclaration: totalEligibles,
        declarationsSaisies,
        declarationsEnCours,
        declarationsRejetees,
        nonSaisiesDansOutil,
        montantRenseigne: echeances.reduce((sum, item) => sum + item.montantRenseigne, 0),
      },
      aucuneDonnee: declarationsSaisies === 0,
    });
  } catch (error) {
    console.error("Erreur tableau conformité:", error);
    return NextResponse.json({ error: "Impossible de charger le suivi réel des obligations." }, { status: 500 });
  }
}
