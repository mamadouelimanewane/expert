import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/api-auth";
import { isObjectId } from "@/lib/tenant-security";
import {
    genererEtatsSMT,
    type CategorieActiviteSMT,
    type FluxTresorerieSMT,
} from "@/lib/ohada/smt-engine";

/**
 * API Système Minimal de Trésorerie (SMT SYSCOHADA)
 * GET /api/comptabilite/smt?clientId=&exercice=&categorie=
 */
export async function GET(request: NextRequest) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const exercice = parseInt(searchParams.get("exercice") || String(new Date().getFullYear()), 10);
    const categorieBrute = searchParams.get("categorie") || "COMMERCE_NEGOCE";
    const categoriesValides: CategorieActiviteSMT[] = ["COMMERCE_NEGOCE", "ARTISANAT", "SERVICES"];

    if (!clientId || !isObjectId(clientId)) {
        return NextResponse.json({ error: "clientId invalide." }, { status: 400 });
    }
    if (!Number.isInteger(exercice) || exercice < 2000 || exercice > 2100) {
        return NextResponse.json({ error: "exercice invalide." }, { status: 400 });
    }
    if (!categoriesValides.includes(categorieBrute as CategorieActiviteSMT)) {
        return NextResponse.json({ error: "categorie SMT invalide." }, { status: 400 });
    }
    const categorie = categorieBrute as CategorieActiviteSMT;

    // Récupérer les journaux TPE réels du client si existants
    const tpeJournals = await prisma.tpeJournal.findMany({
        where: { clientId, status: { in: ["APPROVED", "EXPORTED"] } },
        orderBy: { date: "asc" },
        take: 500,
    });

    const flux: FluxTresorerieSMT[] = tpeJournals.flatMap((j) => {
        const date = new Date(j.date);
        if (Number.isNaN(date.getTime()) || date.getUTCFullYear() !== exercice) return [];
        const estRecette = j.entree > 0;
        const libelle = j.libelle.toLowerCase();
        let categorie: FluxTresorerieSMT["categorie"] = estRecette ? "RECETTE_VENTES" : "AUTRES_DEPENSES";
        if (!estRecette) {
            if (j.debitCompte.startsWith("60") || libelle.includes("achat") || libelle.includes("marchandise")) categorie = "ACHAT_MARCHANDISES";
            else if (libelle.includes("loyer")) categorie = "CHARGES_LOYER";
            else if (j.debitCompte.startsWith("64") || libelle.includes("salaire") || libelle.includes("paie")) categorie = "CHARGES_SALAIRES";
            else if (j.debitCompte.startsWith("63") || libelle.includes("impot") || libelle.includes("taxe")) categorie = "CHARGES_IMPOTS_TAXES";
            else if (j.debitCompte.startsWith("2")) categorie = "INVESTISSEMENT";
        }
        const modeReglement: FluxTresorerieSMT["modeReglement"] = j.source === "MOBILE_MONEY"
            ? "MOBILE_MONEY"
            : j.debitCompte.startsWith("57") || j.creditCompte.startsWith("57") ? "ESPECES" : "BANQUE";
        return [{
            id: j.id,
            date: date.toISOString().slice(0, 10),
            libelle: j.libelle,
            categorie,
            montant: estRecette ? j.entree : j.sortie,
            modeReglement,
        }];
    });

    const etatsSMT = genererEtatsSMT({
        exercice,
        categorie,
        flux,
        inventaire: {
            stocksFinaux: 0,
            creancesClientsFin: 0,
            dettesFournisseursFin: 0,
            dettesFiscalesSocialesFin: 0,
            tresorerieInitiale: 0,
        },
    });

    return NextResponse.json({
        ...etatsSMT,
        sourceDonnees: "JOURNAL_TPE_APPROUVE",
        avertissements: [
            ...(flux.length === 0 ? ["Aucune écriture TPE approuvée ou exportée n’est disponible pour cet exercice."] : []),
            "Le stock final, les créances, les dettes et la trésorerie initiale ne sont pas encore alimentés par un inventaire réel ; ils sont calculés à zéro.",
        ],
    });
}
