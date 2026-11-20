// ─────────────────────────────────────────────────────────────────────────────
// Module Recouvrement de Créances & Injonction de Payer (AUPSRVE)
// Acte Uniforme portant organisation des Procédures Simplifiées de Recouvrement
// et des Voies d'Exécution (Révisé en 2023)
// ─────────────────────────────────────────────────────────────────────────────

export interface PartieProcédure {
  denominationOuNom: string;
  formeJuridique?: string;
  rccmOuNinea?: string;
  adresse: string;
  ville: string;
  pays: string;
  representantLegal?: string;
}

export interface PieceJustificativeIP {
  numero: number;
  description: string;
  referencePiece: string;
  datePiece: string;
  montantPiece?: number;
}

export interface RequeteIPParams {
  juridiction: string; // ex: "Tribunal de Commerce Hors Classe de Dakar"
  ville: string;
  creancier: PartieProcédure;
  debiteur: PartieProcédure;
  creancePrincipale: number;
  tauxInteretLegalAnnuel: number; // ex: 5.5% (Taux BCEAO + majoration légale)
  dateExigibilite: string; // ISO date YYYY-MM-DD
  dateRequete: string; // ISO date YYYY-MM-DD
  fraisPoursuiteEstimes: number; // frais d'huissier et greffe
  natureCreance: string; // ex: "Factures de prestations comptables et fiscales impayées"
  miseEnDemeureDate?: string;
  miseEnDemeureHuissier?: string;
  piecesJustificatives: PieceJustificativeIP[];
}

export interface DelaisProcedurauxIP {
  dateSignification: string;
  delaiOppositionJours: number; // 15 jours (art. 10 AUPSRVE)
  dateLimiteOpposition: string;
  delaiCaduciteMois: number; // 3 mois pour demander l'apposition de la formule exécutoire (art. 16 AUPSRVE)
  dateCaduciteOrdonnance: string;
  voiesRecours: string;
}

export interface RequeteIPResult {
  creancePrincipale: number;
  interetsCalcules: number;
  fraisPoursuiteEstimes: number;
  totalReclame: number;
  nombreJoursRetard: number;
  texteRequete: string;
  projetOrdonnance: string;
  bordereauPieces: string;
  referencesLegales: string[];
}

/**
 * Calcule les délais de procédure stricts suite à la signification d'une ordonnance d'injonction de payer.
 */
export function calculerDelaisProceduraux(dateSignificationStr: string): DelaisProcedurauxIP {
  const dateSignif = new Date(dateSignificationStr);
  if (isNaN(dateSignif.getTime())) {
    throw new Error("Date de signification invalide.");
  }

  // 15 jours francs pour former opposition (art. 10 AUPSRVE)
  const dateOpp = new Date(dateSignif);
  dateOpp.setDate(dateOpp.getDate() + 15);

  // 3 mois pour demander la formule exécutoire sous peine de caducité (art. 16 AUPSRVE)
  const dateCaducite = new Date(dateSignif);
  dateCaducite.setMonth(dateCaducite.getMonth() + 3);

  const formatDate = (d: Date) => d.toISOString().split("T")[0];

  return {
    dateSignification: dateSignificationStr,
    delaiOppositionJours: 15,
    dateLimiteOpposition: formatDate(dateOpp),
    delaiCaduciteMois: 3,
    dateCaduciteOrdonnance: formatDate(dateCaducite),
    voiesRecours:
      "Opposition devant la juridiction dont le Président a rendu l'ordonnance (délai de 15 jours à compter de la signification à personne ou à domicile, majoré des délais de distance conformément à l'art. 11 AUPSRVE).",
  };
}

/**
 * Génère la requête en injonction de payer, le calcul des intérêts moratoires et le projet d'ordonnance.
 */
