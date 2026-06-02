import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
    try {
        const entries = await prisma.tpeJournal.findMany({
            where: { status: "EXPORTED" }
        });

        // Base Mock Data for Resultat
        let ventes = { code: "TA", label: "Ventes de marchandises", netN: 150000000, netN1: 140000000 };
        let services = { code: "TC", label: "Travaux, services vendus", netN: 25000000, netN1: 20000000 };
        
        let achats = { code: "RA", label: "Achats de marchandises", netN: -80000000, netN1: -75000000 };
        let transports = { code: "RC", label: "Transports", netN: -5000000, netN1: -4500000 };
        let servicesExt = { code: "RD", label: "Services extérieurs", netN: -12000000, netN1: -10000000 };
        let impots = { code: "RE", label: "Impôts et taxes", netN: -1500000, netN1: -1200000 };
        let personnel = { code: "RF", label: "Charges de personnel", netN: -35000000, netN1: -30000000 };
        let IS = { code: "RI", label: "Impôts sur le Résultat", netN: -11000000, netN1: -10000000 };

        // Aggregate actual DB entries into the mock
        entries.forEach(entry => {
            const amount = entry.amount;
            
            // Charges 6xx
            if (entry.ohadaDebit?.startsWith('60')) achats.netN -= amount;
            if (entry.ohadaDebit?.startsWith('61') || entry.ohadaDebit?.startsWith('62')) servicesExt.netN -= amount;
            if (entry.ohadaDebit?.startsWith('64')) impots.netN -= amount;
            if (entry.ohadaDebit?.startsWith('66')) personnel.netN -= amount;
            
            // Produits 7xx
            if (entry.ohadaCredit?.startsWith('701')) ventes.netN += amount;
            if (entry.ohadaCredit?.startsWith('706')) services.netN += amount;
        });

        const totalProduits = ventes.netN + services.netN;
        const totalCharges = achats.netN + transports.netN + servicesExt.netN + impots.netN + personnel.netN;
        
        const valeurAjoutee = totalProduits + achats.netN + transports.netN + servicesExt.netN;
        const ebe = valeurAjoutee + impots.netN + personnel.netN; // Simplified
        const resultatExploitation = ebe;
        const resultatNet = resultatExploitation + IS.netN;

        const resultat = [
            { code: "TE", label: "PRODUITS D'EXPLOITATION", isHeader: true },
            ventes,
            { code: "TB", label: "Ventes de produits fabriqués", netN: 0, netN1: 0 },
            services,
            { code: "RE", label: "CHARGES D'EXPLOITATION", isHeader: true },
            achats,
            { code: "RB", label: "Variation de stocks", netN: 2000000, netN1: 1500000 },
            transports,
            servicesExt,
            impots,
            personnel,
            { code: "XA", label: "VALEUR AJOUTEE (V.A.)", netN: valeurAjoutee, netN1: 40800000, isTotal: true },
            { code: "XF", label: "EXCEDENT BRUT D'EXPLOITATION (EBE)", netN: ebe, netN1: 40800000, isTotal: true },
            { code: "RP", label: "RESULTAT D'EXPLOITATION", netN: resultatExploitation, netN1: 35000000, isTotal: true },
            { code: "RF", label: "RESULTAT FINANCIER", netN: -2500000, netN1: -3000000, isTotal: true },
            { code: "RH", label: "RESULTAT HORS ACTIVITE ORDINAIRE", netN: 0, netN1: 500000, isTotal: true },
            IS,
            { code: "RN", label: "RESULTAT NET", netN: resultatNet - 2500000, netN1: 22500000, isTotal: true, level: 2 },
        ];

        return NextResponse.json({ resultat });

    } catch (error) {
        console.error("Erreur API Resultat:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
