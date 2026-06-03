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
  source: 'RULE' | 'ML_LEARNING' | 'LLM';
}

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
    return libelle.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(' ')[0] || libelle.toLowerCase();
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
    let source: 'RULE' | 'ML_LEARNING' | 'LLM' = 'RULE';
    let confidence = 0.5;

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

    // 3. Fallback sur le LLM Open Source si aucune règle n'a fonctionné
    if (!compteBase) {
      const llmResult = await this.callOpenSourceLLM(libelle, isRecette);
      compteBase = llmResult.compte;
      intituleBase = llmResult.intitule;
      source = 'LLM';
      confidence = 0.9;
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

    return { lignes, confidence, source };
  }

  /**
   * Simulation d'un appel à un LLM local (ex: Ollama, Mistral) pour l'analyse NLP
   */
  private static async callOpenSourceLLM(libelle: string, isRecette: boolean): Promise<{ compte: string, intitule: string }> {
    console.log(`[LLM] Requête NLP envoyée pour le libellé : "${libelle}"`);
    
    // Le prompt envoyé au modèle ressemblerait à :
    // "Tu es un expert-comptable OHADA. Identifie le compte de classe 6 ou 7 pour l'opération suivante : {libelle}. Réponds uniquement en format JSON { compte: '...', intitule: '...' }"
    
    await new Promise(resolve => setTimeout(resolve, 600)); // Latence LLM simulée

    if (isRecette) {
      return { compte: "706", intitule: "Services vendus (LLM AI)" };
    } else {
      return { compte: "632", intitule: "Services extérieurs (LLM AI)" };
    }
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
