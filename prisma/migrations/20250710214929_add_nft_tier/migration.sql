/*
  Warnings:

  - Added the required column `tier` to the `NFT` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "NFT" ADD COLUMN     "tier" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "walletAddress" DROP NOT NULL,
ALTER COLUMN "username" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL;
