import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { clientId, docType } = await req.json();

    if (!clientId || !docType) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const client = await prisma.client.findUnique({
      where: { id: clientId }
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // 1. Simuler le temps de génération PDF (2 secondes)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 2. Mapping du type de document et infos
    let typeDb = "RAPPORT";
    let fileName = `document_${Date.now()}.pdf`;
    let fileUrl = "/mock-document.pdf"; // En production : S3, Blob Storage, etc.

    if (docType === "etats-financiers") {
      fileName = `Etats_Financiers_SYSCOHADA_${new Date().getFullYear()}.pdf`;
      typeDb = "RAPPORT";
    } else if (docType === "declaration-fiscale") {
      fileName = `Declaration_TVA_${new Date().toISOString().substring(0,7)}.pdf`;
      typeDb = "DECLARATION";
    } else if (docType === "plaquette-sante") {
      fileName = `Plaquette_Sante_Financiere.pdf`;
      typeDb = "RAPPORT";
    } else if (docType === "dossier-credit") {
      fileName = `Dossier_Solvabilite_Banque.pdf`;
      typeDb = "AUTRE";
    }

    // 3. Création de l'enregistrement Document dans la DB
    // On l'associe au client pour qu'il apparaisse sur son portail
    
    // Fallback à un admin arbitraire pour "uploadedBy" si besoin, 
    // ou on modifie le schéma pour rendre uploadedById optionnel si généré par système.
    // Le schéma dit : uploadedById String @db.ObjectId (obligatoire).
    // On va chercher le premier User (expert) pour lui attribuer la génération.
    const firstAdmin = await prisma.user.findFirst();
    if (!firstAdmin) {
       return NextResponse.json({ error: "No system user found to attach document generation." }, { status: 500 });
    }

    const document = await prisma.document.create({
      data: {
        fileName,
        originalName: fileName,
        fileSize: 1024500, // ~1MB mock
        mimeType: "application/pdf",
        fileUrl,
        type: typeDb as any,
        status: "PROCESSED",
        clientId: client.id,
        uploadedById: firstAdmin.id
      }
    });

    return NextResponse.json({ success: true, document });

  } catch (error) {
    console.error("[Documents Generate API Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
