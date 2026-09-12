/**
 * Rubriques d'un bulletin de paie, à partir du résultat d'un moteur
 * (src/lib/payroll/engines). Sert à l'impression des bulletins et à l'export
 * du livre de paie, pour que les deux présentent exactement les mêmes lignes.
 *
 * Aucun calcul ici : on ne fait que nommer et ordonner les montants produits
 * par le moteur ; une ligne à zéro est omise sauf si elle est structurante
 * (brut, net).
 */

import type { PayrollDetail } from "./engines/senegal";
import type { PayrollDetailCI } from "./engines/cote-ivoire";

export interface Rubrique {
    code: string;
    libelle: string;
    /** Base ou assiette, si pertinente. */
    base?: number;
    /** Taux en fraction (0,056) ou nombre de parts, si pertinent. */
    taux?: number;
    /** Montant à la charge du salarié (gain positif, retenue négative). */
    salarie?: number;
    /** Montant à la charge de l'employeur. */
    employeur?: number;
}

export interface SectionBulletin {
    titre: string;
    rubriques: Rubrique[];
}

export interface BulletinEntree {
    pays: string;
    baseSalary: number;
    absencesDays: number;
    overtimeHours: number;
    bonuses: number;
    transportAllowance: number;
    grossSalary: number;
    taxableIncome: number;
    socialSecurity: number;
    taxes: number;
    netSalary: number;
    employerContributions: number;
    detail: Record<string, number> | null;
}

const nonNul = (r: Rubrique) => (r.salarie ?? 0) !== 0 || (r.employeur ?? 0) !== 0;

export function rubriquesBulletin(b: BulletinEntree): SectionBulletin[] {
    const d = (b.detail ?? {}) as Record<string, number>;
    const avantages = d.avantagesNature ?? 0;
    const heuresSup = d.remunerationHeuresSup ?? 0;
    const absences = b.absencesDays > 0 ? -Math.round((b.baseSalary / 30) * Math.min(b.absencesDays, 30)) : 0;

    const gains: Rubrique[] = [
        { code: "100", libelle: "Salaire de base", salarie: b.baseSalary },
        { code: "110", libelle: `Absences (${b.absencesDays} j)`, salarie: absences },
        { code: "120", libelle: `Heures supplémentaires (${b.overtimeHours} h)`, salarie: heuresSup },
        { code: "130", libelle: "Primes et gratifications", salarie: b.bonuses },
        { code: "140", libelle: "Indemnité de transport", salarie: b.transportAllowance },
        { code: "150", libelle: "Avantages en nature (valeur imposable)", salarie: avantages },
    ].filter(nonNul);
    gains.push({ code: "199", libelle: "SALAIRE BRUT", salarie: b.grossSalary });

    if (b.pays === "CI") return rubriquesCI(b, d as unknown as PayrollDetailCI, gains, avantages);
    return rubriquesSN(b, d as unknown as PayrollDetail, gains, avantages);
}

function rubriquesSN(b: BulletinEntree, d: PayrollDetail, gains: Rubrique[], avantages: number): SectionBulletin[] {
    const cotisations: Rubrique[] = [
        { code: "200", libelle: "IPRES régime général", taux: 0.056, salarie: -(d.ipresRegimeGeneral ?? 0), employeur: d.ipresRegimeGeneralPatronal ?? 0 },
        { code: "210", libelle: "IPRES régime complémentaire (cadres)", taux: 0.024, salarie: -(d.ipresRegimeComplementaire ?? 0), employeur: d.ipresRegimeComplementairePatronal ?? 0 },
        { code: "220", libelle: "IPM (cotisation maladie)", salarie: -(d.ipmSalarial ?? 0), employeur: d.ipmPatronal ?? 0 },
        { code: "230", libelle: "CSS prestations familiales", taux: 0.07, employeur: d.cssPrestationsFamiliales ?? 0 },
        { code: "240", libelle: "CSS accidents du travail", employeur: d.cssAccidentTravail ?? 0 },
        { code: "250", libelle: "CFCE", taux: 0.03, employeur: d.cfce ?? 0 },
    ].filter(nonNul);

    const impots: Rubrique[] = [
        { code: "300", libelle: "Abattement forfaitaire 30 % (plafonné)", salarie: 0, base: d.abattement ?? 0 },
        { code: "310", libelle: "Base imposable mensuelle", base: b.taxableIncome },
        { code: "320", libelle: `IR brut (barème art. 173, ${d.parts ?? 1} part${(d.parts ?? 1) > 1 ? "s" : ""})`, base: (d.irAvantReduction ?? 0) / 12, salarie: 0 },
        { code: "330", libelle: "Réduction pour charges de famille", salarie: Math.round((d.reductionChargeFamille ?? 0) / 12) },
        { code: "340", libelle: "Impôt sur le revenu retenu", salarie: -(d.impotRevenu ?? 0) },
        { code: "350", libelle: `TRIMF (${d.partsTrimf ?? 1} part${(d.partsTrimf ?? 1) > 1 ? "s" : ""})`, salarie: -(d.trimf ?? 0) },
    ].filter((r) => nonNul(r) || r.base !== undefined);

    return [
        { titre: "Gains", rubriques: gains },
        { titre: "Cotisations sociales", rubriques: cotisations },
        { titre: "Impôts et taxes", rubriques: impots },
        { titre: "Net", rubriques: netSection(b, avantages) },
    ];
}

