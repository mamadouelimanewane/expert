/**
 * Dossier de démonstration « SARL Diallo & Fils » : client sénégalais complet,
 * balance 2025, quatre salariés, une paie d'août 2026 payée et une paie de
 * septembre 2026 validée (bulletins, déclarations, ordre de paiement),
 * portail client activé.
 *
 *   npx tsx scripts/prepare-demo-paie.ts            # simulation
 *   npx tsx scripts/prepare-demo-paie.ts --apply    # applique
 *
 * Idempotent : relançable sans doublon (client par e-mail, salariés par nom,
 * périodes par libellé). Le lien du portail n'est jamais affiché : il se lit
 * dans la fiche client (bouton « Portail »). ATTENTION : base de PRODUCTION.
 */
import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";
import { calculatePayroll } from "../src/lib/payroll/engines";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const log = (m: string) => console.log(`${APPLY ? "✔" : "·"} ${m}`);

const CLIENT = {
    email: "contact@diallo-et-fils.sn",
    companyName: "SARL Diallo & Fils",
    firstName: "Moussa",
    lastName: "Diallo",
    phone: "+221 33 800 00 00",
    country: "SN",
    address: "Km 4,5 boulevard du Centenaire de la Commune de Dakar",
    city: "Dakar",
    ninea: "004512345 2A2",
    rccm: "SN DKR 2015 B 8421",
    sector: "Négoce de matériaux de construction",
    subjectToTva: true,
    paieAccidentRate: 0.01,
    paieIpmSalarial: 0.03,
    paieIpmPatronal: 0.03,
    isActive: true,
};

const SALARIES = [
    { firstName: "Aminata", lastName: "Ndiaye", position: "Assistante comptable", baseSalary: 450_000, transportAllowance: 20_800, maritalStatus: "MARIE", sexe: "F", childrenCount: 2, conjointsSansRevenu: 0, isCadre: false, avantagesNature: 0, modePaiement: "VIREMENT", banque: "CBAO", iban: "SN08 SN01 0152 0000 1234 5678 9012", numeroMobileMoney: null as string | null },
    { firstName: "Moussa", lastName: "Diallo", position: "Directeur commercial", baseSalary: 1_500_000, transportAllowance: 50_000, maritalStatus: "MARIE", sexe: "M", childrenCount: 3, conjointsSansRevenu: 1, isCadre: true, avantagesNature: 150_000, modePaiement: "VIREMENT", banque: "Société Générale", iban: "SN08 SN09 0012 0000 9876 5432 1098", numeroMobileMoney: null as string | null },
    { firstName: "Fatou", lastName: "Sarr", position: "Caissière", baseSalary: 180_000, transportAllowance: 20_800, maritalStatus: "CELIBATAIRE", sexe: "F", childrenCount: 0, conjointsSansRevenu: 0, isCadre: false, avantagesNature: 0, modePaiement: "WAVE", banque: null as string | null, iban: null as string | null, numeroMobileMoney: "+221 77 100 00 01" },
    { firstName: "Ibrahima", lastName: "Sow", position: "Chauffeur-livreur", baseSalary: 250_000, transportAllowance: 20_800, maritalStatus: "MARIE", sexe: "M", childrenCount: 1, conjointsSansRevenu: 0, isCadre: false, avantagesNature: 0, modePaiement: "ORANGE_MONEY", banque: null as string | null, iban: null as string | null, numeroMobileMoney: "+221 78 100 00 02" },
];

/** Variables du mois par salarié (absences, heures sup., primes). */
const PERIODES: { periodName: string; status: "VALIDATED" | "PAID"; paidAt?: Date; paymentMode?: string; paymentRef?: string; createdAt: Date; variables: Record<string, { absencesDays: number; overtimeHours: number; bonuses: number }> }[] = [
    {
        periodName: "août 2026", status: "PAID", paidAt: new Date("2026-09-04T10:00:00Z"), paymentMode: "VIREMENT", paymentRef: "VIR-2026-08-PAIE", createdAt: new Date("2026-08-31T16:00:00Z"),
        variables: { Ndiaye: { absencesDays: 0, overtimeHours: 0, bonuses: 0 }, Diallo: { absencesDays: 0, overtimeHours: 0, bonuses: 200_000 }, Sarr: { absencesDays: 1, overtimeHours: 6, bonuses: 0 }, Sow: { absencesDays: 0, overtimeHours: 12, bonuses: 15_000 } },
    },
    {
        periodName: "septembre 2026", status: "VALIDATED", createdAt: new Date("2026-09-12T17:30:00Z"),
        variables: { Ndiaye: { absencesDays: 0, overtimeHours: 4, bonuses: 25_000 }, Diallo: { absencesDays: 2, overtimeHours: 0, bonuses: 0 }, Sarr: { absencesDays: 0, overtimeHours: 0, bonuses: 10_000 }, Sow: { absencesDays: 0, overtimeHours: 8, bonuses: 0 } },
    },
];

