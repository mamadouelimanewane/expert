export type MissionTaskTemplate = { title: string; description: string; priority: number };

const TEMPLATES: Record<string, MissionTaskTemplate[]> = {
  AUDIT: [
    { title: "Évaluer l’acceptation du client et l’indépendance", description: "Documenter les risques de relation et les mesures de sauvegarde avant le début des travaux.", priority: 5 },
    { title: "Définir le périmètre, les risques et les seuils", description: "Faire valider le programme de travail et les seuils de signification par le responsable.", priority: 5 },
    { title: "Collecter et référencer les pièces justificatives", description: "Relier les pièces aux assertions et sections de travail concernées.", priority: 4 },
    { title: "Exécuter les procédures et documenter les échantillons", description: "Conserver la population, la méthode de sélection, les résultats et les exceptions.", priority: 4 },
    { title: "Résoudre les points de revue et préparer la conclusion", description: "Fermer les commentaires de revue et consigner les points restant à communiquer.", priority: 5 },
  ],
  TENUE_COMPTABLE: [
    { title: "Collecter les pièces de la période", description: "Suivre les pièces reçues et manquantes pour le dossier.", priority: 4 },
    { title: "Importer et contrôler la balance", description: "Vérifier les colonnes, comptes inconnus, doublons et équilibre débit/crédit.", priority: 5 },
    { title: "Rapprocher banques et comptes auxiliaires", description: "Documenter les écarts et lettrages non résolus.", priority: 4 },
    { title: "Réviser les écritures et déclarations", description: "Vérifier les imputations, pièces et rapprochements fiscaux avant validation.", priority: 5 },
    { title: "Préparer la clôture et transmettre les états", description: "Vérifier les contrôles, validations et pièces de clôture avant envoi.", priority: 4 },
  ],
  DECLARATION_FISCALE: [
    { title: "Confirmer le pays, le régime et la période", description: "Vérifier la législation applicable et sa période d’effet.", priority: 5 },
    { title: "Collecter les données et pièces justificatives", description: "Identifier les éléments manquants avant le calcul.", priority: 4 },
    { title: "Rapprocher les bases avec la comptabilité", description: "Expliquer les différences entre déclaration et soldes comptables.", priority: 5 },
    { title: "Faire réviser et approuver la déclaration", description: "Obtenir la revue requise avant tout dépôt.", priority: 5 },
    { title: "Archiver le dépôt et sa preuve", description: "Conserver la déclaration finale, la date et l’accusé de réception.", priority: 4 },
  ],
  PAIE: [
    { title: "Vérifier les changements de situation et variables", description: "Confirmer les entrées, absences, primes et changements salariés de la période.", priority: 5 },
    { title: "Confirmer le pays et la version des règles", description: "S’assurer que le moteur et le barème couvrent cette période et faire confirmer les règles locales.", priority: 5 },
    { title: "Calculer et contrôler les bulletins", description: "Examiner les bases, cotisations, impôts, arrondis et variations inhabituelles.", priority: 5 },
    { title: "Faire approuver les bulletins et états", description: "Obtenir une validation humaine avant diffusion ou paiement.", priority: 5 },
    { title: "Archiver les déclarations et preuves de paiement", description: "Conserver les documents déposés et justificatifs associés.", priority: 4 },
  ],
  CONSEIL: [
    { title: "Confirmer le besoin et le livrable attendu", description: "Consigner le périmètre, les hypothèses et les exclusions.", priority: 4 },
    { title: "Collecter les informations et pièces utiles", description: "Référencer les sources reçues et les limites des données.", priority: 3 },
    { title: "Réaliser et faire réviser l’analyse", description: "Documenter les constats, hypothèses et recommandations.", priority: 4 },
    { title: "Présenter le livrable et archiver la version finale", description: "Conserver la version transmise et les retours du client.", priority: 3 },
  ],
  EXPERTISE_JUDICIAIRE: [
    { title: "Examiner le mandat et les questions confiées", description: "Définir les limites de la mission et les diligences autorisées.", priority: 5 },
    { title: "Établir le programme et les sources nécessaires", description: "Lister les documents, entretiens et calculs requis.", priority: 4 },
    { title: "Réaliser les analyses et conserver les pièces", description: "Relier chaque constat aux éléments probants correspondants.", priority: 5 },
    { title: "Documenter les échanges contradictoires", description: "Conserver les observations reçues et leur traitement.", priority: 4 },
    { title: "Faire réviser et finaliser le rapport", description: "Vérifier que les conclusions répondent au mandat et distinguent faits et opinions.", priority: 5 },
  ],
  AUTRE: [
    { title: "Confirmer le périmètre et le livrable", description: "Consigner les objectifs, exclusions et critères d’achèvement.", priority: 3 },
    { title: "Collecter et référencer les pièces utiles", description: "Identifier les sources reçues et les éléments manquants.", priority: 3 },
    { title: "Réaliser les travaux et faire réviser le résultat", description: "Documenter les travaux, constats et corrections demandées.", priority: 4 },
    { title: "Archiver le livrable final et les validations", description: "Conserver la version approuvée et sa preuve de transmission.", priority: 3 },
  ],
};

export function getMissionTaskTemplate(type: string): MissionTaskTemplate[] {
  return TEMPLATES[type] ?? TEMPLATES.AUTRE;
}
