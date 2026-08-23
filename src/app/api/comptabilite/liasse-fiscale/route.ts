import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/api-auth";
import { balanceDepuisJournal } from "@/lib/ohada/balance-from-journal";
import { genererEtatsFinanciers } from "@/lib/ohada/syscohada-engine";

// État d'avancement de la liasse fiscale (DSF SYSCOHADA).
//
// La page affichait des taux d'avancement figés (« 85 % », « 40 % ») sans
// rapport avec les écritures, et annonçait des tableaux qui n'existent pas.
// L'état est désormais déduit du moteur : un tableau est servi s'il comporte
// des montants, en anomalie si un contrôle échoue, et les tableaux non
// implémentés sont annoncés comme tels plutôt que présentés en cours.

const SELECTION = {
    debitCompte: true,
    debitIntitule: true,
    creditCompte: true,
    creditIntitule: true,
    montant: true,
} as const;

type EtatTableau = "COMPLET" | "ANOMALIE" | "VIDE" | "NON_IMPLEMENTE";

export async function GET(request: Request) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    try {
        const { searchParams } = new URL(request.url);
        const clientId = searchParams.get("clientId");
        const periode = searchParams.get("periode");

        const ecritures = await prisma.tpeJournal.findMany({
            where: {
                status: "EXPORTED",
                source: { not: "WHATSAPP_TEST" },
                ...(clientId ? { clientId } : {}),
                ...(periode ? { periode } : {}),
            },
            select: SELECTION,
        });

        const balance = balanceDepuisJournal(ecritures);
        const etats = genererEtatsFinanciers(balance);

        const servi = (lignes: { netN: number }[]) => lignes.some((l) => l.netN !== 0);
        const equilibre = etats.controleEquilibre.equilibre;

        const etatBilan = (lignes: { netN: number }[]): EtatTableau => {
            if (!servi(lignes)) return "VIDE";
            return equilibre ? "COMPLET" : "ANOMALIE";
        };

        const tableaux: {
            id: string;
            titre: string;
            code: string;
            etat: EtatTableau;
            detail: string;
            lignesServies: number;
        }[] = [
            {
                id: "bilan-actif",
                titre: "Bilan — Actif",
                code: "Tableau 1",
                etat: etatBilan(etats.actif),
                detail: equilibre
                    ? "Actif et passif équilibrés."
                    : `Écart actif/passif de ${etats.controleEquilibre.ecart.toLocaleString("fr-FR")} FCFA.`,
                lignesServies: etats.actif.filter((l) => l.netN !== 0).length,
            },
            {
                id: "bilan-passif",
                titre: "Bilan — Passif",
                code: "Tableau 2",
                etat: etatBilan(etats.passif),
                detail: equilibre
                    ? "Actif et passif équilibrés."
                    : `Écart actif/passif de ${etats.controleEquilibre.ecart.toLocaleString("fr-FR")} FCFA.`,
                lignesServies: etats.passif.filter((l) => l.netN !== 0).length,
            },
            {
                id: "compte-resultat",
                titre: "Compte de résultat",
                code: "Tableau 3",
                etat: servi(etats.resultat) ? "COMPLET" : "VIDE",
                detail: servi(etats.resultat)
                    ? `Résultat net : ${etats.resultatNet.toLocaleString("fr-FR")} FCFA.`
                    : "Aucune écriture de classe 6 ou 7 sur la période.",
                lignesServies: etats.resultat.filter((l) => l.netN !== 0).length,
            },
            {
                id: "tft",
                titre: "Tableau des flux de trésorerie",
                code: "Tableau 4",
                etat: "NON_IMPLEMENTE",
                detail:
                    "Le tableau de flux n'est pas encore produit par le moteur. Il doit être établi manuellement avant dépôt.",
                lignesServies: 0,
            },
            {
                id: "notes-annexes",
                titre: "Notes annexes (1 à 36)",
                code: "Annexes",
                etat: "NON_IMPLEMENTE",
                detail:
                    "Les notes annexes ne sont pas générées. Elles restent à rédiger pour que la liasse soit complète.",
                lignesServies: 0,
            },
        ];

        const deposable =
            tableaux
                .filter((t) => t.etat !== "NON_IMPLEMENTE")
                .every((t) => t.etat === "COMPLET") &&
            etats.anomalies.length === 0;

        return NextResponse.json({
            tableaux,
            deposable,
            anomalies: etats.anomalies,
            controles: {
                balance: etats.controleBalance,
                equilibre: etats.controleEquilibre,
                comptesNonAffectes: etats.comptesNonAffectes,
            },
            source: {
                ecritures: ecritures.length,
                comptes: balance.length,
                periode,
                clientId,
            },
            // Sans écriture, tous les tableaux sont vides parce que la base
            // l'est — pas parce que la liasse est prête.
            aucuneDonnee: ecritures.length === 0,
        });
    } catch (error) {
        console.error("Erreur API liasse fiscale:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