const BALANCE_DEMO = [
    { numero: "101000", intitule: "Capital social", debit: 0, credit: 10_000_000 },
    { numero: "121000", intitule: "Report à nouveau", debit: 0, credit: 2_150_000 },
    { numero: "162000", intitule: "Emprunt bancaire", debit: 0, credit: 6_000_000 },
    { numero: "241000", intitule: "Matériel et outillage", debit: 9_500_000, credit: 0 },
    { numero: "244100", intitule: "Matériel informatique", debit: 3_200_000, credit: 0 },
    { numero: "284100", intitule: "Amortissements matériel", debit: 0, credit: 3_800_000 },
    { numero: "311000", intitule: "Stocks de marchandises", debit: 4_100_000, credit: 0 },
    { numero: "411100", intitule: "Clients", debit: 10_250_000, credit: 0 },
    { numero: "401100", intitule: "Fournisseurs", debit: 0, credit: 4_600_000 },
    { numero: "421000", intitule: "Personnel — rémunérations dues", debit: 0, credit: 1_150_000 },
    { numero: "431000", intitule: "CSS / IPRES", debit: 0, credit: 640_000 },
    { numero: "443000", intitule: "TVA facturée", debit: 0, credit: 1_260_000 },
    { numero: "445000", intitule: "TVA récupérable", debit: 780_000, credit: 0 },
    { numero: "521000", intitule: "Banque CBAO", debit: 5_940_000, credit: 0 },
    { numero: "571000", intitule: "Caisse", debit: 430_000, credit: 0 },
    { numero: "601000", intitule: "Achats de marchandises", debit: 28_400_000, credit: 0 },
    { numero: "603000", intitule: "Variation de stocks", debit: 0, credit: 600_000 },
    { numero: "605000", intitule: "Autres achats", debit: 2_150_000, credit: 0 },
    { numero: "622000", intitule: "Locations", debit: 3_600_000, credit: 0 },
    { numero: "624000", intitule: "Entretien et réparations", debit: 940_000, credit: 0 },
    { numero: "627000", intitule: "Publicité", debit: 1_200_000, credit: 0 },
    { numero: "631000", intitule: "Frais bancaires", debit: 380_000, credit: 0 },
    { numero: "641000", intitule: "Impôts et taxes", debit: 720_000, credit: 0 },
    { numero: "661000", intitule: "Rémunérations du personnel", debit: 9_600_000, credit: 0 },
    { numero: "664000", intitule: "Charges sociales", debit: 2_100_000, credit: 0 },
    { numero: "671000", intitule: "Intérêts des emprunts", debit: 540_000, credit: 0 },
    { numero: "681000", intitule: "Dotations aux amortissements", debit: 1_900_000, credit: 0 },
    { numero: "701000", intitule: "Ventes de marchandises", debit: 0, credit: 52_300_000 },
    { numero: "706000", intitule: "Services vendus", debit: 0, credit: 4_600_000 },
    { numero: "891000", intitule: "Impôt sur les bénéfices", debit: 1_370_000, credit: 0 },
];

