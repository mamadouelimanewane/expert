import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * Calcule et sauvegarde le score de santé financière d'un client PMI.
 * Le score est basé sur plusieurs facteurs pondérés (0-100).
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const clientId = params.id;

    // 1. Récupérer les données du client
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        tpeJournals: { orderBy: { createdAt: 'desc' }, take: 60 },
        financialData: { orderBy: { year: 'desc' }, take: 1 },
        creditScores: { orderBy: { evaluatedAt: 'desc' }, take: 1 },
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // 2. Calcul des facteurs de score
    const journals = client.tpeJournals;
    const lastFinancial = client.financialData[0];

    // Facteur 1 : Régularité de transmission (40 points)
    // On vérifie combien de semaines des 12 dernières ont eu des entrées
    const regularityScore = Math.min(40, journals.length > 0 ? (journals.length / 30) * 40 : 5);

    // Facteur 2 : Santé de trésorerie (30 points)
    // Ratio Entrées / (Entrées + Sorties)
    const totalEntree = journals.reduce((sum, j) => sum + j.entree, 0);
    const totalSortie = journals.reduce((sum, j) => sum + j.sortie, 0);
    const cashRatio = totalEntree + totalSortie > 0 ? totalEntree / (totalEntree + totalSortie) : 0.5;
    const cashScore = Math.round(cashRatio * 30);

    // Facteur 3 : Croissance (20 points)
    let growthScore = 10; // neutre par défaut
    if (lastFinancial && lastFinancial.ca > 0) {
      growthScore = lastFinancial.ebitda > 0 ? 20 : 8;
    }

    // Facteur 4 : Conformité KYC (10 points)
    const kycScore = client.kycStatus === 'valid' ? 10 : 2;

    // Score total
    const totalScore = Math.round(Math.min(100, regularityScore + cashScore + growthScore + kycScore));

    // 3. Calculer le rating
    const rating = totalScore >= 90 ? 'AAA'
      : totalScore >= 75 ? 'AA'
      : totalScore >= 60 ? 'A'
      : totalScore >= 40 ? 'B'
      : 'C';

    // 4. Persister dans la base de données
    await prisma.creditScore.create({
      data: {
        clientId,
        score: totalScore,
        isEligible: totalScore >= 60,
        factors: {
          regularite: Math.round(regularityScore),
          tresorerie: cashScore,
          croissance: growthScore,
          conformite: kycScore,
          detail: {
            nbEcritures: journals.length,
            totalEntrees: totalEntree,
            totalSorties: totalSortie,
          }
        },
      },
    });

    // 5. Mettre à jour les champs rating et healthScore sur le client
    await prisma.client.update({
      where: { id: clientId },
      data: { healthScore: totalScore, rating },
    });

    return NextResponse.json({ score: totalScore, rating, factors: { regularite: Math.round(regularityScore), tresorerie: cashScore, croissance: growthScore, conformite: kycScore } });

  } catch (error) {
    console.error('Health Score Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const client = await prisma.client.findUnique({
    where: { id: params.id },
    select: { healthScore: true, rating: true },
  });
  return NextResponse.json(client ?? { healthScore: 0, rating: 'C' });
}
