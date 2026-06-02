import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET() {
    try {
        // Données d'exemple pour guider le client
        const templateData = [
            { Date: '01/06/2026', Libellé: 'Vente de marchandises', Entrées: 85000, Sorties: '' },
            { Date: '01/06/2026', Libellé: 'Achat carburant', Entrées: '', Sorties: 12000 },
            { Date: '02/06/2026', Libellé: 'Prestation de service', Entrées: 45000, Sorties: '' },
            { Date: '02/06/2026', Libellé: 'Loyer du local', Entrées: '', Sorties: 50000 },
            { Date: '03/06/2026', Libellé: 'Vente journalière', Entrées: 110000, Sorties: '' },
            { Date: '03/06/2026', Libellé: 'Facture électricité', Entrées: '', Sorties: 18500 },
            { Date: '', Libellé: '← EFFACEZ CES LIGNES ET SAISISSEZ LES VÔTRES', Entrées: '', Sorties: '' },
        ];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(templateData);

        // Style: set column widths
        ws['!cols'] = [
            { wch: 14 }, // Date
            { wch: 40 }, // Libellé
            { wch: 18 }, // Entrées
            { wch: 18 }, // Sorties
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'Cahier de Caisse');

        // Add instructions sheet
        const instructions = [
            { Instruction: '=== GUIDE DE SAISIE - CAHIER DE CAISSE TPE ===' },
            { Instruction: '' },
            { Instruction: '1. Date : Saisissez la date au format JJ/MM/AAAA' },
            { Instruction: '2. Libellé : Décrivez brièvement l\'opération (ex: Vente tissus, Loyer boutique, Achat carburant)' },
            { Instruction: '3. Entrées : Montant reçu en FCFA (argent qui rentre dans votre caisse)' },
            { Instruction: '4. Sorties : Montant payé en FCFA (argent qui sort de votre caisse)' },
            { Instruction: '' },
            { Instruction: '⚠️ Ne remplissez PAS les deux colonnes sur la même ligne.' },
            { Instruction: '⚠️ Pas besoin de numéros de compte. Le cabinet s\'occupe de tout.' },
            { Instruction: '' },
            { Instruction: 'Transmettez ce fichier à votre cabinet en fin de mois.' },
        ];
        const ws2 = XLSX.utils.json_to_sheet(instructions, { header: ['Instruction'], skipHeader: true });
        ws2['!cols'] = [{ wch: 70 }];
        XLSX.utils.book_append_sheet(wb, ws2, 'Guide');

        // Generate buffer
        const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        return new NextResponse(buf, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename="Cahier_Caisse_TPE_Modele.xlsx"',
            },
        });
    } catch (error) {
        console.error("Erreur génération Excel:", error);
        return NextResponse.json({ error: "Erreur lors de la génération du fichier." }, { status: 500 });
    }
}