async function main() {
    console.log(APPLY ? "Application du dossier de démonstration…\n" : "Simulation (ajoutez --apply pour appliquer)\n");
    const admin = await prisma.user.findFirst({ where: { role: "ADMIN", isActive: true }, orderBy: { createdAt: "asc" }, select: { id: true } });
    if (!admin) throw new Error("Aucun administrateur actif.");

    // 1. Client
    let client = await prisma.client.findUnique({ where: { email: CLIENT.email } });
    log(`${client ? "Mettre à jour" : "Créer"} le client « ${CLIENT.companyName} »`);
    if (APPLY) {
        client = client
            ? await prisma.client.update({ where: { id: client.id }, data: CLIENT })
            : await prisma.client.create({ data: { ...CLIENT, type: "ENTREPRISE", fiscalRegime: "REEL_NORMAL" } });
    }
    const clientId = client?.id ?? "(simulation)";

    // 2. Portail client
    if (client && !(client.portalEnabled && client.portalToken)) {
        log("Activer le portail client (jeton généré, lisible depuis la fiche client)");
        if (APPLY) await prisma.client.update({ where: { id: client.id }, data: { portalEnabled: true, portalToken: randomBytes(32).toString("hex"), portalCreatedAt: new Date() } });
    } else if (client) log("Portail client déjà actif");

    // 3. Balance 2025
    const totalDebit = BALANCE_DEMO.reduce((s, l) => s + l.debit, 0);
    const totalCredit = BALANCE_DEMO.reduce((s, l) => s + l.credit, 0);
    if (Math.abs(totalDebit - totalCredit) > 1) throw new Error("Balance de démo déséquilibrée.");
    log(`Balance 2025-12 (${BALANCE_DEMO.length} comptes, ${totalDebit.toLocaleString("fr-FR")} / ${totalCredit.toLocaleString("fr-FR")})`);
    if (APPLY && client) {
        await prisma.balanceImportee.upsert({
            where: { clientId_periode: { clientId: client.id, periode: "2025-12" } },
            create: { clientId: client.id, periode: "2025-12", fichier: "balance-2025-diallo.xlsx", lignes: BALANCE_DEMO, nbLignes: BALANCE_DEMO.length, totalDebit, totalCredit, equilibree: true, importedById: admin.id },
            update: { lignes: BALANCE_DEMO, nbLignes: BALANCE_DEMO.length, totalDebit, totalCredit, equilibree: true },
        });
    }

    // 4. Salariés
    const employes: Record<string, { id: string } & (typeof SALARIES)[number]> = {};
    for (const s of SALARIES) {
        const existant = client ? await prisma.employee.findFirst({ where: { clientId: client.id, firstName: s.firstName, lastName: s.lastName } }) : null;
        log(`${existant ? "Mettre à jour" : "Créer"} le salarié ${s.firstName} ${s.lastName} — ${s.position}, ${s.baseSalary.toLocaleString("fr-FR")} F`);
        if (APPLY && client) {
            const e = existant
                ? await prisma.employee.update({ where: { id: existant.id }, data: s })
                : await prisma.employee.create({ data: { ...s, clientId: client.id } });
            employes[s.lastName] = { ...s, id: e.id };
        }
    }

    // 5. Périodes de paie
    for (const p of PERIODES) {
        const existante = client ? await prisma.payrollPeriod.findFirst({ where: { clientId: client.id, periodName: p.periodName } }) : null;
        if (existante) { log(`Période « ${p.periodName} » déjà présente (${existante.status})`); continue; }
        log(`Valider la paie « ${p.periodName} » (${p.status}) — ${SALARIES.length} bulletins`);
        if (!APPLY || !client) continue;

        const periode = await prisma.payrollPeriod.create({
            data: { periodName: p.periodName, status: p.status, clientId: client.id, paidAt: p.paidAt ?? null, paymentMode: p.paymentMode ?? null, paymentRef: p.paymentRef ?? null, createdAt: p.createdAt },
        });
        let totalNet = 0;
        for (const s of SALARIES) {
            const emp = employes[s.lastName];
            const v = p.variables[s.lastName];
            const r = calculatePayroll("SN", {
                baseSalary: s.baseSalary, absencesDays: v.absencesDays, overtimeHours: v.overtimeHours, bonuses: v.bonuses,
                transportAllowance: s.transportAllowance, maritalStatus: s.maritalStatus, childrenCount: s.childrenCount, isCadre: s.isCadre,
                conjointsSansRevenu: s.conjointsSansRevenu, sexe: s.sexe as "M" | "F", benefitsInKind: s.avantagesNature,
                accidentRate: CLIENT.paieAccidentRate, ipmRateSalarial: CLIENT.paieIpmSalarial, ipmRatePatronal: CLIENT.paieIpmPatronal,
            });
            totalNet += r.netSalary;
            await prisma.payslip.create({
                data: {
                    absencesDays: v.absencesDays, overtimeHours: v.overtimeHours, bonuses: v.bonuses,
                    baseSalary: s.baseSalary, transportAllowance: s.transportAllowance, avantagesNature: s.avantagesNature, country: "SN",
                    detail: r.detail as object, grossSalary: r.grossSalary, netSalary: r.netSalary, taxableIncome: r.taxableIncome,
                    taxes: r.taxes, employeeSocials: r.socialSecurity, employerSocials: r.employerContributions,
                    status: p.status, employeeId: emp.id, periodId: periode.id, createdAt: p.createdAt,
                },
            });
        }
        console.log(`    net total ${Math.round(totalNet).toLocaleString("fr-FR")} F`);
    }

    console.log(APPLY ? `\nTerminé. Client : ${clientId}\nPaie : https://expert-pi.vercel.app/payroll (choisir « SARL Diallo & Fils »)` : "\nAucune modification effectuée (simulation).");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
