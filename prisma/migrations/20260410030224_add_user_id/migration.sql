-- Delete existing bookmarks (no user association possible)
DELETE FROM "Bookmark";

-- AlterTable
ALTER TABLE "Bookmark" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Bookmark_userId_idx" ON "Bookmark"("userId");