function rubriquesCI(b: BulletinEntree, d: PayrollDetailCI, gains: Rubrique[], avantages: number): SectionBulletin[] {
    const cotisations: Rubrique[] = [
        { code: "200", libelle: "CNPS retraite", taux: 0.063, salarie: -(d.cnpsRetraite ?? 0), employeur: d.cnpsRetraitePatronal ?? 0 },
        { code: "210", libelle: "CMU (forfait)", salarie: -(d.cmuSalarial ?? 0), employeur: d.cmuPatronal ?? 0 },
        { code: "220", libelle: "CNPS prestations familiales", taux: 0.05, employeur: d.cnpsPrestationsFamiliales ?? 0 },
        { code: "230", libelle: "CNPS assurance maternité", taux: 0.0075, employeur: d.cnpsMaternite ?? 0 },
        { code: "240", libelle: "CNPS accidents du travail", employeur: d.cnpsAccidentTravail ?? 0 },
        { code: "250", libelle: "Taxe d'apprentissage (FDFP)", taux: 0.004, employeur: d.taxeApprentissage ?? 0 },
        { code: "260", libelle: "Formation professionnelle continue (FDFP)", taux: 0.012, employeur: d.formationProfessionnelle ?? 0 },
    ].filter(nonNul);

    const impots: Rubrique[] = [
        { code: "310", libelle: "Base imposable ITS", base: b.taxableIncome },
        { code: "320", libelle: "ITS brut (barème 2024)", base: d.itsAvantReduction ?? 0 },
        { code: "330", libelle: `Réduction pour charges de famille (${d.parts ?? 1} part${(d.parts ?? 1) > 1 ? "s" : ""})`, salarie: d.reductionChargesFamille ?? 0 },
        { code: "340", libelle: "ITS retenu", salarie: -(d.its ?? 0) },
    ].filter((r) => nonNul(r) || r.base !== undefined);

    return [
        { titre: "Gains", rubriques: gains },
        { titre: "Cotisations sociales", rubriques: cotisations },
        { titre: "Impôt sur les traitements et salaires", rubriques: impots },
        { titre: "Net", rubriques: netSection(b, avantages) },
    ];
}

function netSection(b: BulletinEntree, avantages: number): Rubrique[] {
    const rubriques: Rubrique[] = [
        { code: "900", libelle: "Total retenues salariales", salarie: -(b.socialSecurity + b.taxes) },
    ];
    if (avantages > 0) rubriques.push({ code: "910", libelle: "Avantages en nature (non versés)", salarie: -avantages });
    rubriques.push({ code: "999", libelle: "NET À PAYER", salarie: b.netSalary });
    rubriques.push({ code: "950", libelle: "Total charges patronales", employeur: b.employerContributions });
    rubriques.push({ code: "960", libelle: "Coût total employeur", employeur: b.grossSalary + b.employerContributions });
    return rubriques;
}

/** Colonnes plates du livre de paie (une ligne par salarié). */
export function ligneLivreDePaie(b: BulletinEntree & { salarie: string; poste?: string | null }): Record<string, string | number> {
    const d = (b.detail ?? {}) as Record<string, number>;
    const commun = {
        Salarié: b.salarie,
        Poste: b.poste ?? "",
        "Salaire de base": b.baseSalary,
        "Absences (j)": b.absencesDays,
        "Heures sup.": b.overtimeHours,
        "Heures sup. (montant)": d.remunerationHeuresSup ?? 0,
        Primes: b.bonuses,
        Transport: b.transportAllowance,
        "Avantages en nature": d.avantagesNature ?? 0,
        "Salaire brut": b.grossSalary,
        "Base imposable": b.taxableIncome,
    };
    if (b.pays === "CI") {
        return {
            ...commun,
            "CNPS retraite (sal.)": d.cnpsRetraite ?? 0,
            "CMU (sal.)": d.cmuSalarial ?? 0,
            Parts: d.parts ?? 1,
            "ITS brut": d.itsAvantReduction ?? 0,
            RICF: d.reductionChargesFamille ?? 0,
            "ITS retenu": d.its ?? 0,
            "Total retenues": b.socialSecurity + b.taxes,
            "Net à payer": b.netSalary,
            "CNPS retraite (pat.)": d.cnpsRetraitePatronal ?? 0,
            "CNPS PF": d.cnpsPrestationsFamiliales ?? 0,
            "CNPS maternité": d.cnpsMaternite ?? 0,
            "CNPS AT": d.cnpsAccidentTravail ?? 0,
            "CMU (pat.)": d.cmuPatronal ?? 0,
            "Taxe d'apprentissage": d.taxeApprentissage ?? 0,
            "Formation professionnelle": d.formationProfessionnelle ?? 0,
            "Total charges patronales": b.employerContributions,
            "Coût employeur": b.grossSalary + b.employerContributions,
        };
    }
    return {
        ...commun,
        "IPRES RG (sal.)": d.ipresRegimeGeneral ?? 0,
        "IPRES RC (sal.)": d.ipresRegimeComplementaire ?? 0,
        "IPM (sal.)": d.ipmSalarial ?? 0,
        Parts: d.parts ?? 1,
        "IR brut (mensuel)": Math.round((d.irAvantReduction ?? 0) / 12),
        "Réduction charges famille": Math.round((d.reductionChargeFamille ?? 0) / 12),
        "IR retenu": d.impotRevenu ?? 0,
        TRIMF: d.trimf ?? 0,
        "Total retenues": b.socialSecurity + b.taxes,
        "Net à payer": b.netSalary,
        "IPRES RG (pat.)": d.ipresRegimeGeneralPatronal ?? 0,
        "IPRES RC (pat.)": d.ipresRegimeComplementairePatronal ?? 0,
        "IPM (pat.)": d.ipmPatronal ?? 0,
        "CSS PF": d.cssPrestationsFamiliales ?? 0,
        "CSS AT": d.cssAccidentTravail ?? 0,
        CFCE: d.cfce ?? 0,
        "Total charges patronales": b.employerContributions,
        "Coût employeur": b.grossSalary + b.employerContributions,
    };
}
