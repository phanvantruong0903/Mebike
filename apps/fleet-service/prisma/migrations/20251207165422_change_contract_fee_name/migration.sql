/*
  Warnings:

  - You are about to drop the column `contractFee` on the `suppliers` table. All the data in the column will be lost.
  - Added the required column `contactFee` to the `suppliers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "suppliers" DROP COLUMN "contractFee",
ADD COLUMN     "contactFee" DECIMAL(8,4) NOT NULL;
