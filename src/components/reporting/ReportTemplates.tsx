export const REPORT_TEMPLATES = [
  {
    id: "audit",
    name: "Rapport d'Audit",
    description: "Rapport complet avec avis de l'auditeur sur les états financiers.",
    color: "indigo",
    sections: [
      { id: "intro", title: "Introduction", defaultChecked: true },
      { id: "method", title: "Méthodologie", defaultChecked: true },
      { id: "findings", title: "Constatations", defaultChecked: true },
      { id: "opinion", title: "Opinion", defaultChecked: true }
    ]
  },
  {
    id: "mission",
    name: "Rapport de Mission",
    description: "Synthèse d'intervention et recommandations.",
    color: "blue",
    sections: [
      { id: "context", title: "Contexte de la mission", defaultChecked: true },
      { id: "travaux", title: "Travaux réalisés", defaultChecked: true },
      { id: "recos", title: "Recommandations", defaultChecked: true }
    ]
  },
  {
    id: "annuel",
    name: "Rapport Annuel Client",
    description: "Bilan annuel d'activité et performance financière.",
    color: "emerald",
    sections: [
      { id: "chiffres", title: "Chiffres clés", defaultChecked: true },
      { id: "analyse", title: "Analyse financière", defaultChecked: true },
      { id: "perspectives", title: "Perspectives", defaultChecked: true }
    ]
  },
  {
    id: "liasse",
    name: "Liasse Fiscale",
    description: "États financiers aux normes SYSCOHADA.",
    color: "amber",
    sections: [
      { id: "bilan", title: "Bilan (Actif/Passif)", defaultChecked: true },
      { id: "resultat", title: "Compte de Résultat", defaultChecked: true },
      { id: "tafire", title: "TAFIRE", defaultChecked: true },
      { id: "annexes", title: "Notes Annexes", defaultChecked: false }
    ]
  }
];
