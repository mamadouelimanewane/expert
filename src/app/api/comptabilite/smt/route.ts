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
    const categorie = (searchParams.get("categorie") || "COMMERCE_NEGOCE") as CategorieActiviteSMT;

    if (!clientId || !isObjectId(clientId)) {
        return NextResponse.json({ error: "clientId invalide." }, { status: 400 });
    }

    // Récupérer les journaux TPE réels du client si existants
    const tpeJournals = await prisma.tpeJournal.findMany({
        where: { clientId },
        orderBy: { date: "asc" },
        take: 500,
    });

    let flux: FluxTresorerieSMT[] = [];

    if (tpeJournals.length > 0) {
        flux = tpeJournals.map((j) => {
            const montant = j.montant;
            const sens = j.sens;
            let cat: FluxTresorerieSMT["categorie"] = "AUTRES_DEPENSES";

            if (sens === "RECETTE") {
                cat = "RECETTE_VENTES";
            } else {
                const libLower = (j.libelle || "").toLowerCase();
                if (libLower.includes("achat") || libLower.includes("marchandise")) cat = "ACHAT_MARCHANDISES";
                else if (libLower.includes("loyer")) cat = "CHARGES_LOYER";
                else if (libLower.includes("salaire") || libLower.includes("paie")) cat = "CHARGES_SALAIRES";
                else if (libLower.includes("impot") || libLower.includes("taxe")) cat = "CHARGES_IMPOTS_TAXES";
            }

            return {
                id: j.id,
                date: j.date.toISOString().slice(0, 10),
                libelle: j.libelle,
                categorie: cat,
                montant,
                modeReglement: (j.compteTresorerie?.includes("571") ? "ESPECES" : "BANQUE") as any,
            };
        });
    } else {
        // Flux types d'une TPE ou PME de négoce sous le régime SMT
        flux = [
            { id: "s1", date: `${exercice}-01-15`, libelle: "Recettes magasin janvier", categorie: "RECETTE_VENTES", montant: 3_800_000, modeReglement: "ESPECES" },
            { id: "s2", date: `${exercice}-01-20`, libelle: "Achats grossiste", categorie: "ACHAT_MARCHANDISES", montant: 2_400_000, modeReglement: "BANQUE" },
            { id: "s3", date: `${exercice}-02-15`, libelle: "Recettes magasin février", categorie: "RECETTE_VENTES", montant: 4_200_000, modeReglement: "ESPECES" },
            { id: "s4", date: `${exercice}-02-28`, libelle: "Loyer commercial 2 mois", categorie: "CHARGES_LOYER", montant: 600_000, modeReglement: "MOBILE_MONEY" },
            { id: "s5", date: `${exercice}-03-10`, libelle: "Salaires aides-vendeurs", categorie: "CHARGES_SALAIRES", montant: 950_000, modeReglement: "ESPECES" },
            { id: "s6", date: `${exercice}-03-30`, libelle: "Acompte impôt synthétique", categorie: "CHARGES_IMPOTS_TAXES", montant: 250_000, modeReglement: "BANQUE" },
            { id: "s7", date: `${exercice}-04-05`, libelle: "Achat présentoir et balance", categorie: "INVESTISSEMENT", montant: 850_000, modeReglement: "ESPECES" },
            { id: "s8", date: `${exercice}-04-15`, libelle: "Recettes magasin mars/avril", categorie: "RECETTE_VENTES", montant: 5_100_000, modeReglement: "MOBILE_MONEY" },
        ];
    }

    const etatsSMT = genererEtatsSMT({
        exercice,
        categorie,
        flux,
        inventaire: {
            stocksFinaux: 1_800_000,
            creancesClientsFin: 450_000,
            dettesFournisseursFin: 720_000,
            dettesFiscalesSocialesFin: 150_000,
            tresorerieInitiale: 1_200_000,
        },
    });

    return NextResponse.json(etatsSMT);
}
