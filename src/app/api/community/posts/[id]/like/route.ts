import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuthService } from "@/lib/auth";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await AuthService.requireAuth();
    const { id } = await context.params;

    const post = await prisma.forumPost.findUnique({ where: { id }, select: { likedByIds: true } });
    if (!post) return NextResponse.json({ error: "Publication introuvable" }, { status: 404 });

    const alreadyLiked = post.likedByIds.includes(session.id);
    const updated = await prisma.forumPost.update({
      where: { id },
      data: {
        likedByIds: alreadyLiked
          ? post.likedByIds.filter((uid) => uid !== session.id)
          : [...post.likedByIds, session.id],
      },
      select: { likedByIds: true },
    });

    return NextResponse.json({ likes: updated.likedByIds.length, liked: !alreadyLiked });
  } catch (error: any) {
    if (error?.message === "Non authentifié") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    console.error("Erreur POST community/posts/like:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
