-- DropForeignKey
ALTER TABLE "Book" DROP CONSTRAINT "Book_locationId_fkey";

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
