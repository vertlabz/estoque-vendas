-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "estoqueMinimo" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Comanda" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'aberta',

    CONSTRAINT "Comanda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComandaItem" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "comandaId" INTEGER NOT NULL,

    CONSTRAINT "ComandaItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ComandaItem" ADD CONSTRAINT "ComandaItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComandaItem" ADD CONSTRAINT "ComandaItem_comandaId_fkey" FOREIGN KEY ("comandaId") REFERENCES "Comanda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
