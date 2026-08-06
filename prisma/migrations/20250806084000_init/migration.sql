-- Prisma migration for SI-BUMDes
-- Initial migration: create all tables from schema

-- ============================================
-- 1. roles
-- ============================================
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "permissions" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- ============================================
-- 2. bumdes_profile
-- ============================================
CREATE TABLE "bumdes_profile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "nib" TEXT,
    "registrationNumber" TEXT,
    "logoPath" TEXT,
    "letterheadPath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bumdes_profile_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- 3. unit_usaha
-- ============================================
CREATE TABLE "unit_usaha" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "headId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "initialCapital" NUMERIC(15, 2) NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unit_usaha_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- 4. chart_of_accounts
-- ============================================
CREATE TABLE "chart_of_accounts" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "parentId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chart_of_accounts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "chart_of_accounts_code_key" ON "chart_of_accounts"("code");

-- ============================================
-- 5. users
-- ============================================
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- ============================================
-- 6. document_categories
-- ============================================
CREATE TABLE "document_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "retentionDays" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_categories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "document_categories_name_key" ON "document_categories"("name");

-- ============================================
-- 7. journal_entries
-- ============================================
CREATE TABLE "journal_entries" (
    "id" TEXT NOT NULL,
    "entryDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "reference" TEXT,
    "isPosted" BOOLEAN NOT NULL DEFAULT false,
    "postedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- 8. journal_lines
-- ============================================
CREATE TABLE "journal_lines" (
    "id" TEXT NOT NULL,
    "journalEntryId" TEXT NOT NULL,
    "accountCode" TEXT NOT NULL,
    "debit" NUMERIC(15, 2) NOT NULL DEFAULT 0,
    "credit" NUMERIC(15, 2) NOT NULL DEFAULT 0,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "journal_lines_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- 9. letter_templates
-- ============================================
CREATE TABLE "letter_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "numberingFormat" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "letter_templates_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- 10. letters
-- ============================================
CREATE TABLE "letters" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "content" TEXT,
    "outgoingDate" TIMESTAMP(3),
    "incomingDate" TIMESTAMP(3),
    "sender" TEXT,
    "recipient" TEXT,
    "pdfPath" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "letters_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "letters_number_key" ON "letters"("number");

-- ============================================
-- 11. approval_steps
-- ============================================
CREATE TABLE "approval_steps" (
    "id" TEXT NOT NULL,
    "letterId" TEXT NOT NULL,
    "stepOrder" INTEGER NOT NULL,
    "approverId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "approval_steps_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- 12. archive_documents
-- ============================================
CREATE TABLE "archive_documents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "documentDate" TIMESTAMP(3) NOT NULL,
    "tags" TEXT[],
    "filePath" TEXT NOT NULL,
    "relatedLetterId" TEXT,
    "relatedTransactionId" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "archive_documents_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- 13. transactions
-- ============================================
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "transactionDate" TIMESTAMP(3) NOT NULL,
    "unitUsahaId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" NUMERIC(15, 2) NOT NULL,
    "accountCode" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "proofPath" TEXT,
    "isPosted" BOOLEAN NOT NULL DEFAULT false,
    "postedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- 14. assets
-- ============================================
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "acquisitionDate" TIMESTAMP(3) NOT NULL,
    "acquisitionValue" NUMERIC(15, 2) NOT NULL,
    "usefulLife" INTEGER NOT NULL,
    "salvageValue" NUMERIC(15, 2),
    "unitUsahaId" TEXT NOT NULL,
    "condition" TEXT NOT NULL DEFAULT 'baik',
    "photoPath" TEXT,
    "qrCodePath" TEXT,
    "status" TEXT NOT NULL DEFAULT 'aktif',
    "currentValue" NUMERIC(15, 2),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- 15. asset_mutations
-- ============================================
CREATE TABLE "asset_mutations" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "fromValue" TEXT,
    "toValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "asset_mutations_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- 16. asset_depreciation_schedules
-- ============================================
CREATE TABLE "asset_depreciation_schedules" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "amount" NUMERIC(15, 2) NOT NULL,
    "isAccrued" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asset_depreciation_schedules_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- 17. notifications
-- ============================================
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- 18. audit_logs
-- ============================================
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "changes" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- 19. sync_queue
-- ============================================
CREATE TABLE "sync_queue" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "sync_queue_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- Foreign Key Constraints
-- ============================================

-- users.roleId -> roles.id (Restrict)
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE Restrict ON UPDATE NO ACTION;

-- journal_lines.journalEntryId -> journal_entries.id (Cascade)
ALTER TABLE "journal_lines" ADD CONSTRAINT "journal_lines_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "journal_entries"("id") ON DELETE Cascade ON UPDATE NO ACTION;

-- transactions.createdById -> users.id (Restrict)
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE Restrict ON UPDATE NO ACTION;

-- assets.createdById -> users.id (Restrict)
ALTER TABLE "assets" ADD CONSTRAINT "assets_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE Restrict ON UPDATE NO ACTION;

-- asset_mutations.assetId -> assets.id (Cascade)
ALTER TABLE "asset_mutations" ADD CONSTRAINT "asset_mutations_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE Cascade ON UPDATE NO ACTION;

-- asset_depreciation_schedules.assetId -> assets.id (Cascade)
ALTER TABLE "asset_depreciation_schedules" ADD CONSTRAINT "asset_depreciation_schedules_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE Cascade ON UPDATE NO ACTION;

-- letters.createdById -> users.id (Restrict)
ALTER TABLE "letters" ADD CONSTRAINT "letters_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE Restrict ON UPDATE NO ACTION;

-- approval_steps.approverId -> users.id (Restrict)
ALTER TABLE "approval_steps" ADD CONSTRAINT "approval_steps_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "users"("id") ON DELETE Restrict ON UPDATE NO ACTION;

-- archive_documents.createdById -> users.id (Restrict)
ALTER TABLE "archive_documents" ADD CONSTRAINT "archive_documents_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE Restrict ON UPDATE NO ACTION;

-- notifications.userId -> users.id (Cascade)
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE Cascade ON UPDATE NO ACTION;

-- audit_logs.userId -> users.id (Restrict)
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE Restrict ON UPDATE NO ACTION;
