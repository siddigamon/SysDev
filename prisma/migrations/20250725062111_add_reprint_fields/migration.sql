/*
  Warnings:

  - A unique constraint covering the columns `[isbn]` on the table `Book` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[title,authorId,edition,publisher]` on the table `Book` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "edition" TEXT,
ADD COLUMN     "isbn" TEXT,
ADD COLUMN     "pageCount" INTEGER,
ADD COLUMN     "publisher" TEXT,
ADD COLUMN     "reprintDate" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Book_isbn_key" ON "Book"("isbn");

-- CreateIndex
CREATE UNIQUE INDEX "Book_title_authorId_edition_publisher_key" ON "Book"("title", "authorId", "edition", "publisher");
