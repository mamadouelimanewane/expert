/**
 * Bordereaux de déclarations sociales et fiscales d'une période de paie,
 * pré-remplis à partir des bulletins enregistrés.
 *
 * Un bordereau par organisme destinataire :
 *   Sénégal       : IPRES (RG + RC), CSS (PF + AT), IPM, DGID (IR, TRIMF, CFCE)
 *   Côte d'Ivoire : CNPS (retraite, PF, maternité, AT), CNAM (CMU),
 *                   DGI (ITS, état 301), FDFP (TA + FPC)
 *
 * Aucun recalcul : les montants viennent du détail figé de chaque bulletin.
 * Les assiettes plafonnées sont lues dans ce détail ; pour les bulletins
 * antérieurs à leur enregistrement, elles sont reconstituées à partir du brut
 * et de la règle d'exonération du transport, avec les plafonds du moteur.
 */

import { PLAFOND_CSS, PLAFOND_IPM, PLAFOND_IPRES_RC, PLAFOND_IPRES_RG, TRANSPORT_EXONERE } from "./engines/senegal";
import { CMU_PATRONAL, CMU_SALARIAL, PLAFOND_CNPS_PF, PLAFOND_CNPS_RETRAITE, TAUX_CI, TRANSPORT_EXONERE_CI } from "./engines/cote-ivoire";

export interface BulletinDeclaration {
    salarie: string;
    poste?: string | null;
    isCadre?: boolean;
    grossSalary: number;
    taxableIncome: number;
    transportAllowance: number;
    employeeSocials: number;
    employerSocials: number;
    taxes: number;
    detail: Record<string, number> | null;
}

export interface LigneBordereau {
    libelle: string;
    /** Assiette totale (somme des assiettes individuelles plafonnées). */
    assiette?: number;
    tauxSalarial?: number;
    tauxPatronal?: number;
    salarial: number;
    patronal: number;
    total: number;
}

export interface Bordereau {
    /** Code court : IPRES, CSS, IPM, DGID, CNPS, CNAM, DGI, FDFP. */
    organisme: string;
    titre: string;
    destinataire: string;
    /** Texte réglementaire ou nom du formulaire officiel, à titre indicatif. */
    reference?: string;
    effectif: number;
    lignes: LigneBordereau[];
    totalSalarial: number;
    totalPatronal: number;
    /** Montant à verser à l'organisme. */
    total: number;
    /** Annexe nominative : une ligne par salarié. */
    colonnes: string[];
    nominatif: (string | number)[][];
}

const r0 = (n: number) => Math.round(n);
const somme = <T>(xs: T[], f: (x: T) => number) => xs.reduce((a, x) => a + (f(x) || 0), 0);

/** Assiettes d'un bulletin sénégalais, lues dans le détail ou reconstituées. */
function assiettesSN(b: BulletinDeclaration) {
    const d = b.detail ?? {};
    const brutSocial =
        d.brutSocial ?? Math.max(0, b.grossSalary - b.transportAllowance + Math.max(0, b.transportAllowance - TRANSPORT_EXONERE));
    const rcActif = (d.ipresRegimeComplementaire ?? 0) > 0 || b.isCadre === true;
    return {
        brutSocial,
        ipresRg: d.assietteIpresRg ?? Math.min(brutSocial, PLAFOND_IPRES_RG),
        ipresRc: d.assietteIpresRc ?? (rcActif ? Math.min(brutSocial, PLAFOND_IPRES_RC) : 0),
        css: d.assietteCss ?? Math.min(brutSocial, PLAFOND_CSS),
        ipm: d.assietteIpm ?? Math.min(brutSocial, PLAFOND_IPM),
    };
}

/** Assiettes d'un bulletin ivoirien, lues dans le détail ou reconstituées. */
function assiettesCI(b: BulletinDeclaration) {
    const d = b.detail ?? {};
    const brutImposable =
        d.brutImposable ?? Math.max(0, b.grossSalary - b.transportAllowance + Math.max(0, b.transportAllowance - TRANSPORT_EXONERE_CI));
    return {
        brutImposable,
        retraite: d.assietteRetraite ?? Math.min(brutImposable, PLAFOND_CNPS_RETRAITE),
        pf: d.assiettePf ?? Math.min(brutImposable, PLAFOND_CNPS_PF),
    };
}

function ligne(libelle: string, salarial: number, patronal: number, extra: Partial<LigneBordereau> = {}): LigneBordereau {
    return { libelle, salarial: r0(salarial), patronal: r0(patronal), total: r0(salarial) + r0(patronal), ...extra };
}

