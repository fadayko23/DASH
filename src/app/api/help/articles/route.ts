import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  if (slug) {
    const article = await prisma.helpArticle.findFirst({
      where: { slug },
    });
    if (!article) return new NextResponse("Article not found", { status: 404 });
    return NextResponse.json(article);
  }

  const articles = await prisma.helpArticle.findMany({
    orderBy: { title: "asc" },
  });

  return NextResponse.json(articles);
}
