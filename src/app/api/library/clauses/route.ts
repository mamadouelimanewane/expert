import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

import { requireStaff } from "@/lib/api-auth";
// Bibliothèque de clauses types de démarrage (contenu de référence réel, conforme aux
// Actes Uniformes OHADA — pas des données client fabriquées). Insérée une seule fois
// si la collection est vide, pour que l'outil soit utilisable dès l'installation.
const SEED_CLAUSES = [
  {
    title: "Clause de non-concurrence - Associé sortant",
    category: "societes",
    subcategory: "Statuts SARL",
    content: `L'associé sortant s'engage, pendant une durée de [DURÉE] ans à compter de la cessation de ses fonctions, à ne pas exercer directement ou indirectement une activité concurrente à celle de la société dans un rayon de [RAYON] kilomètres.

Cette interdiction s'applique tant à titre personnel qu'en qualité d'associé, gérant, salarié ou consultant d'une entreprise concurrente.

En cas de violation, l'associé sortant sera redevable d'une indemnité forfaitaire de [MONTANT] FCFA, sans préjudice de tous dommages-intérêts complémentaires.`,
    annotations: [
      "La durée doit être raisonnable (généralement 2-3 ans max)",
      "Le périmètre géographique doit être proportionné à l'activité",
      "Prévoir une contrepartie financière si l'associé est également salarié",
    ],
    negotiationTips: [
      "Négocier une réduction de durée contre une indemnité plus élevée",
      "Prévoir des exceptions pour certains secteurs d'activité",
      "Définir précisément ce qui constitue une activité 'concurrente'",
    ],
    acteUniforme: "AUSCGIE Art. 853",
  },
  {
    title: "Clause d'agrément - Cession de parts sociales",
    category: "societes",
    subcategory: "Statuts SARL",
    content: `Les parts sociales sont librement cessibles entre associés.

Toute cession de parts à un tiers, à quelque titre que ce soit, est soumise à l'agrément préalable de la collectivité des associés statuant à la majorité des associés représentant au moins [QUORUM] du capital social.

Le projet de cession doit être notifié à la société et à chacun des associés par acte extrajudiciaire ou par lettre recommandée avec avis de réception. Dans un délai de [DÉLAI] mois à compter de cette notification, la société doit faire connaître sa décision.

À défaut de réponse dans ce délai, l'agrément est réputé acquis.`,
    annotations: [
      "Le quorum légal minimum est de 3/4 (AUSCGIE Art. 319)",
      "Le délai de réponse ne peut excéder 3 mois",
      "En cas de refus, les associés ont 3 mois pour racheter les parts",
    ],
    negotiationTips: [
      "Prévoir des cas d'agrément automatique (succession, donation au conjoint)",
      "Définir le prix de rachat en cas de refus d'agrément",
      "Ajouter une clause de sortie forcée en cas de blocage",
    ],
    acteUniforme: "AUSCGIE Art. 318-320",
  },
  {
    title: "Clause de garantie d'actif et de passif",
    category: "contrats",
    subcategory: "Cession de fonds/actions",
    content: `Le Cédant garantit le Cessionnaire contre toute diminution de l'actif net de la société cible résultant:
- De l'inexactitude des déclarations figurant à l'Annexe [X];
- De tout passif non comptabilisé ou insuffisamment provisionné à la date de cession;
- De tout redressement fiscal ou social portant sur la période antérieure à la cession.

Cette garantie est plafonnée à [MONTANT] FCFA et soumise à une franchise de [FRANCHISE] FCFA par réclamation.

La durée de la garantie est de:
- [DURÉE_FISCALE] ans pour les risques fiscaux et sociaux;
- [DURÉE_GENERALE] ans pour les autres risques.`,
    annotations: [
      "Le plafond de garantie représente généralement 20-50% du prix",
      "Prévoir un mécanisme de séquestre ou caution bancaire",
      "Distinguer les garanties de conformité et les garanties de passif",
    ],
    negotiationTips: [
      "Négocier un mécanisme de révision de prix plutôt qu'une indemnisation",
      "Prévoir des exceptions pour les risques connus de l'acquéreur",
      "Définir précisément les modalités de notification des réclamations",
    ],
    acteUniforme: "AUDCG Art. 234",
  },
  {
    title: "Clause pénale - Retard de livraison",
    category: "contrats",
    subcategory: "Contrat commercial",
    content: `En cas de retard de livraison imputable au Fournisseur, celui-ci sera redevable de pénalités de retard calculées comme suit:
- [TAUX_1]% du prix de la commande par jour de retard pendant les [JOURS_1] premiers jours;
- [TAUX_2]% du prix de la commande par jour de retard au-delà.

Ces pénalités sont plafonnées à [PLAFOND]% du prix total de la commande.

Au-delà de [DÉLAI_RÉSOLUTION] jours de retard, le Client pourra résoudre le contrat de plein droit, sans mise en demeure préalable, par simple notification écrite.`,
    annotations: [
      "Les pénalités doivent rester proportionnées au préjudice estimé",
      "Le juge peut modérer les clauses pénales manifestement excessives",
      "Distinguer retard et inexécution totale",
    ],
    negotiationTips: [
      "Prévoir des cas d'exonération (force majeure, fait du client)",
      "Négocier un plafond global de responsabilité",
      "Ajouter un délai de grâce avant application des pénalités",
    ],
    acteUniforme: "AUDCG Art. 294",
  },
];

export async function GET() {
    const { denied } = await requireStaff();
    if (denied) return denied;

  try {
    let clauses = await prisma.legalClause.findMany({ orderBy: { title: "asc" } });

    if (clauses.length === 0) {
      await prisma.legalClause.createMany({ data: SEED_CLAUSES });
      clauses = await prisma.legalClause.findMany({ orderBy: { title: "asc" } });
    }

    return NextResponse.json({ clauses });
  } catch (error) {
    console.error("Erreur GET clauses:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
    const { denied } = await requireStaff();
    if (denied) return denied;

  try {
    const body = await req.json();
    const { title, category, subcategory, content, acteUniforme } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Titre et contenu requis" }, { status: 400 });
    }

    const clause = await prisma.legalClause.create({
      data: {
        title,
        category: category || "contrats",
        subcategory,
        content,
        acteUniforme,
        annotations: [],
        negotiationTips: [],
      },
    });

    return NextResponse.json({ clause }, { status: 201 });
  } catch (error) {
    console.error("Erreur POST clauses:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
    const { denied } = await requireStaff();
    if (denied) return denied;

  try {
    const body = await req.json();
    const { id, toggleFavorite, incrementUsage } = body;

    if (!id) {
      return NextResponse.json({ error: "id requis" }, { status: 400 });
    }

    const current = await prisma.legalClause.findUnique({ where: { id } });
    if (!current) {
      return NextResponse.json({ error: "Clause introuvable" }, { status: 404 });
    }

    const clause = await prisma.legalClause.update({
      where: { id },
      data: {
        ...(toggleFavorite && { isFavorite: !current.isFavorite }),
        ...(incrementUsage && { usageCount: current.usageCount + 1, lastUsed: new Date() }),
      },
    });

    return NextResponse.json({ clause });
  } catch (error) {
    console.error("Erreur PATCH clauses:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
