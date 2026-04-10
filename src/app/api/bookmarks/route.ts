import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tag = request.nextUrl.searchParams.get("tag");

  const bookmarks = await prisma.bookmark.findMany({
    where: {
      userId,
      ...(tag ? { tags: { has: tag } } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(bookmarks);
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
      userId,
      url,
      title,
      tags: tags || [],
    },
  });

  return NextResponse.json(bookmark, { status: 201 });
}
