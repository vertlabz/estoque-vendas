-- AlterTable
ALTER TABLE "Sale" ADD COLUMN "offlineId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Sale_offlineId_key" ON "Sale"("offlineId");
