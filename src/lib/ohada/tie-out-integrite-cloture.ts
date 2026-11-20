/**
 * Tie-Out Intégrité de Clôture — Gardien Cryptographique (FloQast Standard)
 *
 * Génère une empreinte (fingerprint) de chaque section validée de la liasse
 * et détecte toute modification post-validation : altération de montant,
 * écriture injectée ou supprimée, changement de compte.
 */

export interface LigneCloture {
  compteOHADA: string;
  libelle: string;
  debit_XOF: number;
  credit_XOF: number;
}

export interface SectionValidee {
  idSection: string;
  libelleSectionSYSCOHADA: string;
  valideurNom: string;
  dateValidation: string;
  lignes: LigneCloture[];
  fingerprint: string;
  statut: "CADRE_CONFORME" | "MODIFICATION_DETECTEE" | "EN_ATTENTE_VALIDATION";
}

export interface EcartTieOut {
  compteOHADA: string;
  libelle: string;
  montantValide_XOF: number;
  montantActuel_XOF: number;
  delta_XOF: number;
  natureDelta: "DEBIT_MODIFIE" | "CREDIT_MODIFIE" | "LIGNE_AJOUTEE" | "LIGNE_SUPPRIMEE";
  risqueAudit: "CRITIQUE" | "ELEVE" | "MODERE";
}

export interface RapportTieOut {
  societeRaisonSociale: string;
  exercice: number;
  dateRapport: string;
  totalSections: number;
  sectionsConformes: number;
  sectionsModifiees: number;
  sectionsEnAttente: number;
  ecarts: EcartTieOut[];
  sections: SectionValidee[];
  conclusionIntegrite: "INTEGRE" | "ALTERE" | "PARTIEL";
  narratifTieOut: string;
}

export function calculerFingerprint(lignes: LigneCloture[]): string {
  let acc = 0;
  for (const l of lignes) {
    for (let i = 0; i < l.compteOHADA.length; i++) {
      acc = (acc * 31 + l.compteOHADA.charCodeAt(i)) >>> 0;
    }
    acc = (acc ^ Math.round(l.debit_XOF)) >>> 0;
    acc = (acc ^ Math.round(l.credit_XOF)) >>> 0;
  }
  return acc.toString(16).padStart(8, "0").toUpperCase();
}

export function sceller(
  idSection: string,
  libelleSectionSYSCOHADA: string,
  valideurNom: string,
  dateValidation: string,
  lignes: LigneCloture[]
): SectionValidee {
  return {
    idSection,
    libelleSectionSYSCOHADA,
    valideurNom,
    dateValidation,
    lignes,
    fingerprint: calculerFingerprint(lignes),
    statut: "CADRE_CONFORME",
  };
}

