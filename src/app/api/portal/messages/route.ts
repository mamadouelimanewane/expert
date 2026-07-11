import { NextResponse } from "next/server";
import { getPortalClient } from "@/lib/portal-auth";

export async function GET(req: Request) {
  const client = await getPortalClient(req);
  if (!client) {
    return NextResponse.json({ error: "Portail introuvable ou désactivé" }, { status: 401 });
  }

  const data = {
    threads: [
      { id: "t1", title: "Questions sur la TVA de Mai", lastMessage: "Merci pour ces précisions.", date: "10:45", unread: 0 },
      { id: "t2", title: "Documents pour Bilan 2025", lastMessage: "Veuillez trouver ci-joint les extraits bancaires.", date: "Hier", unread: 2 },
      { id: "t3", title: "Avenant contrat de travail", lastMessage: "Le document est prêt pour signature.", date: "Lun", unread: 0 }
    ],
    messages: [
      { id: 1, threadId: "t1", sender: "expert", text: "Bonjour, j'ai bien reçu les factures d'achat. Il manque cependant la facture Sonatel.", time: "09:30" },
      { id: 2, threadId: "t1", sender: "client", text: "Bonjour, je vous l'envoie tout de suite.", time: "10:15" },
      { id: 3, threadId: "t1", sender: "expert", text: "Bien reçu. La TVA déductible s'élève à 450,000 F.", time: "10:30" },
      { id: 4, threadId: "t1", sender: "client", text: "Merci pour ces précisions.", time: "10:45" }
    ],
    documentsToApprove: [
      { id: "d1", name: "Bilan 2025 - Projet V1.pdf", type: "État Financier", size: "2.4 MB" },
      { id: "d2", name: "Déclaration TVA - Mai.pdf", type: "Fiscal", size: "1.1 MB" }
    ]
  };
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const client = await getPortalClient(req);
  if (!client) {
    return NextResponse.json({ error: "Portail introuvable ou désactivé" }, { status: 401 });
  }

  const body = await req.json();
  return NextResponse.json({
    success: true,
    message: {
      id: Date.now(),
      threadId: body.threadId,
      sender: "client",
      text: body.text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  });
}
