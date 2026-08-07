-- CreateTable
CREATE TABLE "reconciliations" (
    "id" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "bankBalance" DECIMAL(15, 2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "reconciliation_items" (
    "id" TEXT NOT NULL,
    "reconciliationId" TEXT,
    "transactionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'unmatched',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "reconciliations_pkey" ON "reconciliations"("id");

-- CreateIndex
CREATE UNIQUE INDEX "reconciliation_items_pkey" ON "reconciliation_items"("id");

-- AddForeignKey (after both tables exist)
ALTER TABLE "reconciliation_items" ADD CONSTRAINT "reconciliation_items_reconciliationId_fkey" FOREIGN KEY ("reconciliationId") REFERENCES "reconciliations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "reconciliation_items" ADD CONSTRAINT "reconciliation_items_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- Add relation column to users table
-- (Prisma handles relation counters via metadata, no schema change needed here)
