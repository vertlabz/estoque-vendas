/*
  Warnings:

  - You are about to drop the column `minStock` on the `Product` table. All the data in the column will be lost.
  - Added the required column `metodoPagamento` to the `Sale` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "minStock";

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "metodoPagamento" TEXT NOT NULL;
