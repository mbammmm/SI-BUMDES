-- AlterTable
ALTER TABLE "archive_documents" ADD COLUMN "retentionDays" INTEGER;
ALTER TABLE "archive_documents" ADD COLUMN "expiryDate" TIMESTAMP(3);

-- Update existing documents with retention period from their category
-- This will be calculated based on documentDate + retentionDays from DocumentCategory
