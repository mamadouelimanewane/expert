import { NextResponse } from "next/server";
import { AuthService } from "@/lib/auth";
import { syncInbox } from "@/lib/email-sync";

export async function POST() {
  try {
    await AuthService.requireAuth();
    const result = await syncInbox();
    return NextResponse.json(result);
  } catch (error: any) {
    if (error?.message === "Non authentifié") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    console.error("[API emails/sync] Error:", error);
    const message = error instanceof Error ? error.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
