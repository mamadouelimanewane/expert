export interface ComplianceItem {
  id: string;
  category: string;
  description: string;
  weight: number;
}

export const UEMOA_CHECKLIST: ComplianceItem[] = [
  { id: "C1", category: "États Financiers", description: "Production des états financiers selon le SYSCOHADA révisé", weight: 5 },
  { id: "C2", category: "États Financiers", description: "Dépôt des états financiers dans les délais légaux", weight: 4 },
  { id: "C3", category: "États Financiers", description: "Conformité du Tableau des Flux de Trésorerie", weight: 3 },
  { id: "C4", category: "États Financiers", description: "Justification des soldes de trésorerie", weight: 4 },
  { id: "C5", category: "États Financiers", description: "Cohérence Capitaux Propres vs RCCM", weight: 4 },
  
  { id: "F1", category: "Obligations Fiscales", description: "Déclaration et paiement régulier de la TVA", weight: 5 },
  { id: "F2", category: "Obligations Fiscales", description: "Déclaration de l'IS/IBIC dans les délais", weight: 5 },
  { id: "F3", category: "Obligations Fiscales", description: "Retenues à la source (BRS/BNC) effectuées et reversées", weight: 4 },
  { id: "F4", category: "Obligations Fiscales", description: "Dépôt de la liasse fiscale annuelle", weight: 5 },
  { id: "F5", category: "Obligations Fiscales", description: "Paiement de la patente / CEL", weight: 2 },
  { id: "F6", category: "Obligations Fiscales", description: "Tenue du registre des immobilisations", weight: 3 },
  { id: "F7", category: "Obligations Fiscales", description: "Archivage des pièces justificatives (10 ans)", weight: 3 },
  
  { id: "J1", category: "Droit OHADA", description: "Tenue de l'AGO annuelle (approbation des comptes)", weight: 5 },
  { id: "J2", category: "Droit OHADA", description: "Mise à jour du RCCM", weight: 4 },
  { id: "J3", category: "Droit OHADA", description: "Tenue des registres sociaux (CA, AG)", weight: 3 },
  { id: "J4", category: "Droit OHADA", description: "Respect des règles de reconstitution des capitaux propres (Art 71) si < moitié CS", weight: 5 },
  { id: "J5", category: "Droit OHADA", description: "Dépôt des conventions réglementées", weight: 3 },
  
  { id: "B1", category: "Règles BCEAO", description: "Déclaration à la Centrale des Bilans", weight: 4 },
  { id: "B2", category: "Règles BCEAO", description: "Respect de la réglementation sur les changes (domiciliation)", weight: 5 },
  { id: "B3", category: "Règles BCEAO", description: "Déclaration des investissements directs étrangers", weight: 4 },
  { id: "B4", category: "Règles BCEAO", description: "Rapatriement des recettes d'exportation", weight: 5 },
  
  { id: "S1", category: "Conformité Sociale", description: "Immatriculation à la Caisse de Sécurité Sociale", weight: 5 },
  { id: "S2", category: "Conformité Sociale", description: "Déclarations sociales périodiques à jour", weight: 5 },
  { id: "S3", category: "Conformité Sociale", description: "Tenue du registre employeur", weight: 2 },
  { id: "S4", category: "Conformité Sociale", description: "Contrats de travail conformes et visés", weight: 3 },
  { id: "S5", category: "Conformité Sociale", description: "Respect du SMIG local", weight: 4 },
  
  { id: "G1", category: "Gouvernance", description: "Séparation des fonctions (Ordonnateur / Payeur)", weight: 4 },
  { id: "G2", category: "Gouvernance", description: "Manuel de procédures validé et appliqué", weight: 3 },
  { id: "G3", category: "Gouvernance", description: "Dispositif LBC/FT (Lutte Blanchiment)", weight: 5 },
  { id: "G4", category: "Gouvernance", description: "Nomination CAC (si seuils atteints)", weight: 5 }
];

export function calculateComplianceScore(answers: Record<string, 'conforme' | 'attention' | 'non_conforme'>): { score: number; rating: string; criticals: ComplianceItem[] } {
  let totalWeight = 0;
  let earnedScore = 0;
  const criticals: ComplianceItem[] = [];

  UEMOA_CHECKLIST.forEach(item => {
    const ans = answers[item.id];
    totalWeight += item.weight;
    
    if (ans === 'conforme') {
      earnedScore += item.weight;
    } else if (ans === 'attention') {
      earnedScore += (item.weight * 0.5); // Half points for partial compliance
    } else if (ans === 'non_conforme') {
      // 0 points
      if (item.weight >= 4) { // High weight items failing are critical
        criticals.push(item);
      }
    }
  });

  const rawScore = totalWeight > 0 ? Math.round((earnedScore / totalWeight) * 100) : 0;
  
  let rating = "CONFORME";
  if (rawScore < 60) rating = "NON CONFORME";
  else if (rawScore < 85) rating = "PARTIELLEMENT CONFORME";

  // Sort criticals by weight
  criticals.sort((a, b) => b.weight - a.weight);

  return {
    score: rawScore,
    rating,
    criticals: criticals.slice(0, 5) // Return top 5 criticals
  };
}
