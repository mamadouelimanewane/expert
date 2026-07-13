import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Le dépôt électronique réel nécessite une intégration avec le portail de la DGI (ou équivalent
// selon le pays OHADA), qui n'existe pas encore. Ce endpoint ne doit JAMAIS générer de fausse
// quittance : une déclaration fiscale non déposée présentée comme déposée exposerait le client
// à des pénalités réelles pour dépôt tardif/non-dépôt.
export async function POST(req: Request) {
  const body = await req.json();
  const { declarationId } = body;

  if (!declarationId) {
    return NextResponse.json({ success: false, error: "declarationId required" }, { status: 400 });
  }

  const declaration = await prisma.taxDeclaration.findUnique({ where: { id: declarationId } });
  if (!declaration) {
    return NextResponse.json({ success: false, error: "Déclaration introuvable" }, { status: 404 });
  }

  return NextResponse.json({
    success: false,
    error: "Le e-dépôt automatique n'est pas encore connecté au portail de la DGI. Déposez cette déclaration manuellement sur le portail officiel, puis enregistrez la référence de quittance obtenue.",
    notConfigured: true,
  }, { status: 503 });
}
