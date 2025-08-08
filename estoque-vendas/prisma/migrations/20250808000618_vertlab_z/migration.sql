/*
  Warnings:

  - You are about to drop the column `estoqueMinimo` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "estoqueMinimo",
ADD COLUMN     "minStock" INTEGER NOT NULL DEFAULT 0;