function bordereau(
    base: Omit<Bordereau, "totalSalarial" | "totalPatronal" | "total" | "effectif">,
    effectif: number
): Bordereau {
    const totalSalarial = somme(base.lignes, (l) => l.salarial);
    const totalPatronal = somme(base.lignes, (l) => l.patronal);
    return { ...base, effectif, totalSalarial, totalPatronal, total: totalSalarial + totalPatronal };
}

/** Taux patronal effectif d'une cotisation à taux variable (AT), déduit des montants. */
function tauxEffectif(montant: number, assiette: number): number | undefined {
    return assiette > 0 ? Math.round((montant / assiette) * 10_000) / 10_000 : undefined;
}

function bordereauxSN(bulletins: BulletinDeclaration[]): Bordereau[] {
    const n = bulletins.length;
    const rows = bulletins.map((b) => ({ b, d: b.detail ?? {}, a: assiettesSN(b) }));

    const ipres = bordereau(
        {
            organisme: "IPRES",
            titre: "Bordereau de cotisations IPRES",
            destinataire: "Institution de Prévoyance Retraite du Sénégal",
            reference: "Déclaration mensuelle des salaires et cotisations",
            lignes: [
                ligne("Régime général", somme(rows, (x) => x.d.ipresRegimeGeneral), somme(rows, (x) => x.d.ipresRegimeGeneralPatronal), {
                    assiette: r0(somme(rows, (x) => x.a.ipresRg)),
                    tauxSalarial: 0.056,
                    tauxPatronal: 0.084,
                }),
                ligne(
                    "Régime complémentaire cadres",
                    somme(rows, (x) => x.d.ipresRegimeComplementaire),
                    somme(rows, (x) => x.d.ipresRegimeComplementairePatronal),
                    { assiette: r0(somme(rows, (x) => x.a.ipresRc)), tauxSalarial: 0.024, tauxPatronal: 0.036 }
                ),
            ],
            colonnes: ["Salarié", "Brut social", "Assiette RG", "RG salarié", "RG employeur", "Assiette RC", "RC salarié", "RC employeur", "Total"],
            nominatif: rows.map(({ b, d, a }) => [
                b.salarie,
                r0(a.brutSocial),
                r0(a.ipresRg),
                r0(d.ipresRegimeGeneral ?? 0),
                r0(d.ipresRegimeGeneralPatronal ?? 0),
                r0(a.ipresRc),
                r0(d.ipresRegimeComplementaire ?? 0),
                r0(d.ipresRegimeComplementairePatronal ?? 0),
                r0((d.ipresRegimeGeneral ?? 0) + (d.ipresRegimeGeneralPatronal ?? 0) + (d.ipresRegimeComplementaire ?? 0) + (d.ipresRegimeComplementairePatronal ?? 0)),
            ]),
        },
        n
    );

    const assietteCss = somme(rows, (x) => x.a.css);
    const at = somme(rows, (x) => x.d.cssAccidentTravail);
    const css = bordereau(
        {
            organisme: "CSS",
            titre: "Bordereau de cotisations CSS",
            destinataire: "Caisse de Sécurité Sociale",
            reference: "Prestations familiales et accidents du travail — cotisations patronales",
            lignes: [
                ligne("Prestations familiales", 0, somme(rows, (x) => x.d.cssPrestationsFamiliales), { assiette: r0(assietteCss), tauxPatronal: 0.07 }),
                ligne("Accidents du travail / maladies professionnelles", 0, at, { assiette: r0(assietteCss), tauxPatronal: tauxEffectif(at, assietteCss) }),
            ],
            colonnes: ["Salarié", "Brut social", "Assiette CSS", "Prestations familiales", "Accidents du travail", "Total"],
            nominatif: rows.map(({ b, d, a }) => [
                b.salarie,
                r0(a.brutSocial),
                r0(a.css),
                r0(d.cssPrestationsFamiliales ?? 0),
                r0(d.cssAccidentTravail ?? 0),
                r0((d.cssPrestationsFamiliales ?? 0) + (d.cssAccidentTravail ?? 0)),
            ]),
        },
        n
    );

    const ipmSal = somme(rows, (x) => x.d.ipmSalarial);
    const ipmPat = somme(rows, (x) => x.d.ipmPatronal);
    const assietteIpm = somme(rows, (x) => x.a.ipm);
    const ipm = bordereau(
        {
            organisme: "IPM",
            titre: "Bordereau de cotisations IPM",
            destinataire: "Institution de Prévoyance Maladie de l'entreprise",
            reference: "Cotisation maladie, assiette plafonnée à 250 000 F",
            lignes: [
                ligne("Cotisation maladie", ipmSal, ipmPat, {
                    assiette: r0(assietteIpm),
                    tauxSalarial: tauxEffectif(ipmSal, assietteIpm),
                    tauxPatronal: tauxEffectif(ipmPat, assietteIpm),
                }),
            ],
            colonnes: ["Salarié", "Assiette IPM", "Part salariale", "Part patronale", "Total"],
            nominatif: rows.map(({ b, d, a }) => [b.salarie, r0(a.ipm), r0(d.ipmSalarial ?? 0), r0(d.ipmPatronal ?? 0), r0((d.ipmSalarial ?? 0) + (d.ipmPatronal ?? 0))]),
        },
        n
    );

    const dgid = bordereau(
        {
            organisme: "DGID",
            titre: "État des retenues à la source sur salaires",
            destinataire: "Direction Générale des Impôts et des Domaines",
            reference: "Déclaration mensuelle des retenues (IR, TRIMF) et CFCE",
            lignes: [
                ligne("Impôt sur le revenu retenu (barème art. 173)", somme(rows, (x) => x.d.impotRevenu), 0, {
                    assiette: r0(somme(rows, (x) => x.b.taxableIncome)),
                }),
                ligne("TRIMF", somme(rows, (x) => x.d.trimf), 0),
                ligne("Contribution forfaitaire à la charge de l'employeur (CFCE)", 0, somme(rows, (x) => x.d.cfce), {
                    assiette: r0(somme(rows, (x) => x.a.brutSocial)),
                    tauxPatronal: 0.03,
                }),
            ],
            colonnes: ["Salarié", "Parts", "Brut imposable", "Base imposable", "IR retenu", "TRIMF", "CFCE", "Total"],
            nominatif: rows.map(({ b, d, a }) => [
                b.salarie,
                d.parts ?? 1,
                r0(a.brutSocial),
                r0(b.taxableIncome),
                r0(d.impotRevenu ?? 0),
                r0(d.trimf ?? 0),
                r0(d.cfce ?? 0),
                r0((d.impotRevenu ?? 0) + (d.trimf ?? 0) + (d.cfce ?? 0)),
            ]),
        },
        n
    );

    // L'IPM n'est due que si l'employeur en a paramétré une.
    return [ipres, css, ...(ipm.total > 0 ? [ipm] : []), dgid];
}

