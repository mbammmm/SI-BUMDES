import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Seed roles
  const roles = [
    {
      name: "Admin Sistem",
      description: "Kelola akun pengguna, konfigurasi sistem, backup",
      permissions: {
        users: "crud",
        accounting: "crud",
        assets: "crud",
        letters: "crud",
        archives: "crud",
        reports: "read",
        notifications: "crud",
      },
    },
    {
      name: "Direktur/Ketua BUMDes",
      description: "Approval tingkat tinggi, akses penuh ke semua laporan",
      permissions: {
        users: "read",
        accounting: "read_approve",
        assets: "approve",
        letters: "approve_sign",
        archives: "read",
        reports: "read",
        notifications: "read",
      },
    },
    {
      name: "Bendahara/Akuntan",
      description: "Kelola seluruh modul akuntansi & keuangan",
      permissions: {
        users: "none",
        accounting: "crud",
        assets: "read",
        letters: "none",
        archives: "read",
        reports: "read",
        notifications: "read",
      },
    },
    {
      name: "Sekretaris",
      description: "Kelola surat menyurat & arsip",
      permissions: {
        users: "none",
        accounting: "none",
        assets: "none",
        letters: "crud",
        archives: "crud",
        reports: "read",
        notifications: "read",
      },
    },
    {
      name: "Kepala Unit Usaha",
      description: "Input transaksi & aset untuk unit usahanya",
      permissions: {
        users: "none",
        accounting: "input",
        assets: "crud",
        letters: "read",
        archives: "read",
        reports: "read",
        notifications: "read",
      },
    },
    {
      name: "Staf/Operator",
      description: "Input data harian sesuai izin akses",
      permissions: {
        users: "none",
        accounting: "input",
        assets: "input",
        letters: "input",
        archives: "upload",
        reports: "read",
        notifications: "read",
      },
    },
    {
      name: "Pengawas",
      description: "Lihat dashboard & laporan tanpa bisa mengubah data",
      permissions: {
        users: "none",
        accounting: "read",
        assets: "read",
        letters: "read",
        archives: "read",
        reports: "read",
        notifications: "read",
      },
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { permissions: role.permissions },
      create: role,
    });
  }

  // Seed BUMDes profile
  await prisma.bUMDesProfile.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      name: "BUMDes Maju Langgeng",
      address: "Jl. Desa Maju Langgeng No. 1",
      phone: "",
      email: "",
    },
  });

  // Seed unit usaha
  const units = [
    {
      name: "Pertanian",
      type: "Pertanian",
      startDate: new Date("2023-01-01"),
      initialCapital: 10000000,
      description: "Unit usaha pertanian desa",
    },
    {
      name: "Peternakan",
      type: "Peternakan",
      startDate: new Date("2023-01-01"),
      initialCapital: 8000000,
      description: "Unit usaha peternakan desa",
    },
    {
      name: "Perdagangan",
      type: "Perdagangan",
      startDate: new Date("2023-01-01"),
      initialCapital: 12000000,
      description: "Unit usaha perdagangan desa",
    },
  ];

  for (const unit of units) {
    const existing = await prisma.unitUsaha.findFirst({
      where: { name: unit.name },
    });
    if (!existing) {
      await prisma.unitUsaha.create({ data: unit });
    }
  }

  // Seed COA dasar
  const coa = [
    { code: "1000", name: "Kas", category: "Aset", type: "Debit" },
    { code: "1100", name: "Bank", category: "Aset", type: "Debit" },
    { code: "1200", name: "Piutang", category: "Aset", type: "Debit" },
    { code: "1300", name: "Persediaan", category: "Aset", type: "Debit" },
    { code: "1500", name: "Aset Tetap", category: "Aset", type: "Debit" },
    { code: "1510", name: "Beban Penyusutan", category: "Beban", type: "Debit" },
    { code: "1520", name: "Akumulasi Penyusutan", category: "Aset", type: "Kredit" },
    { code: "2000", name: "Liabilitas", category: "Liabilitas", type: "Kredit" },
    { code: "3000", name: "Modal Desa", category: "Ekuitas", type: "Kredit" },
    { code: "3100", name: "Cadangan", category: "Ekuitas", type: "Kredit" },
    { code: "4000", name: "Pendapatan", category: "Pendapatan", type: "Kredit" },
    { code: "5000", name: "Beban Operasional", category: "Beban", type: "Debit" },
    { code: "6000", name: "Beban Administrasi", category: "Beban", type: "Debit" },
  ];

  for (const account of coa) {
    await prisma.chartOfAccount.upsert({
      where: { code: account.code },
      update: {},
      create: account,
    });
  }

  // Seed admin user
  const adminRole = await prisma.role.findUnique({
    where: { name: "Admin Sistem" },
  });

  if (adminRole) {
    const hashedPassword = await bcrypt.hash("admin123", 12);
    await prisma.user.upsert({
      where: { email: "admin@bumdes.test" },
      update: {},
      create: {
        email: "admin@bumdes.test",
        username: "admin",
        name: "Admin Sistem",
        passwordHash: hashedPassword,
        roleId: adminRole.id,
        isActive: true,
      },
    });
  }

  // Seed document categories
  const categories = [
    { name: "SK Pengurus", description: "Surat Keputusan Pengurus BUMDes" },
    { name: "Laporan Keuangan", description: "Laporan keuangan bulanan/tahunan" },
    { name: "Kontrak Kerjasama", description: "Dokumen kontrak dengan pihak ketiga" },
    { name: "Surat Masuk", description: "Arsip surat masuk" },
    { name: "Surat Keluar", description: "Arsip surat keluar" },
  ];

  for (const cat of categories) {
    await prisma.documentCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }

  console.log("Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
