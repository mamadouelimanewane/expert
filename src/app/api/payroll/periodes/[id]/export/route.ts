import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/api-auth";
import { ligneLivreDePaie } from "@/lib/payroll/rubriques";

type Params = { params: Promise<{ id: string }> };

/**
 * Livre de paie d'une période : Excel (.xlsx) ou CSV.
 *
 * Feuille « Livre de paie » : une ligne par salarié, toutes les rubriques
 * (mêmes libellés que le bulletin imprimé), ligne de totaux.
 * Feuille « Déclarations » : totaux par organisme (IPRES/CNPS, CSS, IPM,
 * impôts, FDFP…) pour préparer les déclarations sociales et fiscales.
 */
export async function GET(req: Request, { params }: Params) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    const { id } = await params;
    if (!/^[0-9a-f]{24}$/.test(id)) return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
    const format = new URL(req.url).searchParams.get("format") === "csv" ? "csv" : "xlsx";

    const periode = await prisma.payrollPeriod.findUnique({
        where: { id },
        include: {
            client: { select: { companyName: true, firstName: true, lastName: true, country: true } },
            payslips: { include: { employee: { select: { firstName: true, lastName: true, position: true } } }, orderBy: { employee: { lastName: "asc" } } },
        },
    });
    if (!periode) return NextResponse.json({ error: "Période introuvable" }, { status: 404 });

    const lignes = periode.payslips.map((p) =>
        ligneLivreDePaie({
            salarie: `${p.employee.firstName} ${p.employee.lastName}`,
            poste: p.employee.position,
            pays: p.country,
            baseSalary: p.baseSalary,
            absencesDays: p.absencesDays,
            overtimeHours: p.overtimeHours,
            bonuses: p.bonuses,
            transportAllowance: p.transportAllowance,
            grossSalary: p.grossSalary,
            taxableIncome: p.taxableIncome,
            socialSecurity: p.employeeSocials,
            taxes: p.taxes,
            netSalary: p.netSalary,
            employerContributions: p.employerSocials,
            detail: (p.detail as Record<string, number> | null) ?? null,
        })
    );

    // Ligne de totaux : somme des colonnes numériques, hors « Parts ».
    if (lignes.length > 0) {
        const total: Record<string, string | number> = { Salarié: "TOTAL", Poste: "" };
        for (const cle of Object.keys(lignes[0])) {
            if (cle === "Salarié" || cle === "Poste" || cle === "Parts") continue;
            total[cle] = lignes.reduce((a, l) => a + (typeof l[cle] === "number" ? (l[cle] as number) : 0), 0);
        }
        lignes.push(total);
    }

    const nomClient = periode.client.companyName || `${periode.client.firstName ?? ""} ${periode.client.lastName ?? ""}`.trim();
    const slug = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
    const base = `livre-de-paie-${slug(nomClient)}-${slug(periode.periodName)}`;

    if (format === "csv") {
        const feuille = XLSX.utils.json_to_sheet(lignes);
        // BOM + point-virgule : ouverture directe dans Excel en français.
        const csv = "﻿" + XLSX.utils.sheet_to_csv(feuille, { FS: ";" });
        return new NextResponse(csv, {
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="${base}.csv"`,
            },
        });
    }

    const classeur = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(classeur, XLSX.utils.json_to_sheet(lignes), "Livre de paie");

    // Récapitulatif par organisme (hors ligne TOTAL du livre)
    const detailLignes = lignes.slice(0, -1);
    const somme = (cle: string) => detailLignes.reduce((a, l) => a + (Number(l[cle]) || 0), 0);
    type Recap = { Organisme: string; Rubrique: string; "Part salariale": number; "Part patronale": number; Total: number };
    const ligne = (Organisme: string, Rubrique: string, sal: number, pat: number): Recap => ({
        Organisme, Rubrique, "Part salariale": sal, "Part patronale": pat, Total: sal + pat,
    });
    const recap: Recap[] =
        periode.client.country === "CI"
            ? [
                  ligne("CNPS", "Retraite", somme("CNPS retraite (sal.)"), somme("CNPS retraite (pat.)")),
                  ligne("CNPS", "Prestations familiales", 0, somme("CNPS PF")),
                  ligne("CNPS", "Assurance maternité", 0, somme("CNPS maternité")),
                  ligne("CNPS", "Accidents du travail", 0, somme("CNPS AT")),
                  ligne("CNAM", "CMU", somme("CMU (sal.)"), somme("CMU (pat.)")),
                  ligne("DGI", "ITS retenu", somme("ITS retenu"), 0),
                  ligne("FDFP", "Taxe d'apprentissage", 0, somme("Taxe d'apprentissage")),
                  ligne("FDFP", "Formation professionnelle continue", 0, somme("Formation professionnelle")),
              ]
            : [
                  ligne("IPRES", "Régime général", somme("IPRES RG (sal.)"), somme("IPRES RG (pat.)")),
                  ligne("IPRES", "Régime complémentaire cadres", somme("IPRES RC (sal.)"), somme("IPRES RC (pat.)")),
                  ligne("CSS", "Prestations familiales", 0, somme("CSS PF")),
                  ligne("CSS", "Accidents du travail", 0, somme("CSS AT")),
                  ligne("IPM", "Cotisation maladie", somme("IPM (sal.)"), somme("IPM (pat.)")),
                  ligne("DGID", "Impôt sur le revenu (retenue)", somme("IR retenu"), 0),
                  ligne("DGID", "TRIMF", somme("TRIMF"), 0),
                  ligne("DGID", "CFCE", 0, somme("CFCE")),
              ];
    recap.push(
        ligne(
            "TOTAL",
            "",
            recap.reduce((a, r) => a + r["Part salariale"], 0),
            recap.reduce((a, r) => a + r["Part patronale"], 0)
        )
    );
    XLSX.utils.book_append_sheet(classeur, XLSX.utils.json_to_sheet(recap), "Déclarations");

    const infos = XLSX.utils.aoa_to_sheet([
        ["Employeur", nomClient],
        ["Pays", periode.client.country],
        ["Période", periode.periodName],
        ["Statut", periode.status],
        ["Bulletins", periode.payslips.length],
        ["Généré le", new Date().toLocaleString("fr-FR")],
        ["Logiciel", "Cabinet 360"],
    ]);
    XLSX.utils.book_append_sheet(classeur, infos, "Période");

    const buffer = XLSX.write(classeur, { type: "buffer", bookType: "xlsx" }) as Buffer;
    return new NextResponse(new Uint8Array(buffer), {
        headers: {
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": `attachment; filename="${base}.xlsx"`,
        },
    });
}
