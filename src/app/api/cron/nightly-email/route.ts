import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    include: {
      bookmarks: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  let sent = 0;
  for (const user of users) {
    if (user.bookmarks.length === 0) continue;

    const bookmarkList = user.bookmarks
      .map((b) => {
        const tags = b.tags.length > 0 ? ` [${b.tags.join(", ")}]` : "";
        return `- ${b.title}: ${b.url}${tags}`;
      })
      .join("\n");

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Bookmark Manager <bookmarks@resend.dev>",
      to: user.email,
      subject: "Your Daily Bookmarks",
      text: `Hi${user.name ? ` ${user.name}` : ""},\n\nHere are your saved bookmarks:\n\n${bookmarkList}\n\nHappy browsing!`,
    });
    sent++;
  }

  return NextResponse.json({ sent });
}
