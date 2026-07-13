import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuthService } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const topic = searchParams.get("topic");

    const posts = await prisma.forumPost.findMany({
      where: topic && topic !== "all" ? { topic } : undefined,
      include: {
        author: { select: { firstName: true, lastName: true, role: true } },
        comments: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      posts: posts.map((p) => ({
        id: p.id,
        title: p.title,
        content: p.content,
        topic: p.topic,
        tags: p.tags,
        author: { name: `${p.author.firstName} ${p.author.lastName}`, role: p.author.role },
        likes: p.likedByIds.length,
        comments: p.comments.length,
        createdAt: p.createdAt,
      })),
    });
  } catch (error) {
    console.error("Erreur GET community/posts:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await AuthService.requireAuth();
    const { title, content, topic, tags } = await req.json();

    if (!title || !content || !topic) {
      return NextResponse.json({ error: "title, content et topic requis" }, { status: 400 });
    }

    const post = await prisma.forumPost.create({
      data: { title, content, topic, tags: Array.isArray(tags) ? tags : [], authorId: session.id },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error: any) {
    if (error?.message === "Non authentifié") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    console.error("Erreur POST community/posts:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
