import prisma from './prisma';

export interface AccountingEntryLine {
  compte: string;
  intitule: string;
  debit: number;
  credit: number;
}

export interface AccountingBatch {
  lignes: AccountingEntryLine[];
  confidence: number;
  source: 'RULE' | 'ML_LEARNING' | 'LLM' | 'A_QUALIFIER';
  /**
   * `true` lorsque aucune règle ni aucun modèle n'a su déterminer le compte :
   * l'écriture est imputée à un compte d'attente et doit être qualifiée par un
   * collaborateur avant export.
   */
  requiresReview: boolean;
  /** Motif de la mise en attente, le cas échéant. */
  reviewReason?: string;
}

/**
 * Compte d'attente SYSCOHADA (471 — Charges/produits à régulariser).
 * Utilisé lorsque l'imputation ne peut pas être déterminée : mieux vaut une
 * écriture visiblement en attente qu'une écriture imputée au hasard sur un
 * compte de charges plausible.
 */
export const COMPTE_ATTENTE = '471';

const keywordRules = [
  { keywords: ["achat", "fourniture", "marchandise"], compte: "601", intitule: "Achats de marchandises", type: "depense" },
  { keywords: ["loyer", "location"], compte: "622", intitule: "Locations et charges locatives", type: "depense" },
  { keywords: ["internet", "telephone", "communication"], compte: "628", intitule: "Frais de télécommunications", type: "depense" },
  { keywords: ["salaire", "paie", "paye"], compte: "661", intitule: "Rémunération du personnel", type: "depense" },
  { keywords: ["vente", "client", "prestation", "recette"], compte: "701", intitule: "Ventes de marchandises", type: "recette" },
];

export class AccountingEngine {
  
  /**
   * Extrait les mots clés principaux d'un libellé pour la recherche de règles
   */
  private static extractKeywords(libelle: string): string {
    return AccountingEngine.motCle(libelle);
  }

