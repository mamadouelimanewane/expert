import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Comparatif N-1 non disponible : le journal TPE ne conserve pas d'historique
// annuel distinct, donc netN1 reste à 0 tant qu'aucun exercice antérieur n'est importé.

export async function GET(request: Request) {
    try {
        const entries = await prisma.tpeJournal.findMany({
            where: { status: "EXPORTED", source: { not: "WHATSAPP_TEST" } }
        });

        const actif = [
            { code: "AD", label: "Immobilisations Incorporelles", netN: 0, netN1: 0, isTotal: false },
            { code: "AE", label: "Immobilisations Corporelles", netN: 0, netN1: 0, isTotal: false },
            { code: "AF", label: "Immobilisations Financières", netN: 0, netN1: 0, isTotal: false },
            { code: "BA", label: "Stocks et en-cours", netN: 0, netN1: 0, isTotal: false },
            { code: "BB", label: "Clients et comptes rattachés", netN: 0, netN1: 0, isTotal: false },
            { code: "BG", label: "Autres créances", netN: 0, netN1: 0, isTotal: false },
            { code: "BQ", label: "Trésorerie-Actif", netN: 0, netN1: 0, isTotal: false },
        ];

        const passif = [
            { code: "CA", label: "Capital", netN: 0, netN1: 0, isTotal: false },
            { code: "CD", label: "Report à Nouveau", netN: 0, netN1: 0, isTotal: false },
            { code: "CF", label: "Résultat net de l'exercice", netN: 0, netN1: 0, isTotal: false },
            { code: "DA", label: "Emprunts et dettes fin.", netN: 0, netN1: 0, isTotal: false },
            { code: "DB", label: "Fournisseurs", netN: 0, netN1: 0, isTotal: false },
            { code: "DC", label: "Dettes fiscales et sociales", netN: 0, netN1: 0, isTotal: false },
        ];

        const find = (list: typeof actif, code: string) => list.find(a => a.code === code)!;

        entries.forEach(entry => {
            const amount = (entry.entree || 0) + (entry.sortie || 0);
            const debit = entry.debitCompte || "";
            const credit = entry.creditCompte || "";

            // Classe 2 — Immobilisations
            if (debit.startsWith('20')) find(actif, 'AD').netN += amount;
            if (debit.startsWith('21') || debit.startsWith('22') || debit.startsWith('23') || debit.startsWith('24')) find(actif, 'AE').netN += amount;
            if (debit.startsWith('26') || debit.startsWith('27')) find(actif, 'AF').netN += amount;

            // Classe 3 — Stocks
            if (debit.startsWith('3')) find(actif, 'BA').netN += amount;
            if (credit.startsWith('3')) find(actif, 'BA').netN -= amount;

            // Classe 40 — Fournisseurs (Passif)
            if (debit.startsWith('40')) find(passif, 'DB').netN -= amount; // règlement
            if (credit.startsWith('40')) find(passif, 'DB').netN += amount; // nouvelle dette

            // Classe 41 — Clients (Actif)
            if (debit.startsWith('41')) find(actif, 'BB').netN += amount; // nouvelle créance
            if (credit.startsWith('41')) find(actif, 'BB').netN -= amount; // encaissement

            // Classes 42-44 — Dettes fiscales et sociales
            if (credit.startsWith('42') || credit.startsWith('43') || credit.startsWith('44')) find(passif, 'DC').netN += amount;
            if (debit.startsWith('42') || debit.startsWith('43') || debit.startsWith('44')) find(passif, 'DC').netN -= amount;

            // Classe 16 — Emprunts
            if (credit.startsWith('16')) find(passif, 'DA').netN += amount;
            if (debit.startsWith('16')) find(passif, 'DA').netN -= amount;

            // Classe 10 — Capital
            if (credit.startsWith('10')) find(passif, 'CA').netN += amount;

            // Classe 5 — Trésorerie
            if (debit.startsWith('5')) find(actif, 'BQ').netN += amount;
            if (credit.startsWith('5')) find(actif, 'BQ').netN -= amount;
        });

        const totalImmo = actif.filter(a => ['AD', 'AE', 'AF'].includes(a.code)).reduce((sum, a) => sum + a.netN, 0);
        const totalCirculant = actif.filter(a => ['BA', 'BB', 'BG'].includes(a.code)).reduce((sum, a) => sum + a.netN, 0);
        const tresoActif = find(actif, 'BQ').netN;
        const totalActif = totalImmo + totalCirculant + tresoActif;

        const structuredActif = [
            ...actif.filter(a => ['AD', 'AE', 'AF'].includes(a.code)),
            { code: "AX", label: "TOTAL ACTIF IMMOBILISÉ", netN: totalImmo, netN1: 0, isTotal: true, level: 1 },
            ...actif.filter(a => ['BA', 'BB', 'BG'].includes(a.code)),
            { code: "BX", label: "TOTAL ACTIF CIRCULANT", netN: totalCirculant, netN1: 0, isTotal: true, level: 1 },
            find(actif, 'BQ'),
            { code: "BZ", label: "TOTAL GÉNÉRAL ACTIF", netN: totalActif, netN1: 0, isTotal: true, level: 2 },
        ];

        const totalCapitauxHorsResultat = passif.filter(p => ['CA', 'CD'].includes(p.code)).reduce((sum, p) => sum + p.netN, 0);
        const totalDettesFin = find(passif, 'DA').netN;
        const totalPassifCirculant = passif.filter(p => ['DB', 'DC'].includes(p.code)).reduce((sum, p) => sum + p.netN, 0);

        // Le résultat net est déduit par différence pour équilibrer le bilan (Actif = Passif),
        // faute d'un compte de résultat directement soldé sur la période.
        const totalPassifHorsResultat = totalCapitauxHorsResultat + totalDettesFin + totalPassifCirculant;
        const resultatNet = totalActif - totalPassifHorsResultat;
        find(passif, 'CF').netN = resultatNet;

        const structuredPassif = [
            ...passif.filter(p => ['CA', 'CD', 'CF'].includes(p.code)),
            { code: "CP", label: "TOTAL CAPITAUX PROPRES", netN: totalCapitauxHorsResultat + resultatNet, netN1: 0, isTotal: true, level: 1 },
            find(passif, 'DA'),
            { code: "DF", label: "TOTAL DETTES FINANCIERES", netN: totalDettesFin, netN1: 0, isTotal: true, level: 1 },
            ...passif.filter(p => ['DB', 'DC'].includes(p.code)),
            { code: "DP", label: "TOTAL PASSIF CIRCULANT", netN: totalPassifCirculant, netN1: 0, isTotal: true, level: 1 },
            { code: "DZ", label: "TOTAL GÉNÉRAL PASSIF", netN: totalActif, netN1: 0, isTotal: true, level: 2 },
        ];

        return NextResponse.json({
            actif: structuredActif,
            passif: structuredPassif
        });

    } catch (error) {
        console.error("Erreur API Bilan:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
