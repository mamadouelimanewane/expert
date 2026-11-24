import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-auth";
import type { PaysFiscal } from "@/lib/tax-simulator";
import {
    genererPVAGOA,
    genererStatutsSARL,
    genererBailCommercial,
    genererContratTravailCDI,
    type TypeActeOHADA,
    type ParametresPVAGOA,
    type ParametresStatutsSARL,
    type ParametresBailCommercial,
    type ParametresContratTravail,
} from "@/lib/ohada/legal-document-generator";

const PAYS_VALIDES = new Set(["sn", "ci", "cm", "bj"]);
const dateISOValide = (value: unknown) => {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
};
const CHAMPS_TEXTE: Record<TypeActeOHADA, string[]> = {
    PV_AGOA: ["denomination", "formeSociale", "siegeSocial", "rccm", "dateAssemblee", "heureAssemblee", "dateCloture", "lieuAssemblee", "nomGerantOuPresident"],
    STATUTS_SARL: ["denomination", "siegeSocial", "objetSocial", "gerantNom", "gerantNationalite"],
    BAIL_COMMERCIAL: ["bailleurNom", "bailleurAdresse", "preneurDenomination", "preneurRCCM", "designationLocaux", "activiteAutorisee", "datePriseEffet"],
    CONTRAT_TRAVAIL_CDI: ["employeurDenomination", "employeurSiege", "salarieNomPrenom", "salarieNationalite", "posteIntitule", "categorieProfessionnelle", "dateEmbauche", "conventionCollective"],
};
const CHAMPS_NUMERIQUES: Record<TypeActeOHADA, string[]> = {
    PV_AGOA: ["capitalSocial", "exerciceClos", "resultatNet", "affectationReserveLegale", "dividendesDistribues", "presentsOuRepresentesPourcentage"],
    STATUTS_SARL: ["capitalSocial", "dureeAnnees", "valeurNominalePart"],
    BAIL_COMMERCIAL: ["loyerMensuelHT", "depotGarantieMois", "dureeBailAnnees"],
    CONTRAT_TRAVAIL_CDI: ["salaireBaseMensuel", "primesMensuelles", "periodeEssaiMois"],
};

