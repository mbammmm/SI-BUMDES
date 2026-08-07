-- CreateTable
CREATE TABLE "shu_allocation_settings" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "percentage" REAL NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "shu_allocation_settings_pkey" ON "shu_allocation_settings"("id");

-- CreateIndex
CREATE UNIQUE INDEX "shu_allocation_settings_name_key" ON "shu_allocation_settings"("name");

-- Insert default SHU allocation settings
INSERT INTO "shu_allocation_settings" ("name", "percentage", "description") VALUES
    ('pendapatan_asli_desa', 10.00, 'Pendapatan Asli Desa'),
    ('cadangan', 20.00, 'Cadangan Umum'),
    ('dana_sosial', 10.00, 'Dana Sosial'),
    ('pengembangan', 60.00, 'Pengembangan Desa');
