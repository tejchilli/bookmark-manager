import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const tag = request.nextUrl.searchParams.get("tag");

  const bookmarks = await prisma.bookmark.findMany({
    where: tag ? { tags: { has: tag } } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(bookmarks);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { url, title, tags } = body;

  if (!url || !title) {
    return NextResponse.json(
      { error: "URL and title are required" },
      { status: 400 }
    );
  }

  const bookmark = await prisma.bookmark.create({
    data: {
      url,
      title,
      tags: tags || [],
    },
  });

  return NextResponse.json(bookmark, { status: 201 });
}
