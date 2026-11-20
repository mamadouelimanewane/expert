import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/api-auth";
import { ligneLivreDePaie } from "@/lib/payroll/rubriques";
import { bordereauxDeclarations } from "@/lib/payroll/declarations";

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
            payslips: { include: { employee: { select: { firstName: true, lastName: true, position: true, isCadre: true } } }, orderBy: { employee: { lastName: "asc" } } },
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
        const csv = "\ufeff" + XLSX.utils.sheet_to_csv(feuille, { FS: ";" });
        return new NextResponse(csv, {
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="${base}.csv"`,
            },
        });
    }

    const classeur = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(classeur, XLSX.utils.json_to_sheet(lignes), "Livre de paie");

    // Bordereaux par organisme : récapitulatif, puis une feuille nominative
    // par organisme (mêmes chiffres que la page « Déclarations » imprimable).
    const bordereaux = bordereauxDeclarations(
        periode.client.country,
        periode.payslips.map((p) => ({
            salarie: `${p.employee.firstName} ${p.employee.lastName}`,
            poste: p.employee.position,
            isCadre: p.employee.isCadre,
            grossSalary: p.grossSalary,
            taxableIncome: p.taxableIncome,
            transportAllowance: p.transportAllowance,
            employeeSocials: p.employeeSocials,
            employerSocials: p.employerSocials,
            taxes: p.taxes,
            detail: (p.detail as Record<string, number> | null) ?? null,
        }))
    );
    const recap = bordereaux.flatMap((b) =>
        b.lignes.map((l) => ({
            Organisme: b.organisme,
            Rubrique: l.libelle,
            Assiette: l.assiette ?? "",
            "Taux salarial": l.tauxSalarial ?? "",
            "Taux patronal": l.tauxPatronal ?? "",
            "Part salariale": l.salarial,
            "Part patronale": l.patronal,
            Total: l.total,
        }))
    );
    recap.push({
        Organisme: "TOTAL",
        Rubrique: "",
        Assiette: "",
        "Taux salarial": "",
        "Taux patronal": "",
        "Part salariale": bordereaux.reduce((a, b) => a + b.totalSalarial, 0),
        "Part patronale": bordereaux.reduce((a, b) => a + b.totalPatronal, 0),
        Total: bordereaux.reduce((a, b) => a + b.total, 0),
    });
    XLSX.utils.book_append_sheet(classeur, XLSX.utils.json_to_sheet(recap), "Déclarations");
    for (const b of bordereaux) {
        const totaux = b.colonnes.map((_, i) => (i === 0 ? "TOTAL" : typeof b.nominatif[0]?.[i] === "number" && b.colonnes[i] !== "Parts" ? b.nominatif.reduce((a, l) => a + (Number(l[i]) || 0), 0) : ""));
        XLSX.utils.book_append_sheet(classeur, XLSX.utils.aoa_to_sheet([b.colonnes, ...b.nominatif, totaux]), b.organisme.slice(0, 31));
    }

    const infos = XLSX.utils.aoa_to_sheet([
        ["Employeur", nomClient],
        ["Pays", periode.client.country],
        ["Période", periode.periodName],
        ["Statut", periode.status],
        ["Version des règles paie", periode.ruleVersion ?? "Ancienne période — référentiel non figé"],
        ["Bulletins", periode.payslips.length],
        ["Généré le", new Date().toLocaleString("fr-FR")],
        ["Logiciel", "Cabinet 360"],
    ]);
    XLSX.utils.book_append_sheet(classeur, infos, "Période");

    if (periode.ruleInfo && typeof periode.ruleInfo === "object") {
        const info = periode.ruleInfo as { sources?: { sujet?: string; reference?: string; applicableFrom?: string; url?: string }[]; avertissements?: string[]; statutValidation?: string };
        const provenance = [
            ["Validation", info.statutValidation ?? "REVUE_EXPERT_REQUISE"],
            ["Sujet", "Référence", "Date d'effet déclarée", "Source"],
            ...(info.sources ?? []).map((s) => [s.sujet ?? "", s.reference ?? "", s.applicableFrom ?? "", s.url ?? ""]),
            ["Avertissements", (info.avertissements ?? []).join(" | ")],
        ];
        XLSX.utils.book_append_sheet(classeur, XLSX.utils.aoa_to_sheet(provenance), "Référentiel paie");
    }

    const buffer = XLSX.write(classeur, { type: "buffer", bookType: "xlsx" }) as Buffer;
    return new NextResponse(new Uint8Array(buffer), {
        headers: {
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": `attachment; filename="${base}.xlsx"`,
        },
    });
}
