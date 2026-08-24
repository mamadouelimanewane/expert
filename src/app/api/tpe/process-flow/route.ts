import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

import { requireStaff } from "@/lib/api-auth";
export async function POST(req: Request) {
    const { denied } = await requireStaff();
    if (denied) return denied;

  try {
    const { clientId, businessName, rawMessage, source } = await req.json();

    if (!clientId || !rawMessage) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Parseur par mots-clés (pas un moteur IA/LLM) du message vocal/texte
    // (ex: "J'ai vendu 50 000 de ciment et j'ai payé 10 000 pour le transport")
    await new Promise(r => setTimeout(r, 1200));

    const text = rawMessage.toLowerCase();
    let type = "INCONNU";
    let montant = 0;
    let compte = "471000";
    let intituleCompte = "Compte d'attente";
    let subCategoryMatched = false;

    if (text.includes("vendu") || text.includes("recette") || text.includes("encaissé")) {
      type = "ENTREE";
      compte = "701000";
      intituleCompte = "Ventes de marchandises";
      subCategoryMatched = true;
      // Extraire le premier nombre
      const match = text.match(/\d+([., ]\d+)?/);
      if (match) montant = parseInt(match[0].replace(/\D/g, ""));
    } else if (text.includes("payé") || text.includes("acheté") || text.includes("dépense")) {
      type = "SORTIE";
      if (text.includes("transport")) {
        compte = "613000";
        intituleCompte = "Frais de transport";
        subCategoryMatched = true;
      } else if (text.includes("marchandise") || text.includes("ciment") || text.includes("stock")) {
        compte = "601000";
        intituleCompte = "Achats de marchandises";
        subCategoryMatched = true;
      } else {
        compte = "605000";
        intituleCompte = "Autres achats";
      }
      const match = text.match(/\d+([., ]\d+)?/);
      if (match) montant = parseInt(match[0].replace(/\D/g, ""));
    }

    // Fallback montant
    const montantExtrait = montant > 0;
    if (montant === 0) montant = 10000;

    // Score de fiabilité dérivé du résultat réel du parseur (le champ confidenceScore
    // était auparavant fixé à 0.92 pour toute entrée, quel que soit le texte reçu) :
    // type reconnu + sous-catégorie identifiée + montant effectivement extrait du texte.
    let confidenceScore = 0.2;
    if (type !== "INCONNU") confidenceScore += 0.35;
    if (subCategoryMatched) confidenceScore += 0.2;
    if (montantExtrait) confidenceScore += 0.25;

    // Création de l'entrée dans TpeJournal
    const journalEntry = await prisma.tpeJournal.create({
      data: {
        clientId,
        businessName: businessName || "TPE Inconnue",
        periode: new Date().toISOString().substring(0, 7), // Ex: "2026-06"
        date: new Date().toISOString().substring(0, 10),
        libelle: `Flux depuis ${source}`,
        entree: type === "ENTREE" ? montant : 0,
        sortie: type === "SORTIE" ? montant : 0,
        source: source || "WHATSAPP",
        rawContent: rawMessage,
        confidenceScore,
        debitCompte: type === "ENTREE" ? "521000" : compte,
        debitIntitule: type === "ENTREE" ? "Banque / Caisse" : intituleCompte,
        creditCompte: type === "ENTREE" ? compte : "521000",
        creditIntitule: type === "ENTREE" ? intituleCompte : "Banque / Caisse",
        montant: montant,
        status: "PENDING"
      }
    });

    return NextResponse.json({ 
      success: true, 
      entry: journalEntry
    });

  } catch (error) {
    console.error("[TPE Process Flow Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