export async function POST(req: NextRequest) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    try {
        const body: unknown = await req.json();
        if (!body || typeof body !== "object" || Array.isArray(body)) {
            return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
        }
        const { type, params, pays } = body as { type?: unknown; params?: unknown; pays?: unknown };
        if (typeof type !== "string" || !(type in CHAMPS_TEXTE)) {
            return NextResponse.json({ error: "Type d’acte non pris en charge." }, { status: 400 });
        }
        if (typeof pays !== "string" || !PAYS_VALIDES.has(pays)) {
            return NextResponse.json({ error: "Sélectionnez un pays pris en charge." }, { status: 400 });
        }
        if (!params || typeof params !== "object" || Array.isArray(params)) {
            return NextResponse.json({ error: "Les paramètres de l’acte sont requis." }, { status: 400 });
        }
        const input = params as Record<string, unknown>;
        const typeActe = type as TypeActeOHADA;
        if (CHAMPS_TEXTE[typeActe].some((key) => typeof input[key] !== "string" || !(input[key] as string).trim())) {
            return NextResponse.json({ error: "Un ou plusieurs champs textuels obligatoires sont manquants." }, { status: 400 });
        }
        if (CHAMPS_NUMERIQUES[typeActe].some((key) => typeof input[key] !== "number" || !Number.isFinite(input[key]))) {
            return NextResponse.json({ error: "Un ou plusieurs champs numériques obligatoires sont invalides." }, { status: 400 });
        }
        const dateFields = typeActe === "PV_AGOA" ? ["dateAssemblee", "dateCloture"] : typeActe === "BAIL_COMMERCIAL" ? ["datePriseEffet"] : typeActe === "CONTRAT_TRAVAIL_CDI" ? ["dateEmbauche"] : [];
        if (dateFields.some((key) => !dateISOValide(input[key]))) {
            return NextResponse.json({ error: "Une date est absente ou invalide." }, { status: 400 });
        }
        if (typeActe === "PV_AGOA" && (Number(String(input.dateCloture).slice(0, 4)) !== Number(input.exerciceClos) || String(input.heureAssemblee).length > 5 || !/^\d{2}:\d{2}$/.test(String(input.heureAssemblee)))) {
            return NextResponse.json({ error: "La date de clôture doit correspondre à l’exercice et l’heure doit être au format HH:mm." }, { status: 400 });
        }
        if (typeActe === "PV_AGOA" && (input.formeSociale !== "SARL" && input.formeSociale !== "SAS" && input.formeSociale !== "SA" || Number(input.capitalSocial) <= 0 || Number(input.presentsOuRepresentesPourcentage) <= 0 || Number(input.presentsOuRepresentesPourcentage) > 100 || !["unanimite", "majorite", "rejetee"].includes(String(input.voteApprobation)) || !["unanimite", "majorite", "rejetee"].includes(String(input.voteAffectation)) || !["unanimite", "majorite", "rejetee"].includes(String(input.voteFormalites)))) {
            return NextResponse.json({ error: "Les paramètres de vote ou d’assemblée sont invalides." }, { status: 400 });
        }
        if (typeActe === "STATUTS_SARL" && (!Array.isArray(input.associes) || input.associes.length === 0 || input.associes.some((a) => !a || typeof a !== "object" || typeof a.nom !== "string" || !a.nom.trim() || typeof a.parts !== "number" || !Number.isFinite(a.parts) || a.parts <= 0 || typeof a.apportMontant !== "number" || !Number.isFinite(a.apportMontant) || a.apportMontant < 0))) {
            return NextResponse.json({ error: "La liste des associés et les montants d’apport doivent être valides." }, { status: 400 });
        }
        if (typeActe === "STATUTS_SARL") {
            const associes = input.associes as Array<{ parts: number; apportMontant: number }>;
            if (associes.reduce((sum, a) => sum + a.apportMontant, 0) !== Number(input.capitalSocial) || associes.reduce((sum, a) => sum + a.parts, 0) * Number(input.valeurNominalePart) !== Number(input.capitalSocial)) {
                return NextResponse.json({ error: "Le total des apports et des parts doit correspondre au capital social." }, { status: 400 });
            }
        }
        if (typeActe === "PV_AGOA" && (Number(input.resultatNet) >= 0 && Number(input.affectationReserveLegale) + Number(input.dividendesDistribues) > Number(input.resultatNet) || Number(input.resultatNet) < 0 && (Number(input.affectationReserveLegale) !== 0 || Number(input.dividendesDistribues) !== 0))) {
            return NextResponse.json({ error: "La répartition proposée ne peut dépasser le résultat distribuable." }, { status: 400 });
        }
        if (CHAMPS_NUMERIQUES[typeActe].some((key) => typeActe === "PV_AGOA" && key === "resultatNet" ? false : Number(input[key]) < 0) || (typeActe !== "PV_AGOA" && ["capitalSocial", "dureeAnnees", "valeurNominalePart", "loyerMensuelHT", "dureeBailAnnees", "salaireBaseMensuel"].some((key) => key in input && Number(input[key]) === 0))) {
            return NextResponse.json({ error: "Les valeurs numériques doivent respecter les limites attendues." }, { status: 400 });
        }

        let acte = null;
        switch (typeActe) {
            case "PV_AGOA":
                acte = genererPVAGOA(input as unknown as ParametresPVAGOA, pays as PaysFiscal);
                break;
            case "STATUTS_SARL":
                acte = genererStatutsSARL({ ...input, pays: pays as PaysFiscal } as unknown as ParametresStatutsSARL);
                break;
            case "BAIL_COMMERCIAL":
                acte = genererBailCommercial({ ...input, pays: pays as PaysFiscal } as unknown as ParametresBailCommercial);
                break;
            case "CONTRAT_TRAVAIL_CDI":
                acte = genererContratTravailCDI({ ...input, pays: pays as PaysFiscal } as unknown as ParametresContratTravail);
                break;
            default:
                return NextResponse.json(
                    { error: `Type d'acte non supporté: ${type}` },
                    { status: 400 }
                );
        }

        return NextResponse.json({ acte });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Erreur interne" },
            { status: 500 }
        );
    }
}
