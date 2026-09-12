import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/api-auth";
import { MODES_PAIEMENT } from "@/lib/payroll/declarations";

type Params = { params: Promise<{ id: string }> };

/**
 * Ordre de paiement des salaires d'une période : une ligne par salarié avec
 * le net à payer et ses coordonnées de règlement (banque / IBAN ou numéro
 * Mobile Money), groupées par mode. Fichier à remettre à la banque ou à
 * charger chez l'opérateur ; l'application n'émet aucun virement.
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
            payslips: {
                include: { employee: { select: { firstName: true, lastName: true, position: true, modePaiement: true, banque: true, iban: true, numeroMobileMoney: true } } },
                orderBy: { employee: { lastName: "asc" } },
            },
        },
    });
    if (!periode) return NextResponse.json({ error: "Période introuvable" }, { status: 404 });

    const ordreModes = Object.keys(MODES_PAIEMENT);
    const lignes = periode.payslips
        .map((p) => {
            const e = p.employee;
            const mode = e.modePaiement && MODES_PAIEMENT[e.modePaiement] ? e.modePaiement : "";
            const mobile = ["WAVE", "ORANGE_MONEY", "FREE_MONEY"].includes(mode);
            return {
                Bénéficiaire: `${e.firstName} ${e.lastName}`,
                Poste: e.position ?? "",
                "Mode de paiement": mode ? MODES_PAIEMENT[mode] : "À préciser",
                Banque: mode === "VIREMENT" ? e.banque ?? "" : "",
                "IBAN / RIB": mode === "VIREMENT" ? e.iban ?? "" : "",
                "N° Mobile Money": mobile ? e.numeroMobileMoney ?? "" : "",
                "Net à payer": Math.round(p.netSalary),
                Motif: `Salaire ${periode.periodName}`,
                _ordre: mode ? ordreModes.indexOf(mode) : 99,
            };
        })
        .sort((a, b) => a._ordre - b._ordre || a.Bénéficiaire.localeCompare(b.Bénéficiaire, "fr"))
        .map(({ _ordre: _, ...l }) => l);

    const total = lignes.reduce((a, l) => a + l["Net à payer"], 0);
    const nomClient = periode.client.companyName || `${periode.client.firstName ?? ""} ${periode.client.lastName ?? ""}`.trim();
    const slug = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
    const base = `ordre-de-paiement-${slug(nomClient)}-${slug(periode.periodName)}`;

    const feuille = XLSX.utils.json_to_sheet([...lignes, { Bénéficiaire: "TOTAL", Poste: "", "Mode de paiement": "", Banque: "", "IBAN / RIB": "", "N° Mobile Money": "", "Net à payer": total, Motif: "" }]);

    if (format === "csv") {
        const csv = "\ufeff" + XLSX.utils.sheet_to_csv(feuille, { FS: ";" });
        return new NextResponse(csv, {
            headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${base}.csv"` },
        });
    }

    const classeur = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(classeur, feuille, "Ordre de paiement");

    // Récapitulatif par mode de règlement
    const parMode = new Map<string, { n: number; total: number }>();
    for (const l of lignes) {
        const c = parMode.get(l["Mode de paiement"]) ?? { n: 0, total: 0 };
        parMode.set(l["Mode de paiement"], { n: c.n + 1, total: c.total + l["Net à payer"] });
    }
    const recap = [...parMode.entries()].map(([mode, c]) => ({ "Mode de paiement": mode, Bénéficiaires: c.n, Montant: c.total }));
    recap.push({ "Mode de paiement": "TOTAL", Bénéficiaires: lignes.length, Montant: total });
    XLSX.utils.book_append_sheet(classeur, XLSX.utils.json_to_sheet(recap), "Par mode");

    XLSX.utils.book_append_sheet(
        classeur,
        XLSX.utils.aoa_to_sheet([
            ["Donneur d'ordre", nomClient],
            ["Pays", periode.client.country],
            ["Période", periode.periodName],
            ["Statut", periode.status === "PAID" ? "Payée" : "Validée, en attente de paiement"],
            ["Bénéficiaires", lignes.length],
            ["Montant total", total],
            ["Généré le", new Date().toLocaleString("fr-FR")],
            ["Logiciel", "Cabinet 360"],
        ]),
        "Période"
    );

    const buffer = XLSX.write(classeur, { type: "buffer", bookType: "xlsx" }) as Buffer;
    return new NextResponse(new Uint8Array(buffer), {
        headers: {
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": `attachment; filename="${base}.xlsx"`,
        },
    });
}
