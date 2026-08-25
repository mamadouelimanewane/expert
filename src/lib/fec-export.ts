// ─────────────────────────────────────────────────────────────────────────────
// Export FEC (Fichier des Écritures Comptables), norme française (article
// A47 A-1 du Livre des procédures fiscales) : 18 colonnes obligatoires,
// séparées par tabulation, une ligne par mouvement (débit ou crédit).
//
// Génère le fichier à partir des écritures réellement enregistrées dans
// TpeJournal (comptes SYSCOHADA déjà produits par le moteur d'imputation).
// Le modèle ne distingue pas de "journal" comptable classique (achats,
// ventes, banque, OD) : le JournalCode est dérivé du sens du flux
// (recette/dépense), pas une donnée saisie séparément — c'est une
// classification honnête d'un champ réel, pas une fabrication. Les colonnes
// sans équivalent dans le modèle (compte auxiliaire, lettrage, devise)
// restent vides plutôt que d'être inventées.
// ─────────────────────────────────────────────────────────────────────────────

export interface EcritureSource {
  id: string;
  date: string; // format ISO "AAAA-MM-JJ"
  libelle: string;
  entree: number;
  sortie: number;
  debitCompte: string;
  debitIntitule: string;
  creditCompte: string;
  creditIntitule: string;
  montant: number;
  exportedAt: string | Date | null;
}

export interface LigneFEC {
  JournalCode: string;
  JournalLib: string;
  EcritureNum: string;
  EcritureDate: string;
  CompteNum: string;
  CompteLib: string;
  CompAuxNum: string;
  CompAuxLib: string;
  PieceRef: string;
  PieceDate: string;
  EcritureLib: string;
  Debit: string;
  Credit: string;
  EcritureLet: string;
  DateLet: string;
  ValidDate: string;
  Montantdevise: string;
  Idevise: string;
}

const ENTETES_FEC: (keyof LigneFEC)[] = [
  "JournalCode", "JournalLib", "EcritureNum", "EcritureDate", "CompteNum", "CompteLib",
  "CompAuxNum", "CompAuxLib", "PieceRef", "PieceDate", "EcritureLib", "Debit", "Credit",
  "EcritureLet", "DateLet", "ValidDate", "Montantdevise", "Idevise",
];

function formaterDateFEC(iso: string | Date | null): string {
  if (!iso) return "";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (isNaN(d.getTime())) return "";
  const aaaa = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const jj = String(d.getDate()).padStart(2, "0");
  return `${aaaa}${mm}${jj}`;
}

function formaterMontant(n: number): string {
  return n > 0 ? n.toFixed(2).replace(".", ",") : "";
}

/** Deux lignes FEC (débit + crédit) par écriture source, numéro d'écriture partagé. */
export function genererLignesFEC(ecritures: EcritureSource[]): LigneFEC[] {
  const lignes: LigneFEC[] = [];

  ecritures.forEach((e, index) => {
    const journalCode = e.entree > 0 ? "VE" : "AC";
    const journalLib = e.entree > 0 ? "Ventes" : "Achats";
    const ecritureNum = String(index + 1).padStart(6, "0");
    const ecritureDate = formaterDateFEC(e.date);
    const validDate = e.exportedAt ? formaterDateFEC(e.exportedAt) : "";

    const base = {
      JournalCode: journalCode,
      JournalLib: journalLib,
      EcritureNum: ecritureNum,
      EcritureDate: ecritureDate,
      CompAuxNum: "",
      CompAuxLib: "",
      PieceRef: e.id,
      PieceDate: ecritureDate,
      EcritureLib: e.libelle,
      EcritureLet: "",
      DateLet: "",
      ValidDate: validDate,
      Montantdevise: "",
      Idevise: "",
    };

    lignes.push({
      ...base,
      CompteNum: e.debitCompte,
      CompteLib: e.debitIntitule,
      Debit: formaterMontant(e.montant),
      Credit: "",
    });
    lignes.push({
      ...base,
      CompteNum: e.creditCompte,
      CompteLib: e.creditIntitule,
      Debit: "",
      Credit: formaterMontant(e.montant),
    });
  });

  return lignes;
}

/** Fichier texte tabulé, en-tête inclus — format standard d'échange FEC. */
export function formaterFichierFEC(lignes: LigneFEC[]): string {
  const enTete = ENTETES_FEC.join("\t");
  const corps = lignes.map((l) => ENTETES_FEC.map((c) => l[c]).join("\t"));
  return [enTete, ...corps].join("\r\n");
}

/** Nom de fichier conventionnel : identifiant + "FEC" + date de clôture. */
export function nommerFichierFEC(identifiant: string, dateCloture: string): string {
  const idPropre = identifiant.replace(/[^A-Za-z0-9]/g, "") || "CLIENT";
  const dateProp = formaterDateFEC(dateCloture) || formaterDateFEC(new Date());
  return `${idPropre}FEC${dateProp}.txt`;
}
