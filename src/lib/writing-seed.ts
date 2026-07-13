import prisma from "./prisma";

// Modèles de rédaction génériques réels (trames juridiques/administratives
// standard, conformes aux usages OHADA) — contenu de référence réutilisable
// avec des champs à compléter entre crochets [AINSI], pas des données
// fictives d'activité du cabinet.
const STARTER_TEMPLATES: Array<{ title: string; category: string; content: string }> = [
  {
    title: "PV d'Assemblée Générale Ordinaire (approbation des comptes)",
    category: "PV",
    content: `PROCÈS-VERBAL DE L'ASSEMBLÉE GÉNÉRALE ORDINAIRE DU [DATE]

Dénomination sociale : [SOCIETE]
Forme juridique : [FORME_JURIDIQUE]
Siège social : [SIEGE_SOCIAL]
Capital social : [CAPITAL] FCFA
RCCM : [RCCM]

L'an [ANNEE], le [DATE], à [HEURE], les associés/actionnaires de la société susvisée se sont réunis en Assemblée Générale Ordinaire, au siège social, sur convocation régulière, à l'effet de délibérer sur l'ordre du jour suivant :

ORDRE DU JOUR
1. Lecture du rapport de gestion de la gérance/du conseil d'administration sur l'exercice clos le [DATE_CLOTURE] ;
2. Lecture du rapport du Commissaire aux comptes, le cas échéant ;
3. Approbation des comptes annuels (bilan, compte de résultat et annexes) ;
4. Affectation du résultat de l'exercice ;
5. Quitus aux organes de gestion ;
6. Questions diverses.

BUREAU
La séance est présidée par [PRESIDENT]. [SECRETAIRE] est désigné(e) secrétaire de séance.

Le Président rappelle que les convocations ont été adressées régulièrement conformément aux statuts et aux dispositions de l'Acte uniforme OHADA relatif au droit des sociétés commerciales et du groupement d'intérêt économique (AUSCGIE). Il est constaté que le quorum requis est atteint et que l'Assemblée peut valablement délibérer.

RÉSOLUTIONS

Première résolution (Approbation des comptes)
L'Assemblée Générale, après avoir entendu la lecture du rapport de gestion, approuve dans toutes leurs parties les comptes annuels de l'exercice clos le [DATE_CLOTURE], tels qu'ils lui ont été présentés, ainsi que les opérations traduites dans ces comptes.
Cette résolution est adoptée à [MAJORITE].

Deuxième résolution (Affectation du résultat)
L'Assemblée Générale décide d'affecter le résultat de l'exercice, soit [MONTANT_RESULTAT] FCFA, de la manière suivante : [AFFECTATION_RESULTAT].
Cette résolution est adoptée à [MAJORITE].

Troisième résolution (Quitus)
L'Assemblée Générale donne quitus entier et sans réserve à [DIRIGEANT] pour sa gestion au titre de l'exercice écoulé.
Cette résolution est adoptée à [MAJORITE].

Quatrième résolution (Pouvoirs)
L'Assemblée Générale confère tous pouvoirs au porteur d'un original, d'une copie ou d'un extrait du présent procès-verbal pour effectuer toutes formalités légales de publicité et de dépôt requises.
Cette résolution est adoptée à [MAJORITE].

Plus rien n'étant à l'ordre du jour, la séance est levée à [HEURE_FIN].

Le Président                                                    Le Secrétaire de séance
[NOM_PRESIDENT]                                                  [NOM_SECRETAIRE]`,
  },
  {
    title: "Convocation à l'Assemblée Générale Ordinaire",
    category: "Convocation",
    content: `[SOCIETE]
[FORME_JURIDIQUE] au capital de [CAPITAL] FCFA
Siège social : [SIEGE_SOCIAL]
RCCM : [RCCM]

CONVOCATION À L'ASSEMBLÉE GÉNÉRALE ORDINAIRE

[VILLE], le [DATE]

Madame, Monsieur,

Vous êtes prié(e) d'assister à l'Assemblée Générale Ordinaire de la société [SOCIETE], qui se tiendra le [DATE_AG] à [HEURE_AG], au siège social sis à [SIEGE_SOCIAL] (ou par visioconférence via [LIEN_VISIO], le cas échéant), à l'effet de délibérer sur l'ordre du jour suivant :

1. Rapport de gestion de la gérance/du conseil d'administration sur l'exercice clos le [DATE_CLOTURE] ;
2. Rapport du Commissaire aux comptes, le cas échéant ;
3. Approbation des comptes annuels et affectation du résultat ;
4. Quitus aux organes de gestion ;
5. Questions diverses.

Conformément aux statuts et aux dispositions de l'Acte uniforme OHADA relatif au droit des sociétés commerciales et du groupement d'intérêt économique, les documents afférents à cette assemblée sont tenus à votre disposition au siège social à compter du [DATE_MISE_A_DISPO].

Veuillez agréer, Madame, Monsieur, l'expression de nos salutations distinguées.

[SIGNATAIRE]
[FONCTION]`,
  },
  {
    title: "Mise en demeure de payer",
    category: "Courrier",
    content: `[EXPEDITEUR]
[ADRESSE_EXPEDITEUR]

À l'attention de : [DESTINATAIRE]
[ADRESSE_DESTINATAIRE]

Lettre recommandée avec accusé de réception

Objet : Mise en demeure de payer

[VILLE], le [DATE]

Madame, Monsieur,

Malgré nos relances des [DATE_RELANCE_1] et [DATE_RELANCE_2] restées sans effet, nous constatons que la facture n° [NUMERO_FACTURE] d'un montant de [MONTANT] FCFA, échue depuis le [DATE_ECHEANCE], demeure à ce jour impayée.

Par la présente, nous vous mettons en demeure de régler l'intégralité de cette somme, soit [MONTANT] FCFA, dans un délai de huit (8) jours à compter de la réception du présent courrier.

À défaut de règlement dans ce délai, nous nous verrons contraints, sans autre avis, d'engager toute procédure de recouvrement, y compris judiciaire, à votre encontre, conformément aux dispositions de l'Acte uniforme OHADA portant organisation des procédures simplifiées de recouvrement et des voies d'exécution, ce qui entraînera des frais et pénalités supplémentaires à votre charge.

Nous restons naturellement à votre disposition pour convenir, avant l'expiration de ce délai, d'un règlement amiable de ce dossier.

Veuillez agréer, Madame, Monsieur, l'expression de nos salutations distinguées.

[SIGNATAIRE]
[FONCTION]`,
  },
  {
    title: "Courrier de relance amiable (avant contentieux)",
    category: "Courrier",
    content: `[EXPEDITEUR]
[ADRESSE_EXPEDITEUR]

À l'attention de : [DESTINATAIRE]

Objet : Relance de paiement — Facture n° [NUMERO_FACTURE]

[VILLE], le [DATE]

Madame, Monsieur,

Sauf erreur ou omission de notre part, nous constatons que la facture n° [NUMERO_FACTURE] d'un montant de [MONTANT] FCFA, émise le [DATE_FACTURE] et échue le [DATE_ECHEANCE], n'a pas encore été réglée à ce jour.

Nous vous serions reconnaissants de bien vouloir procéder à son règlement dans les meilleurs délais, ou de nous contacter si ce paiement a déjà été effectué, afin que nous puissions rapprocher les éléments.

Dans l'hypothèse où ce courrier croiserait votre règlement, nous vous prions de ne pas tenir compte de la présente relance.

Nous vous remercions de votre compréhension et restons à votre disposition pour tout renseignement complémentaire.

Veuillez agréer, Madame, Monsieur, l'expression de nos salutations distinguées.

[SIGNATAIRE]
[FONCTION]`,
  },
];

export async function ensureWritingTemplatesSeed() {
  const count = await prisma.writingTemplate.count();
  if (count > 0) return;

  for (const t of STARTER_TEMPLATES) {
    await prisma.writingTemplate.create({ data: t });
  }
}
