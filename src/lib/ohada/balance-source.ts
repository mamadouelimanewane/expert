import prisma from "@/lib/prisma";
import type { CompteBalance } from "./types";
import { balanceDepuisJournal } from "./balance-from-journal";

/**
 * Source de la balance d'un dossier pour une période.
 *
 * Deux origines possibles, dans cet ordre de priorité :
 *  1. une balance générale importée (CSV/Excel) pour (client, période) —
 *     c'est le document que le cabinet reçoit le plus souvent ;
 *  2. sinon, l'agrégation des écritures du journal déversées en production.
 *
 * Les quatre routes d'états financiers (bilan, résultat, TFT, liasse) passent
 * par ici : elles décrivent la même origine dans `source`, ce qui évite qu'un
 * bilan vienne de la balance importée et le résultat du journal.
 */
export type SourceBalance =
    | { type: "BALANCE_IMPORTEE"; lignes: number; fichier: string | null; importeeLe: Date; equilibree: boolean }
    | { type: "JOURNAL"; ecritures: number };

const SELECTION = {
    debitCompte: true,
    debitIntitule: true,
    creditCompte: true,
    creditIntitule: true,
    montant: true,
} as const;

export async function obtenirBalance(
    clientId: string | null,
    periode: string | null
): Promise<{ balance: CompteBalance[]; source: SourceBalance }> {
    if (clientId && periode) {
        const importee = await prisma.balanceImportee.findUnique({
            where: { clientId_periode: { clientId, periode } },
            select: { lignes: true, nbLignes: true, fichier: true, createdAt: true, equilibree: true },
        });
        if (importee) {
            return {
                balance: importee.lignes as unknown as CompteBalance[],
                source: {
                    type: "BALANCE_IMPORTEE",
                    lignes: importee.nbLignes,
                    fichier: importee.fichier,
                    importeeLe: importee.createdAt,
                    equilibree: importee.equilibree,
                },
            };
        }
    }
    // Sans période : toutes les écritures déversées (comportement historique
    // des routes bilan / résultat / liasse).
    const ecritures = await prisma.tpeJournal.findMany({
        where: {
            status: "EXPORTED",
            source: { not: "WHATSAPP_TEST" },
            ...(periode ? { periode } : {}),
            ...(clientId ? { clientId } : {}),
        },
        select: SELECTION,
    });
    return { balance: balanceDepuisJournal(ecritures), source: { type: "JOURNAL", ecritures: ecritures.length } };
}
