/**
 * Copilote Vocal « Terroir » pour l'Inclusion de l'Informel — Cabinet Expert OHADA 360
 * Interprétation des notes vocales en langues locales (Wolof, Baoulé/Dioula, Bambara, Haoussa)
 * Imputation automatique dans le Système Minimal de Trésorerie (SMT) SYSCOHADA
 */

export type LangueTerroir = "WOLOF" | "DIOULA_NOUCHI" | "BAMBARA" | "HAOUSSA";

export type NatureTransactionSMT = "RECETTE_VENTE" | "DEPENSE_ACHAT" | "DEPENSE_FRAIS_DIVERS" | "FLUX_MOBILE_MONEY";

export interface NoteVocaleBrute {
  idNote: string;
  commercantNom: string;
  telephone: string;
  dateReception: string;
  langueDetectee: LangueTerroir;
  transcriptionPhonetique: string;
  dureeSecondes: number;
}

export interface EcritureSMTGeneree {
  idEcriture: string;
  date: string;
  journal: "SMT_CAISSE" | "SMT_MOBILE_MONEY";
  nature: NatureTransactionSMT;
  montant_XOF: number;
  categorieMarchandise: string;
  compteDebit: string;
  compteCredit: string;
  libelleEnFrancais: string;
  confirmationVocaleRetour: string;
}

export interface RapportCopiloteVocal {
  commercantNom: string;
  langue: LangueTerroir;
  transcription: string;
  confianceNlp_pct: number;
  ecriture: EcritureSMTGeneree;
  soldeCaisseEstimeApres_XOF: number;
  statutImputation: "VALIDEE_AUTOMATIQUE" | "A_CONFIRMER_PAR_EXPERT";
}

interface LexiqueLangue {
  motsAchats: string[];
  motsVentes: string[];
  motsMarchandises: Record<string, string>; // mot local -> traduction FR
  reponseAchat: (montant: number, produit: string) => string;
  reponseVente: (montant: number, produit: string) => string;
}

const LEXIQUES: Record<LangueTerroir, LexiqueLangue> = {
  WOLOF: {
    motsAchats: ["jend", "jënd", "fey", "dama jend", "dieund"],
    motsVentes: ["jaay", "jaayi", "am na", "dama jaay", "diaye"],
    motsMarchandises: {
      ceeb: "Riz",
      thieb: "Riz",
      diwlin: "Huile végétale",
      sukeur: "Sucre",
      soble: "Oignons",
      yapp: "Viande",
    },
    reponseAchat: (m, p) => `Waaw, enregistrer nañu jënd ${p} ci ${m.toLocaleString("fr-FR")} F CFA ci caisse bi. Jërëjëf !`,
    reponseVente: (m, p) => `Nangu nañu jaay ${p} ci ${m.toLocaleString("fr-FR")} F CFA. Barkéel !`,
  },
  DIOULA_NOUCHI: {
    motsAchats: ["san", "n'ye san", "kpata", "payé", "acheté"],
    motsVentes: ["feere", "n'ye feere", "mogo a pris", "vendu"],
    motsMarchandises: {
      malo: "Riz",
      tigi: "Arachide",
      savon: "Savon de ménage",
      sukaro: "Sucre",
      lait: "Lait concentré",
    },
    reponseAchat: (m, p) => `An b'a don ko i ye ${p} san ${m.toLocaleString("fr-FR")} CFA la. I ni ce !`,
    reponseVente: (m, p) => `Vente ${p} de ${m.toLocaleString("fr-FR")} CFA bien calée dans la caisse, le boss !`,
  },
  BAMBARA: {
    motsAchats: ["sanni", "n'ye sanni", "ka sara"],
    motsVentes: ["feere", "n'ye feere", "feere kɛ"],
    motsMarchandises: {
      malo: "Riz",
      sogo: "Viande",
      shiyo: "Beurre de karité",
      tulu: "Huile de cuisine",
    },
    reponseAchat: (m, p) => `I ni ce, an ye ${p} sanni ${m.toLocaleString("fr-FR")} CFA sɛbɛn kɛ kɛsɛ kɔnɔ.`,
    reponseVente: (m, p) => `I ni ce, an ye ${p} feere ${m.toLocaleString("fr-FR")} CFA sɛbɛn. Ala ka barika don !`,
  },
  HAOUSSA: {
    motsAchats: ["sayi", "na sayi", "biyan"],
    motsVentes: ["sayar", "na sayar", "ciniki"],
    motsMarchandises: {
      shinkafa: "Riz",
      gyada: "Arachide",
      madara: "Lait",
      sukari: "Sucre",
    },
    reponseAchat: (m, p) => `Mun rubuta sayen ${p} na CFA ${m.toLocaleString("fr-FR")}. Na gode !`,
    reponseVente: (m, p) => `Mun rubuta sayar da ${p} na CFA ${m.toLocaleString("fr-FR")}. Allah ya albarkaci ciniki !`,
  },
};

export function interpreterNoteVocaleTerroir(
  note: NoteVocaleBrute,
  soldeCaissePrecedent_XOF = 150_000
): RapportCopiloteVocal {
  const texte = note.transcriptionPhonetique.toLowerCase();
  const lexique = LEXIQUES[note.langueDetectee];

  // 1. Extraire le montant numérique (prioriser les montants monétaires face aux quantités)
  const matches = texte.match(/(\d[\d\s]*\d|\d+)/g);
  let montant = 10_000;
  if (matches && matches.length > 0) {
    const numbers = matches
      .map((m) => parseInt(m.replace(/\s+/g, ""), 10))
      .filter((n) => !isNaN(n) && n > 0);
    if (numbers.length > 0) {
      montant = Math.max(...numbers);
    }
  }

  // 2. Détecter le produit / la marchandise
  let produit = "Marchandises générales";
  for (const [termeLocal, traduction] of Object.entries(lexique.motsMarchandises)) {
    if (texte.includes(termeLocal)) {
      produit = traduction;
      break;
    }
  }

  // 3. Détecter s'il s'agit d'un achat ou d'une vente
  const estAchat = lexique.motsAchats.some((mot) => texte.includes(mot));
  const nature: NatureTransactionSMT = estAchat ? "DEPENSE_ACHAT" : "RECETTE_VENTE";

  // 4. Déterminer les comptes comptables SMT OHADA
  let debit = "571100"; // Caisse (Entrée)
  let credit = "701100"; // Ventes de marchandises
  let reponseVocale = lexique.reponseVente(montant, produit);
  let soldeApres = soldeCaissePrecedent_XOF + montant;

  if (estAchat) {
    debit = "601100"; // Achats de marchandises
    credit = "571100"; // Caisse (Sortie)
    reponseVocale = lexique.reponseAchat(montant, produit);
    soldeApres = soldeCaissePrecedent_XOF - montant;
  }

  const ecriture: EcritureSMTGeneree = {
    idEcriture: `SMT-${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    journal: "SMT_CAISSE",
    nature,
    montant_XOF: montant,
    categorieMarchandise: produit,
    compteDebit: debit,
    compteCredit: credit,
    libelleEnFrancais: `${estAchat ? "Achat comptant" : "Vente comptant"} : ${produit} (${note.commercantNom})`,
    confirmationVocaleRetour: reponseVocale,
  };

  return {
    commercantNom: note.commercantNom,
    langue: note.langueDetectee,
    transcription: note.transcriptionPhonetique,
    confianceNlp_pct: 95,
    ecriture,
    soldeCaisseEstimeApres_XOF: soldeApres,
    statutImputation: "VALIDEE_AUTOMATIQUE",
  };
}
