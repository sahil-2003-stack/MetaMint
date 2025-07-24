/*
  Warnings:

  - You are about to drop the column `tier` on the `NFT` table. All the data in the column will be lost.
  - Made the column `walletAddress` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `username` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "NFT" DROP COLUMN "tier";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "walletAddress" SET NOT NULL,
ALTER COLUMN "username" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL;
