import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/api-auth";
import {
    echeancePour,
    OBLIGATIONS_FISCALES,
    urgenceDe,
    type ObligationFiscale,
} from "@/lib/ohada/obligations-fiscales";
import { echeanceTVA } from "@/lib/ohada/tax-deadlines";
import { echeancesFiscalesAnnuelles } from "@/lib/ohada/annual-tax-calendar";
import { clientConcerneObligation } from "@/lib/obligation-eligibility";

// Calendrier des obligations fiscales du cabinet.
//
// Les règles versionnées validées par le cabinet remplacent le catalogue
// générique pour leurs codes, pays et périodes. Les autres échéances sont
// indicatives ; volumes et montants proviennent des déclarations saisies.

const STATUTS_RESTANTS = ["DRAFT", "PENDING", "REJECTED"] as const;

function periodeDe(annee: number, mois: number): string {
    return `${annee}-${String(mois + 1).padStart(2, "0")}`;
}

function regleActiveDansLeMois(rule: { status: string; periodicity: string; dueMonth: number | null; dueDay: number; effectiveFrom: Date; effectiveUntil: Date | null; retiredAt: Date | null }, annee: number, moisUnBase: number) {
    const dateEcheance = new Date(Date.UTC(annee, moisUnBase - 1, Math.min(rule.dueDay, new Date(Date.UTC(annee, moisUnBase, 0)).getUTCDate())));
    const periodicityMatches = rule.periodicity === "MENSUELLE"
        || (rule.periodicity === "TRIMESTRIELLE" && rule.dueMonth === ((moisUnBase - 1) % 3) + 1)
        || (rule.periodicity === "ANNUELLE" && rule.dueMonth === moisUnBase);
    const notRetiredOnDate = rule.status !== "RETIRED" || !rule.retiredAt || dateEcheance < rule.retiredAt;
    return periodicityMatches && rule.effectiveFrom <= dateEcheance && (!rule.effectiveUntil || rule.effectiveUntil >= dateEcheance) && notRetiredOnDate;
}

