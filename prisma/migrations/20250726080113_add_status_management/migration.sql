-- CreateEnum
CREATE TYPE "BookStatus" AS ENUM ('AVAILABLE', 'CHECKED_OUT', 'LOST', 'DAMAGED', 'RETIRED', 'IN_REPAIR', 'STORAGE');

-- CreateEnum
CREATE TYPE "LocationStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "status" "BookStatus" NOT NULL DEFAULT 'AVAILABLE',
ADD COLUMN     "statusDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "statusReason" TEXT;

-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "status" "LocationStatus" NOT NULL DEFAULT 'ACTIVE';
