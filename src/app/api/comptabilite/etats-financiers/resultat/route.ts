import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Comparatif N-1 non disponible : le journal TPE ne conserve pas d'historique annuel distinct.

export async function GET(request: Request) {
    try {
        const entries = await prisma.tpeJournal.findMany({
            where: { status: "EXPORTED", source: { not: "WHATSAPP_TEST" } }
        });

        const ventes = { code: "TA", label: "Ventes de marchandises", netN: 0, netN1: 0 };
        const services = { code: "TC", label: "Travaux, services vendus", netN: 0, netN1: 0 };

        const achats = { code: "RA", label: "Achats de marchandises", netN: 0, netN1: 0 };
        const transports = { code: "RC", label: "Transports", netN: 0, netN1: 0 };
        const servicesExt = { code: "RD", label: "Services extérieurs", netN: 0, netN1: 0 };
        const impots = { code: "RTX", label: "Impôts et taxes", netN: 0, netN1: 0 };
        const personnel = { code: "RF2", label: "Charges de personnel", netN: 0, netN1: 0 };
        // Impôt sur le résultat : non calculé automatiquement (pas de moteur fiscal branché sur le journal TPE).
        const IS = { code: "RI", label: "Impôts sur le Résultat", netN: 0, netN1: 0 };

        entries.forEach(entry => {
            const amount = (entry.entree || 0) + (entry.sortie || 0);
            const debit = entry.debitCompte || "";
            const credit = entry.creditCompte || "";

            // Charges 6xx
            if (debit.startsWith('60')) achats.netN -= amount;
            if (debit.startsWith('61')) transports.netN -= amount;
            if (debit.startsWith('62')) servicesExt.netN -= amount;
            if (debit.startsWith('64')) impots.netN -= amount;
            if (debit.startsWith('66')) personnel.netN -= amount;

            // Produits 7xx
            if (credit.startsWith('701')) ventes.netN += amount;
            if (credit.startsWith('706')) services.netN += amount;
        });

        const totalProduits = ventes.netN + services.netN;
        const valeurAjoutee = totalProduits + achats.netN + transports.netN + servicesExt.netN;
        const ebe = valeurAjoutee + impots.netN + personnel.netN;
        const resultatExploitation = ebe;
        const resultatFinancier = 0; // Aucune classe 67/77 (financier) mappée pour l'instant
        const resultatHAO = 0; // Aucune classe 8x (HAO) mappée pour l'instant
        const resultatNet = resultatExploitation + resultatFinancier + resultatHAO + IS.netN;

        const resultat = [
            { code: "TE", label: "PRODUITS D'EXPLOITATION", isHeader: true },
            ventes,
            { code: "TB", label: "Ventes de produits fabriqués", netN: 0, netN1: 0 },
            services,
            { code: "RE", label: "CHARGES D'EXPLOITATION", isHeader: true },
            achats,
            transports,
            servicesExt,
            impots,
            personnel,
            { code: "XA", label: "VALEUR AJOUTEE (V.A.)", netN: valeurAjoutee, netN1: 0, isTotal: true },
            { code: "XF", label: "EXCEDENT BRUT D'EXPLOITATION (EBE)", netN: ebe, netN1: 0, isTotal: true },
            { code: "RP", label: "RESULTAT D'EXPLOITATION", netN: resultatExploitation, netN1: 0, isTotal: true },
            { code: "RFI", label: "RESULTAT FINANCIER", netN: resultatFinancier, netN1: 0, isTotal: true },
            { code: "RH", label: "RESULTAT HORS ACTIVITE ORDINAIRE", netN: resultatHAO, netN1: 0, isTotal: true },
            IS,
            { code: "RN", label: "RESULTAT NET", netN: resultatNet, netN1: 0, isTotal: true, level: 2 },
        ];

        return NextResponse.json({ resultat });

    } catch (error) {
        console.error("Erreur API Resultat:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