export async function GET(request: Request) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    try {
        const { searchParams } = new URL(request.url);
        const paysFiltre = searchParams.get("pays")?.trim().toUpperCase() || null;

        const maintenant = new Date();

        // `?mois=abc` donnait NaN, d'ou une Invalid Date dont le .toISOString()
        // levait une RangeError ressortant en 500 « Erreur serveur » ; `?mois=99`
        // fabriquait la periode « 2026-100 », qui ne correspond a rien et
        // renvoyait tous les compteurs a zero comme si le cabinet etait a jour.
        const anneeBrute = searchParams.get("annee");
        const moisBrut = searchParams.get("mois");

        const annee = anneeBrute === null || anneeBrute === "" ? maintenant.getUTCFullYear() : Number(anneeBrute);
        const mois = moisBrut === null || moisBrut === "" ? maintenant.getUTCMonth() : Number(moisBrut);

        if (!Number.isInteger(annee) || annee < 2000 || annee > 2100) {
            return NextResponse.json({ error: "Paramètre `annee` invalide." }, { status: 400 });
        }
        if (!Number.isInteger(mois) || mois < 0 || mois > 11) {
            return NextResponse.json({ error: "Paramètre `mois` invalide (0 à 11)." }, { status: 400 });
        }

        const periode = periodeDe(annee, mois);

        // Charger les déclarations et les profils du portefeuille : un client
        // actif sans déclaration correspondante doit apparaître comme restant
        // à traiter, pas disparaître du calendrier.
        const trimestre = Math.floor(mois / 3) + 1;
        const dateMoisPrecedent = new Date(Date.UTC(annee, mois - 1, 1));
        const periodeMensuelleDue = periodeDe(dateMoisPrecedent.getUTCFullYear(), dateMoisPrecedent.getUTCMonth());
        const periodesRecherche = [
            periode,
            periodeMensuelleDue,
            ...[1, 2, 3, 4].map((q) => `${annee}-T${q}`),
            ...[annee - 2, annee - 1, annee].map((y) => `${y}-A`),
        ];
        const [declarations, clients, reglesReglementaires] = await Promise.all([
            prisma.taxDeclaration.findMany({
                where: { period: { in: periodesRecherche }, ...(paysFiltre ? { client: { country: paysFiltre } } : {}) },
                select: { type: true, status: true, amount: true, clientId: true, obligationCode: true, period: true, dueDate: true, client: { select: { country: true } } },
            }),
            prisma.client.findMany({
                where: { isActive: true, ...(paysFiltre ? { country: paysFiltre } : {}) },
                select: { id: true, type: true, country: true, companyName: true, firstName: true, lastName: true, sector: true, fiscalRegime: true, subjectToTva: true, taxProfile: true },
            }),
            prisma.regulatoryObligationRule.findMany({
                where: { status: { in: ["VERIFIED", "RETIRED"] }, ...(paysFiltre ? { country: paysFiltre } : {}) },
                orderBy: [{ country: "asc" }, { obligationCode: "asc" }, { version: "desc" }],
                select: {
                    id: true, country: true, obligationCode: true, version: true, title: true, description: true,
                    category: true, declarationType: true, periodicity: true, dueDay: true, dueMonth: true,
                    sourceTitle: true, sourceUrl: true, sourceArticle: true, applicabilityNotes: true,
                    clientTypes: true, fiscalRegimes: true, sectors: true, requiredTaxProfileFlags: true,
                    status: true, effectiveFrom: true, effectiveUntil: true, retiredAt: true,
                },
            }),
        ]);

        const reglesActives = reglesReglementaires.filter((rule) => rule.status === "VERIFIED" || rule.status === "RETIRED");
        const codesPersonnalises = new Set(reglesActives.map((rule) => `${rule.country}:${rule.obligationCode}`));
        const reglesApplicables = reglesActives.filter((rule) => regleActiveDansLeMois(rule, annee, mois + 1));
        const cataloguePersonnalise: ObligationFiscale[] = reglesApplicables.map((rule) => ({
            id: rule.obligationCode, titre: rule.title, description: rule.description,
            categorie: rule.category as ObligationFiscale["categorie"], pays: [rule.country], jourEcheance: rule.dueDay,
            periodicite: rule.periodicity as ObligationFiscale["periodicite"], typesDeclaration: [rule.declarationType],
            reference: `${rule.sourceTitle}${rule.sourceArticle ? ` · ${rule.sourceArticle}` : ""}`,
        }));
        const catalogue = [
            ...OBLIGATIONS_FISCALES.map((rule) => ({
                ...rule,
                pays: rule.pays.filter((country) => (!paysFiltre || country === paysFiltre) && !codesPersonnalises.has(`${country}:${rule.id}`)),
            })).filter((rule) => rule.pays.length > 0),
            ...cataloguePersonnalise,
        ];
        const regleParCode = new Map(reglesApplicables.map((rule) => [`${rule.country}:${rule.obligationCode}`, rule]));

        const obligations = catalogue.map((obligation) => {
            const periodeObligation = obligation.periodicite === "ANNUELLE"
                ? `${annee - 1}-A`
                : obligation.periodicite === "TRIMESTRIELLE"
                  ? `${annee}-T${trimestre}`
                  : periodeMensuelleDue;
            const customRule = obligation.pays.map((country) => regleParCode.get(`${country}:${obligation.id}`)).find(Boolean);
            const eligible = clients.filter((client) => clientConcerneObligation(obligation, client, customRule));
            const concernees = declarations.filter(
                (d) =>
                    obligation.typesDeclaration.includes(d.type) &&
                    obligation.pays.includes(d.client.country) &&
                    d.period === periodeObligation &&
                    (d.obligationCode ? d.obligationCode === obligation.id : true)
            );

            const restantes = concernees.filter((d) =>
                (STATUTS_RESTANTS as readonly string[]).includes(d.status)
            );
            const clientsAvecDeclarationOuverte = new Set(restantes.map((d) => d.clientId));
            const clientsAvecDeclarationDeposee = new Set(concernees
                .filter((d) => d.status === "SUBMITTED" || d.status === "VALIDATED")
                .map((d) => d.clientId));
            const clientsSansDeclaration = eligible.filter((client) =>
                !clientsAvecDeclarationOuverte.has(client.id) && !clientsAvecDeclarationDeposee.has(client.id)
            );
            const nbDossiersRestants = new Set([...restantes.map((d) => d.clientId), ...clientsSansDeclaration.map((c) => c.id)]).size;

            const echeancesParClient = eligible.map((client) => {
                const declaration = concernees.find((d) => d.clientId === client.id);
                const profil = client.taxProfile && typeof client.taxProfile === "object" && !Array.isArray(client.taxProfile)
                    ? client.taxProfile as Record<string, unknown>
                    : {};
                const echeance = declaration?.dueDate ?? (customRule
                    ? echeancePour(obligation, annee, mois)
                    : obligation.id === "tva-mensuelle"
                    ? echeanceTVA({ country: client.country, sector: client.sector, taxCenter: typeof profil.taxCenter === "string" ? profil.taxCenter : null }, annee, mois)
                    : echeancePour(obligation, annee, mois));
                return { clientId: client.id, date: echeance };
            });
            const parDate = new Map<string, number>();
            for (const row of echeancesParClient) {
                const key = row.date.toISOString();
                parDate.set(key, (parDate.get(key) ?? 0) + 1);
            }
            const datesTriees = [...parDate.entries()].sort(([a], [b]) => a.localeCompare(b));
            const echeance = datesTriees.length > 0 ? new Date(datesTriees[0][0]) : echeancePour(obligation, annee, mois);

            return {
                id: customRule ? `${customRule.country}:${obligation.id}` : obligation.id,
                obligationCode: obligation.id,
                titre: obligation.titre,
                description: obligation.description,
                categorie: obligation.categorie,
                pays: obligation.pays,
                reference: obligation.reference,
                sourceUrl: customRule?.sourceUrl ?? null,
                ruleVersion: customRule?.version ?? null,
                statutReglementaire: customRule ? "VALIDEE_PAR_LE_CABINET" : "INDICATIVE_A_VERIFIER",
                applicabilityNotes: customRule?.applicabilityNotes ?? null,
                periodicite: obligation.periodicite,
                echeance: echeance.toISOString(),
                echeancesParDate: datesTriees.map(([date, dossiers]) => ({ echeance: date, dossiers })),
                urgence: urgenceDe(echeance, maintenant),

                // Agrégats calculés sur les déclarations réelles.
                nbDossiers: eligible.length,
                nbRestants: nbDossiersRestants,
                periodeReference: periodeObligation,
                montantADeclarer: restantes.reduce((s, d) => s + (d.amount ?? 0), 0),
                montantTotal: concernees.reduce((s, d) => s + (d.amount ?? 0), 0),
                statut:
                    nbDossiersRestants > 0
                        ? "EN_COURS"
                        : concernees.length === 0
                        ? "AUCUNE_DECLARATION"
                        : restantes.length === 0
                          ? "VALIDE"
                          : "EN_COURS",
            };
        });

        const echeancesAnnuelles = clients.flatMap((client) => {
            const tasks = echeancesFiscalesAnnuelles({
                id: client.id, country: client.country, type: client.type,
                fiscalRegime: client.fiscalRegime, sector: client.sector, taxProfile: client.taxProfile,
            }, annee);
            return tasks.map((task) => {
                const declaration = declarations.find((d) =>
                    d.clientId === client.id && d.period === task.period && d.obligationCode === task.code
                );
                const dueDate = declaration?.dueDate ?? task.dueDate;
                const deposee = declaration?.status === "SUBMITTED" || declaration?.status === "VALIDATED";
                return {
                    id: task.code, clientId: client.id,
                    client: client.companyName || [client.firstName, client.lastName].filter(Boolean).join(" ") || "Client",
                    titre: task.titre, categorie: task.categorie, period: task.period,
                    echeance: dueDate.toISOString(), reference: task.reference, source: task.source,
                    statut: deposee ? declaration!.status : declaration ? declaration.status : "MANQUANTE",
                    montant: declaration?.amount ?? null,
                    montantADeclarer: declaration && !deposee ? declaration.amount : null,
                    nbRestants: deposee ? 0 : 1,
                    urgence: urgenceDe(dueDate, maintenant),
                };
            });
        });

        const clientsActifs = await prisma.client.count({
            where: { isActive: true, ...(paysFiltre ? { country: paysFiltre } : {}) },
        });

        return NextResponse.json({
            periode,
            annee,
            mois,
            pays: paysFiltre,
            statutReglementaire: reglesApplicables.length ? "REGLES_CABINET_ET_CATALOGUE_INDICATIF" : "INDICATIF_A_VERIFIER",
            avertissement: "Les règles validées par le cabinet sont versionnées et appliquées selon leur pays, leur périmètre et leur période d’effet. Les autres lignes du catalogue restent indicatives ; confirmez les textes officiels avant toute déclaration.",
            obligations,
            echeancesAnnuelles,
            synthese: {
                clientsActifs,
            declarationsPeriode: declarations.filter((d) => d.period === periodeMensuelleDue).length,
                montantADeclarer: obligations.reduce((s, o) => s + o.montantADeclarer, 0),
                obligationsImminentes: obligations.filter((o) => o.urgence === "IMMINENTE").length,
                obligationsDepassees: obligations.filter((o) => o.urgence === "DEPASSEE").length,
                dossiersRestants: obligations.reduce((s, o) => s + o.nbRestants, 0),
            },
            // Signalé à l'interface : sans déclaration saisie pour la période,
            // les compteurs sont nuls parce que la base est vide, pas parce que
            // le cabinet est à jour.
            aucuneDonnee: declarations.filter((d) => d.period === periodeMensuelleDue).length === 0,
        });
    } catch (error) {
        console.error("Erreur API obligations fiscales:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
