import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string } | undefined)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Réservé aux administrateurs." }, { status: 403 });
  }

  return NextResponse.json(
    {
      error:
        "Le compte de démonstration partagé est désactivé jusqu'à la création d'un environnement isolé et en lecture seule.",
    },
    { status: 503 }
  );
}
