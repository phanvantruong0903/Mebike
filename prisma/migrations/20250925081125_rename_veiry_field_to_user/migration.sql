/*
  Warnings:

  - You are about to drop the column `verift` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "verift",
ADD COLUMN     "verify" INTEGER NOT NULL DEFAULT 0;