function bordereauxCI(bulletins: BulletinDeclaration[]): Bordereau[] {
    const n = bulletins.length;
    const rows = bulletins.map((b) => ({ b, d: b.detail ?? {}, a: assiettesCI(b) }));

    const assiettePf = somme(rows, (x) => x.a.pf);
    const at = somme(rows, (x) => x.d.cnpsAccidentTravail);
    const cnps = bordereau(
        {
            organisme: "CNPS",
            titre: "Appel de cotisations CNPS",
            destinataire: "Caisse Nationale de Prévoyance Sociale",
            reference: "Déclaration mensuelle des salaires (DISA mensuelle)",
            lignes: [
                ligne("Retraite", somme(rows, (x) => x.d.cnpsRetraite), somme(rows, (x) => x.d.cnpsRetraitePatronal), {
                    assiette: r0(somme(rows, (x) => x.a.retraite)),
                    tauxSalarial: TAUX_CI.cnpsRetraiteSalarial,
                    tauxPatronal: TAUX_CI.cnpsRetraitePatronal,
                }),
                ligne("Prestations familiales", 0, somme(rows, (x) => x.d.cnpsPrestationsFamiliales), { assiette: r0(assiettePf), tauxPatronal: TAUX_CI.cnpsPrestationsFamiliales }),
                ligne("Assurance maternité", 0, somme(rows, (x) => x.d.cnpsMaternite), { assiette: r0(assiettePf), tauxPatronal: TAUX_CI.cnpsMaternite }),
                ligne("Accidents du travail", 0, at, { assiette: r0(assiettePf), tauxPatronal: tauxEffectif(at, assiettePf) }),
            ],
            colonnes: ["Salarié", "Brut imposable", "Assiette retraite", "Retraite salarié", "Retraite employeur", "Assiette PF/AT", "Prest. familiales", "Maternité", "Accidents travail", "Total"],
            nominatif: rows.map(({ b, d, a }) => [
                b.salarie,
                r0(a.brutImposable),
                r0(a.retraite),
                r0(d.cnpsRetraite ?? 0),
                r0(d.cnpsRetraitePatronal ?? 0),
                r0(a.pf),
                r0(d.cnpsPrestationsFamiliales ?? 0),
                r0(d.cnpsMaternite ?? 0),
                r0(d.cnpsAccidentTravail ?? 0),
                r0((d.cnpsRetraite ?? 0) + (d.cnpsRetraitePatronal ?? 0) + (d.cnpsPrestationsFamiliales ?? 0) + (d.cnpsMaternite ?? 0) + (d.cnpsAccidentTravail ?? 0)),
            ]),
        },
        n
    );

    const cnam = bordereau(
        {
            organisme: "CNAM",
            titre: "Bordereau de cotisations CMU",
            destinataire: "Caisse Nationale d'Assurance Maladie",
            reference: `Couverture maladie universelle — forfait ${CMU_SALARIAL} F salarié + ${CMU_PATRONAL} F employeur par assuré`,
            lignes: [ligne("CMU (forfait par salarié)", somme(rows, (x) => x.d.cmuSalarial), somme(rows, (x) => x.d.cmuPatronal))],
            colonnes: ["Salarié", "Part salariale", "Part patronale", "Total"],
            nominatif: rows.map(({ b, d }) => [b.salarie, r0(d.cmuSalarial ?? 0), r0(d.cmuPatronal ?? 0), r0((d.cmuSalarial ?? 0) + (d.cmuPatronal ?? 0))]),
        },
        n
    );

    const dgi = bordereau(
        {
            organisme: "DGI",
            titre: "État des retenues ITS",
            destinataire: "Direction Générale des Impôts",
            reference: "Déclaration mensuelle de l'impôt sur les traitements et salaires (barème 2024)",
            lignes: [
                ligne("ITS retenu", somme(rows, (x) => x.d.its), 0, { assiette: r0(somme(rows, (x) => x.b.taxableIncome)) }),
            ],
            colonnes: ["Salarié", "Parts", "Base imposable", "ITS brut", "Réduction charges de famille", "ITS retenu"],
            nominatif: rows.map(({ b, d }) => [b.salarie, d.parts ?? 1, r0(b.taxableIncome), r0(d.itsAvantReduction ?? 0), r0(d.reductionChargesFamille ?? 0), r0(d.its ?? 0)]),
        },
        n
    );

    const assietteFdfp = somme(rows, (x) => x.a.brutImposable);
    const fdfp = bordereau(
        {
            organisme: "FDFP",
            titre: "Bordereau FDFP",
            destinataire: "Fonds de Développement de la Formation Professionnelle",
            reference: "Taxe d'apprentissage et taxe de formation professionnelle continue",
            lignes: [
                ligne("Taxe d'apprentissage", 0, somme(rows, (x) => x.d.taxeApprentissage), { assiette: r0(assietteFdfp), tauxPatronal: TAUX_CI.taxeApprentissage }),
                ligne("Formation professionnelle continue", 0, somme(rows, (x) => x.d.formationProfessionnelle), { assiette: r0(assietteFdfp), tauxPatronal: TAUX_CI.formationProfessionnelle }),
            ],
            colonnes: ["Salarié", "Brut imposable", "Taxe d'apprentissage", "Formation professionnelle", "Total"],
            nominatif: rows.map(({ b, d, a }) => [b.salarie, r0(a.brutImposable), r0(d.taxeApprentissage ?? 0), r0(d.formationProfessionnelle ?? 0), r0((d.taxeApprentissage ?? 0) + (d.formationProfessionnelle ?? 0))]),
        },
        n
    );

    return [cnps, cnam, dgi, fdfp];
}

/** Bordereaux d'une période, selon la législation du dossier. */
export function bordereauxDeclarations(pays: string, bulletins: BulletinDeclaration[]): Bordereau[] {
    if (bulletins.length === 0) return [];
    return pays === "CI" ? bordereauxCI(bulletins) : bordereauxSN(bulletins);
}

/** Libellés des modes de règlement du salaire. */
export const MODES_PAIEMENT: Record<string, string> = {
    VIREMENT: "Virement bancaire",
    WAVE: "Wave",
    ORANGE_MONEY: "Orange Money",
    FREE_MONEY: "Free Money",
    ESPECES: "Espèces",
    CHEQUE: "Chèque",
};