  /**
   * Mot-clé retenu pour l'auto-apprentissage.
   *
   * L'implémentation précédente prenait le PREMIER mot du libellé : « Paiement
   * loyer janvier » produisait la clé « paiement », si bien qu'une règle apprise
   * sur « loyer » n'était jamais retrouvée. On ignore désormais les mots vides
   * et on retient le premier terme porteur de sens.
   */
  static motCle(libelle: string): string {
    const MOTS_VIDES = new Set([
      'paiement', 'reglement', 'règlement', 'virement', 'facture', 'achat',
      'vente', 'le', 'la', 'les', 'de', 'des', 'du', 'un', 'une', 'pour',
      'sur', 'chez', 'avec', 'par', 'et', 'a', 'au', 'aux', 'en',
    ]);

    const mots = (libelle ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
      .split(' ')
      .filter(Boolean);

    if (mots.length === 0) return '';

    return mots.find((m) => m.length > 2 && !MOTS_VIDES.has(m)) ?? mots[0];
  }

  /**
   * Applique le traitement comptable "Game Changer" (ML -> Règles -> LLM + Smart VAT)
   */
  static async processEntry(libelle: string, entree: number, sortie: number, clientId: string): Promise<AccountingBatch> {
    const isRecette = entree > 0;
    const montantTTC = isRecette ? entree : sortie;
    const text = libelle.toLowerCase();
    
    // Vérifier si le client est assujetti à la TVA
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    const isAssujetti = client?.subjectToTva || false;
    
    // Extraction du compte principal
    let compteBase = "";
    let intituleBase = "";
    let source: AccountingBatch['source'] = 'RULE';
    let confidence = 0.5;
    let requiresReview = false;
    let reviewReason: string | undefined;

    // 1. Chercher d'abord dans l'auto-apprentissage (Machine Learning)
    const mainKeyword = this.extractKeywords(text);
    const learnedRule = await prisma.accountingRuleMapping.findFirst({
      where: {
        keyword: mainKeyword,
        OR: [
          { clientId: clientId },
          { clientId: null }
        ]
      },
      orderBy: { usageCount: 'desc' }
    });

    if (learnedRule) {
      compteBase = isRecette ? learnedRule.creditCompte : learnedRule.debitCompte;
      intituleBase = `Compte appris (${mainKeyword})`;
      source = 'ML_LEARNING';
      confidence = 1.0; // Confiance maximale car c'est une règle validée par l'expert
    } 
    // 2. Sinon, chercher dans les règles métiers par mots-clés
    else {
      for (const rule of keywordRules) {
        if ((isRecette && rule.type === "recette") || (!isRecette && rule.type === "depense")) {
          const match = rule.keywords.some(kw => text.includes(kw));
          if (match) {
            compteBase = rule.compte;
            intituleBase = rule.intitule;
            source = 'RULE';
            confidence = 0.8;
            break;
          }
        }
      }
    }

    // 3. Aucune règle n'a fonctionné.
    //
    // L'implémentation précédente appelait une fonction `callOpenSourceLLM` qui
    // n'interrogeait aucun modèle : elle attendait 600 ms puis renvoyait un
    // compte codé en dur (632 ou 706) avec une confiance de 0,9 — la plus haute
    // du système. Le collaborateur voyait donc « analysé par IA, confiance
    // 90 % » sur une imputation tirée au sort.
    //
    // L'écriture part maintenant en compte d'attente, avec une confiance nulle
    // et un signalement explicite.
    if (!compteBase) {
      compteBase = COMPTE_ATTENTE;
      intituleBase = 'Compte d\'attente — imputation à qualifier';
      source = 'A_QUALIFIER';
      confidence = 0;
      requiresReview = true;
      reviewReason =
        `Aucune règle ni règle apprise ne correspond au libellé « ${libelle} ». ` +
        `L'écriture est imputée au compte ${COMPTE_ATTENTE} et doit être qualifiée avant export.`;
    }

    // --- Génération des lignes multiples (Smart VAT) ---
    const lignes: AccountingEntryLine[] = [];
    const compteTresorerie = "521"; // Compte Banque par défaut

    if (isAssujetti) {
      // Éclatement TVA
      const montantHT = parseFloat((montantTTC / 1.18).toFixed(2));
      const montantTVA = parseFloat((montantTTC - montantHT).toFixed(2));

      if (isRecette) {
        // Vente avec TVA collectée
        lignes.push({ compte: compteTresorerie, intitule: "Banque", debit: montantTTC, credit: 0 });
        lignes.push({ compte: compteBase, intitule: intituleBase, debit: 0, credit: montantHT });
        lignes.push({ compte: "4431", intitule: "État, TVA facturée", debit: 0, credit: montantTVA });
      } else {
        // Achat avec TVA déductible
        lignes.push({ compte: compteBase, intitule: intituleBase, debit: montantHT, credit: 0 });
        lignes.push({ compte: "4452", intitule: "État, TVA récupérable", debit: montantTVA, credit: 0 });
        lignes.push({ compte: compteTresorerie, intitule: "Banque", debit: 0, credit: montantTTC });
      }
    } else {
      // Non assujetti (Tout en TTC)
      if (isRecette) {
        lignes.push({ compte: compteTresorerie, intitule: "Banque", debit: montantTTC, credit: 0 });
        lignes.push({ compte: compteBase, intitule: intituleBase, debit: 0, credit: montantTTC });
      } else {
        lignes.push({ compte: compteBase, intitule: intituleBase, debit: montantTTC, credit: 0 });
        lignes.push({ compte: compteTresorerie, intitule: "Banque", debit: 0, credit: montantTTC });
      }
    }

    // Garde-fou de partie double : aucune écriture déséquilibrée ne doit sortir
    // du moteur, quelles que soient les règles appliquées ou les arrondis TVA.
    const totalDebit = lignes.reduce((s, l) => s + l.debit, 0);
    const totalCredit = lignes.reduce((s, l) => s + l.credit, 0);
    const ecart = Math.round((totalDebit - totalCredit) * 100) / 100;

    if (Math.abs(ecart) > 0.01) {
      throw new Error(
        `Écriture déséquilibrée pour « ${libelle} » : débit ${totalDebit}, crédit ${totalCredit} (écart ${ecart}).`
      );
    }

    return { lignes, confidence, source, requiresReview, reviewReason };
  }

  /**
   * Décompose une écriture multi-lignes en couples débit/crédit équilibrés.
   *
   * `TpeJournal` ne stocke qu'un compte débité et un compte crédité par ligne.
   * L'appelant se contentait de prendre la PREMIÈRE et la DERNIÈRE ligne du
   * lot : sur une écriture avec TVA (charge HT / TVA déductible / trésorerie
   * TTC), la ligne de TVA disparaissait et la charge était enregistrée pour son
   * montant TTC. Le journal devenait déséquilibré et les états financiers faux.
   *
   * L'algorithme apparie les montants débiteurs et créditeurs jusqu'à épuisement :
   * la somme des couples produits est toujours égale au total de l'écriture.
   */
  static toPairedEntries(lignes: AccountingEntryLine[]): {
    debitCompte: string;
    debitIntitule: string;
    creditCompte: string;
    creditIntitule: string;
    montant: number;
  }[] {
    const debits = lignes
      .filter((l) => l.debit > 0)
      .map((l) => ({ ...l, reste: l.debit }));
    const credits = lignes
      .filter((l) => l.credit > 0)
      .map((l) => ({ ...l, reste: l.credit }));

    const couples: {
      debitCompte: string;
      debitIntitule: string;
      creditCompte: string;
      creditIntitule: string;
      montant: number;
    }[] = [];

    let i = 0;
    let j = 0;

    while (i < debits.length && j < credits.length) {
      const montant = Math.round(Math.min(debits[i].reste, credits[j].reste) * 100) / 100;

      if (montant > 0) {
        couples.push({
          debitCompte: debits[i].compte,
          debitIntitule: debits[i].intitule,
          creditCompte: credits[j].compte,
          creditIntitule: credits[j].intitule,
          montant,
        });
      }

      debits[i].reste -= montant;
      credits[j].reste -= montant;

      if (debits[i].reste <= 0.005) i++;
      if (credits[j].reste <= 0.005) j++;
    }

    return couples;
  }

  /**
   * Apprentissage : enregistrer une nouvelle règle lorsqu'un expert corrige l'IA
   */
  static async learnFromCorrection(keyword: string, debitCompte: string, creditCompte: string, clientId?: string) {
    // Upsert la règle : si elle existe, incrémenter le compteur, sinon créer
    const existing = await prisma.accountingRuleMapping.findFirst({
      where: { keyword, clientId: clientId || null }
    });

    if (existing) {
      await prisma.accountingRuleMapping.update({
        where: { id: existing.id },
        data: { usageCount: existing.usageCount + 1, debitCompte, creditCompte }
      });
    } else {
      await prisma.accountingRuleMapping.create({
        data: { keyword, debitCompte, creditCompte, clientId: clientId || null }
      });
    }
  }
}