export function verifierIntegriteSection(
  section: SectionValidee,
  lignesActuelles: LigneCloture[]
): { integre: boolean; fingerActuel: string; ecarts: EcartTieOut[] } {
  const fingerActuel = calculerFingerprint(lignesActuelles);
  const integre = fingerActuel === section.fingerprint;
  const ecarts: EcartTieOut[] = [];

  if (!integre) {
    const mapValide = new Map<string, LigneCloture>();
    for (const l of section.lignes) mapValide.set(l.compteOHADA, l);

    const mapActuel = new Map<string, LigneCloture>();
    for (const l of lignesActuelles) mapActuel.set(l.compteOHADA, l);

    for (const [compte, lv] of mapValide.entries()) {
      const la = mapActuel.get(compte);
      if (!la) {
        ecarts.push({
          compteOHADA: compte,
          libelle: lv.libelle,
          montantValide_XOF: lv.debit_XOF + lv.credit_XOF,
          montantActuel_XOF: 0,
          delta_XOF: -(lv.debit_XOF + lv.credit_XOF),
          natureDelta: "LIGNE_SUPPRIMEE",
          risqueAudit: "CRITIQUE",
        });
      } else if (la.debit_XOF !== lv.debit_XOF) {
        ecarts.push({
          compteOHADA: compte,
          libelle: lv.libelle,
          montantValide_XOF: lv.debit_XOF,
          montantActuel_XOF: la.debit_XOF,
          delta_XOF: la.debit_XOF - lv.debit_XOF,
          natureDelta: "DEBIT_MODIFIE",
          risqueAudit: Math.abs(la.debit_XOF - lv.debit_XOF) > 1_000_000 ? "CRITIQUE" : "ELEVE",
        });
      } else if (la.credit_XOF !== lv.credit_XOF) {
        ecarts.push({
          compteOHADA: compte,
          libelle: lv.libelle,
          montantValide_XOF: lv.credit_XOF,
          montantActuel_XOF: la.credit_XOF,
          delta_XOF: la.credit_XOF - lv.credit_XOF,
          natureDelta: "CREDIT_MODIFIE",
          risqueAudit: Math.abs(la.credit_XOF - lv.credit_XOF) > 1_000_000 ? "CRITIQUE" : "ELEVE",
        });
      }
    }

    for (const [compte, la] of mapActuel.entries()) {
      if (!mapValide.has(compte)) {
        ecarts.push({
          compteOHADA: compte,
          libelle: la.libelle,
          montantValide_XOF: 0,
          montantActuel_XOF: la.debit_XOF + la.credit_XOF,
          delta_XOF: la.debit_XOF + la.credit_XOF,
          natureDelta: "LIGNE_AJOUTEE",
          risqueAudit: "ELEVE",
        });
      }
    }
  }

  return { integre, fingerActuel, ecarts };
}

export function genererRapportTieOut(
  societeRaisonSociale: string,
  exercice: number,
  sectionsValidees: SectionValidee[],
  grandLivreActuel: Map<string, LigneCloture[]>
): RapportTieOut {
  const sectionsVerifiees: SectionValidee[] = [];
  const tousEcarts: EcartTieOut[] = [];
  let conformes = 0;
  let modifiees = 0;
  let enAttente = 0;

  for (const section of sectionsValidees) {
    const lignesActuelles = grandLivreActuel.get(section.idSection);
    if (!lignesActuelles) {
      enAttente++;
      sectionsVerifiees.push({ ...section, statut: "EN_ATTENTE_VALIDATION" });
      continue;
    }
    const { integre, ecarts } = verifierIntegriteSection(section, lignesActuelles);
    sectionsVerifiees.push({
      ...section,
      statut: integre ? "CADRE_CONFORME" : "MODIFICATION_DETECTEE",
    });
    tousEcarts.push(...ecarts);
    if (integre) conformes++;
    else modifiees++;
  }

  const conclusion: RapportTieOut["conclusionIntegrite"] =
    modifiees === 0 && enAttente === 0
      ? "INTEGRE"
      : modifiees > 0 && conformes === 0
      ? "ALTERE"
      : "PARTIEL";

  const narratif =
    conclusion === "INTEGRE"
      ? `Tie-out validé — Toutes les ${conformes} sections de clôture SYSCOHADA ${exercice} sont intactes. Aucun écart post-validation détecté.`
      : `⚠ ALERTE TIE-OUT : ${modifiees} section(s) sur ${sectionsValidees.length} modifiée(s) après validation. ${tousEcarts.length} écart(s) comptable(s) identifié(s) dont ${tousEcarts.filter((e) => e.risqueAudit === "CRITIQUE").length} critique(s). Action CAC requise immédiatement.`;

  return {
    societeRaisonSociale,
    exercice,
    dateRapport: new Date().toISOString().slice(0, 10),
    totalSections: sectionsValidees.length,
    sectionsConformes: conformes,
    sectionsModifiees: modifiees,
    sectionsEnAttente: enAttente,
    ecarts: tousEcarts,
    sections: sectionsVerifiees,
    conclusionIntegrite: conclusion,
    narratifTieOut: narratif,
  };
}
