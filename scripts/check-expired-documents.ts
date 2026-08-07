import { PrismaClient } from "@prisma/client";
import { notifyRole } from "../src/lib/notifications";

const prisma = new PrismaClient();

async function checkExpiredDocuments() {
  const now = new Date();
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(now.getMonth() + 3);

  const expiringSoon = await prisma.archiveDocument.findMany({
    where: {
      isDeleted: false,
      expiryDate: {
        gte: now,
        lte: threeMonthsFromNow,
      },
    },
    include: {
      category: {
        select: { name: true },
      },
    },
  });

  const expired = await prisma.archiveDocument.findMany({
    where: {
      isDeleted: false,
      expiryDate: {
        lt: now,
      },
    },
    include: {
      category: {
        select: { name: true },
      },
    },
  });

  const notifications: string[] = [];

  for (const doc of expiringSoon) {
    const expiryDate = doc.expiryDate!.toISOString().split("T")[0];
    const daysLeft = Math.ceil(
      (doc.expiryDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    const title = "Pengingat: Dokumen Akan Kadaluarsa";
    const message = `Dokumen "${doc.title}" (kategori: ${doc.category?.name || "?"}) akan kadaluarsa pada ${expiryDate} (${daysLeft} hari lagi). Silakan review kembali.`;

    notifications.push(`${title}: ${message}`);
    console.log(`Notifying: ${message}`);

    await notifyRole("Bendahara/Akuntan", title, message, "warning");
    await notifyRole("Sekretaris", title, message, "warning");
    await notifyRole("Admin Sistem", title, message, "warning");
  }

  for (const doc of expired) {
    const expiryDate = doc.expiryDate!.toISOString().split("T")[0];

    const title = "PERINGATAN: Dokumen Kadaluarsa";
    const message = `Dokumen "${doc.title}" (kategori: ${doc.category?.name || "?"}) telah kadaluarsa pada ${expiryDate}. Silakan lakukan review ulang atau penghapusan dokumen.`;

    notifications.push(`${title}: ${message}`);
    console.log(`Notifying: ${message}`);

    await notifyRole("Bendahara/Akuntan", title, message, "approval");
    await notifyRole("Sekretaris", title, message, "approval");
    await notifyRole("Admin Sistem", title, message, "approval");
  }

  console.log(`Checked ${expiringSoon.length} expiring documents and ${expired.length} expired documents.`);

  if (notifications.length > 0) {
    console.log(`${notifications.length} notifications sent.`);
  } else {
    console.log("No expiring or expired documents found.");
  }
}

checkExpiredDocuments()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