export function genererRequeteInjonctionPayer(params: RequeteIPParams): RequeteIPResult {
  const dRequete = new Date(params.dateRequete);
  const dExig = new Date(params.dateExigibilite);

  const diffMs = Math.max(0, dRequete.getTime() - dExig.getTime());
  const nombreJoursRetard = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Calcul des intérêts moratoires légaux : (Principal * Taux * Jours) / 36500
  const interetsCalcules = Math.round((params.creancePrincipale * params.tauxInteretLegalAnnuel * nombreJoursRetard) / 36500);
  const totalReclame = params.creancePrincipale + interetsCalcules + params.fraisPoursuiteEstimes;

  const f = (n: number) => n.toLocaleString("fr-FR") + " F CFA";

  const bordereauPieces = params.piecesJustificatives
    .map((p) => `  Pièce n°${p.numero} : ${p.description} (Réf. ${p.referencePiece} du ${p.datePiece}${p.montantPiece ? ` - Montant: ${f(p.montantPiece)}` : ""})`)
    .join("\n");

  const texteRequete = `À MONSIEUR LE PRÉSIDENT DU ${params.juridiction.toUpperCase()}
SIÉGEANT EN MATIÈRE D'INJONCTION DE PAYER

REQUÊTE AUX FINS D'INJONCTION DE PAYER
(Articles 1 à 18 de l'Acte Uniforme OHADA portant organisation des Procédures Simplifiées de Recouvrement et des Voies d'Exécution - AUPSRVE)

A L'HONNEUR DE VOUS EXPOSER :

POUR LE REQUÉRANT (LE CRÉANCIER) :
La société ${params.creancier.denominationOuNom}${params.creancier.formeJuridique ? `, ${params.creancier.formeJuridique}` : ""},
Immatriculée au RCCM sous le numéro ${params.creancier.rccmOuNinea || "En cours"},
Ayant son siège social à ${params.creancier.adresse}, ${params.creancier.ville} (${params.creancier.pays}),
Agissant poursuites et diligences de son représentant légal, ${params.creancier.representantLegal || "Monsieur le Directeur Général"}.

CONTRE LE DÉBITEUR :
La société ${params.debiteur.denominationOuNom}${params.debiteur.formeJuridique ? `, ${params.debiteur.formeJuridique}` : ""},
Immatriculée au RCCM sous le n° ${params.debiteur.rccmOuNinea || "Non renseigné"},
Demeurant ou ayant son siège social à ${params.debiteur.adresse}, ${params.debiteur.ville} (${params.debiteur.pays}).

I. LES FAITS ET LA CAUSE DE LA CRÉANCE
Que le Requérant est créancier du Débiteur au titre de : ${params.natureCreance}.
Que cette créance résulte d'engagements contractuels clairs et de pièces justificatives annexées à la présente.
Que la créance est certaine, liquide et exigible depuis le ${params.dateExigibilite}, conformément à l'article 2 de l'AUPSRVE.
${params.miseEnDemeureDate ? `Que le Débiteur a été mis en demeure de payer par acte du ${params.miseEnDemeureDate}${params.miseEnDemeureHuissier ? ` par ministère de ${params.miseEnDemeureHuissier}` : ""}, resté sans effet.` : ""}

II. LE MONTANT DE LA CRÉANCE (AUPSRVE art. 4)
- Montant principal de la créance : ${f(params.creancePrincipale)}
- Intérêts légaux moratoires au taux de ${params.tauxInteretLegalAnnuel}% (${nombreJoursRetard} jours de retard) : ${f(interetsCalcules)}
- Frais et débours de poursuite prévisibles : ${f(params.fraisPoursuiteEstimes)}
TOTAL RÉCLAMÉ : ${f(totalReclame)}

PAR CES MOTIFS :
Vu les articles 1, 2, 4 et suivants de l'Acte Uniforme OHADA sur le Recouvrement (AUPSRVE) ;
Vu les pièces probantes jointes au présent bordereau ;

PLAISE À MONSIEUR LE PRÉSIDENT :
- ENJOINDRE à la société ${params.debiteur.denominationOuNom} de payer au Requérant la somme totale de ${f(totalReclame)} en principal, intérêts moratoires et frais de poursuite.
- DIRE que la présente ordonnance sera signifiée par voie d'huissier de justice conformément aux articles 7 et 8 de l'AUPSRVE.

BORDEREAU DES PIÈCES COMMUNIQUÉES :
${bordereauPieces}

Fait à ${params.ville}, le ${params.dateRequete}
Pour le Requérant, son Conseil ou Mandataire dûment habilité.`;

  const projetOrdonnance = `RÉPUBLIQUE DU ${params.creancier.pays.toUpperCase()}
${params.juridiction.toUpperCase()}

ORDONNANCE D'INJONCTION DE PAYER N° _______ / ${dRequete.getFullYear()}

Nous, Président du ${params.juridiction},
Vu la requête qui précède présentée par ${params.creancier.denominationOuNom} ;
Vu les pièces produites à l'appui ;
Vu les articles 1 à 18 de l'Acte Uniforme OHADA portant organisation des Procédures Simplifiées de Recouvrement et des Voies d'Exécution ;

Attendu que la créance paraît fondée en son principe, certaine, liquide et exigible ;

ENJOIGNONS à la société ${params.debiteur.denominationOuNom} de payer entre les mains de ${params.creancier.denominationOuNom} :
- Principal : ${f(params.creancePrincipale)}
- Intérêts moratoires : ${f(interetsCalcules)}
- Frais de greffe et poursuite : ${f(params.fraisPoursuiteEstimes)}
TOTAL DÛ : ${f(totalReclame)}

RAPPELONS que le débiteur peut former opposition à la présente ordonnance dans un délai de 15 jours à compter de sa signification (art. 10 AUPSRVE).

Fait en notre cabinet, le ______________________
Le Greffier                                      Le Président`;

  return {
    creancePrincipale: params.creancePrincipale,
    interetsCalcules,
    fraisPoursuiteEstimes: params.fraisPoursuiteEstimes,
    totalReclame,
    nombreJoursRetard,
    texteRequete,
    projetOrdonnance,
    bordereauPieces,
    referencesLegales: [
      "AUPSRVE art. 1 & 2 : Conditions de certitude, liquidité et exigibilité de la créance",
      "AUPSRVE art. 4 : Mentions obligatoires de la requête d'injonction de payer",
      "AUPSRVE art. 10 : Délai d'opposition de 15 jours à compter de la signification",
      "AUPSRVE art. 16 : Caducité de l'ordonnance en l'absence de demande d'apposition de formule exécutoire sous 3 mois",
    ],
  };
}
