-- DropForeignKey
ALTER TABLE "NFT" DROP CONSTRAINT "NFT_userId_fkey";

-- AlterTable
ALTER TABLE "NFT" ADD COLUMN     "description" TEXT,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "isCoreDrop" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isMembership" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPartnerDrop" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "partnerSource" TEXT,
ADD COLUMN     "price" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "metadata" JSONB;

-- AddForeignKey
ALTER TABLE "NFT" ADD CONSTRAINT "NFT_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
