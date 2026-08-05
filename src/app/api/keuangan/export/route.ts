import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/api-auth";
import ExcelJS from "exceljs";
import { generateReportPDF } from "@/lib/report-pdf-generator";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const format = url.searchParams.get("format") || "excel";
    const startDate = url.searchParams.get("startDate") || undefined;
    const endDate = url.searchParams.get("endDate") || undefined;
    const reportType = url.searchParams.get("reportType") || "transaksi";

    const where: any = {};
    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) where.transactionDate.gte = new Date(startDate);
      if (endDate) where.transactionDate.lte = new Date(endDate);
    }

    let data: any = [];
    let columns: any[] = [];
    let sheetName = "Laporan";
    let fileName = "laporan";

    if (reportType === "transaksi") {
      sheetName = "Transaksi";
      fileName = "laporan-transaksi";
      data = await prisma.transaction.findMany({
        where,
        include: {
          createdBy: { select: { name: true } },
        },
        orderBy: { transactionDate: "desc" },
      });
      columns = [
        { header: "No", key: "no", width: 5 },
        { header: "Tanggal", key: "tanggal", width: 15 },
        { header: "Unit Usaha", key: "unitUsahaId", width: 15 },
        { header: "Jenis", key: "type", width: 12 },
        { header: "Akun", key: "accountCode", width: 10 },
        { header: "Nominal (Rp)", key: "amount", width: 18 },
        { header: "Keterangan", key: "description", width: 30 },
        { header: "Oleh", key: "createdBy", width: 15 },
      ];
    } else if (reportType === "jurnal") {
      sheetName = "Jurnal";
      fileName = "laporan-jurnal";
      const journalEntries = await prisma.journalEntry.findMany({
        include: {
          lines: true,
        },
        orderBy: { entryDate: "desc" },
      });

      const userMap = new Map(
        (await prisma.user.findMany({
          select: { id: true, name: true },
        })).map((u: any) => [u.id, u.name])
      );

      data = journalEntries.map((entry: any) => ({
        ...entry,
        createdByName: userMap.get(entry.createdById) || "-",
      }));

      return await exportJurnalExcel(data as any, startDate, endDate);
    } else if (reportType === "aset") {
      sheetName = "Aset";
      fileName = "laporan-aset";
      data = await prisma.asset.findMany({
        include: {
          createdBy: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      columns = [
        { header: "Nama", key: "name", width: 20 },
        { header: "Kategori", key: "category", width: 15 },
        { header: "Tanggal Perolehan", key: "acquisitionDate", width: 15 },
        { header: "Nilai Perolehan (Rp)", key: "acquisitionValue", width: 18 },
        { header: "Masa Pakai (th)", key: "usefulLife", width: 12 },
        { header: "Nilai Sisa (Rp)", key: "salvageValue", width: 15 },
        { header: "Unit Usaha", key: "unitUsahaId", width: 15 },
        { header: "Kondisi", key: "condition", width: 12 },
        { header: "Status", key: "status", width: 12 },
        { header: "Nilai Buku (Rp)", key: "currentValue", width: 18 },
        { header: "Oleh", key: "createdBy", width: 15 },
      ];
    } else if (reportType === "surat") {
      sheetName = "Surat";
      fileName = "laporan-surat";
      data = await prisma.letter.findMany({
        include: {
          createdBy: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      columns = [
        { header: "No", key: "no", width: 5 },
        { header: "Nomor", key: "number", width: 15 },
        { header: "Perihal", key: "subject", width: 30 },
        { header: "Pengirim/Penerima", key: "contact", width: 20 },
        { header: "Tanggal", key: "date", width: 15 },
        { header: "Status", key: "status", width: 12 },
        { header: "Oleh", key: "createdBy", width: 15 },
      ];
    }

    if (format === "excel") {
      return await exportToExcel(data, columns, sheetName, fileName, startDate, endDate);
    } else if (format === "pdf") {
      return await exportToPDF(reportType, data, startDate, endDate);
    } else {
      return NextResponse.json({ error: "Format tidak didukung" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error exporting report:", error);
    return NextResponse.json({ error: "Gagal mengekspor laporan" }, { status: 500 });
  }
}

async function exportToExcel(data: any[], columns: any[], sheetName: string, fileName: string, startDate?: string, endDate?: string) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  worksheet.columns = columns;

  if (startDate && endDate) {
    worksheet.addRow([]);
    worksheet.addRow([{ value: `Periode: ${startDate} sampai ${endDate}`, colspan: columns.length }]);
  }

  worksheet.getRow(1).font = { bold: true, size: 12 };
  worksheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };

  data.forEach((item, index) => {
    const row = worksheet.addRow({
      no: index + 1,
      tanggal: item.transactionDate ? new Date(item.transactionDate).toLocaleDateString("id-ID") : "-",
      unitUsahaId: item.unitUsahaId || "-",
      type: item.type === "pemasukan" ? "Pemasukan" : "Pengeluaran",
      accountCode: item.accountCode,
      amount: Number(item.amount).toLocaleString("id-ID"),
      description: item.description || "-",
      createdBy: item.createdBy?.name || "-",
      category: item.category || "-",
      acquisitionDate: item.acquisitionDate ? new Date(item.acquisitionDate).toLocaleDateString("id-ID") : "-",
      acquisitionValue: item.acquisitionValue ? Number(item.acquisitionValue).toLocaleString("id-ID") : "-",
      usefulLife: item.usefulLife || "-",
      salvageValue: item.salvageValue ? Number(item.salvageValue).toLocaleString("id-ID") : "-",
      condition: item.condition || "-",
      status: item.status || "-",
      currentValue: item.currentValue ? Number(item.currentValue).toLocaleString("id-ID") : "-",
      name: item.name || "-",
      number: item.number || "-",
      subject: item.subject || "-",
      contact: item.type === "keluar" ? item.recipient : item.sender || "-",
      date: item.outgoingDate
        ? new Date(item.outgoingDate).toLocaleDateString("id-ID")
        : item.incomingDate
        ? new Date(item.incomingDate).toLocaleDateString("id-ID")
        : "-",
    });
  });

  worksheet.columns.forEach((column) => {
    column.width = Math.max(column.width || 0, 10);
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${fileName}-${new Date().toISOString().split("T")[0]}.xlsx"`,
    },
  });
}

async function exportJurnalExcel(data: any[], startDate?: string, endDate?: string) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Jurnal");

  worksheet.addRow([]);
  worksheet.addRow([{ value: "LAPORAN JURNAL UMUM", colspan: 7, font: { bold: true, size: 14 }, alignment: { horizontal: "center" } }]);
  if (startDate && endDate) {
    worksheet.addRow([{ value: `Periode: ${startDate} sampai ${endDate}`, colspan: 7, alignment: { horizontal: "center" } }]);
  }
  worksheet.addRow([]);

  const headerRow = worksheet.addRow(["No", "Tanggal", "Keterangan", "Ref", "Status", "Dibuat Oleh"]);
  headerRow.font = { bold: true };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };

  worksheet.addRow([]);
  const detailHeader = worksheet.addRow(["No", "Kode Akun", "Deskripsi", "Debit", "Kredit"]);
  detailHeader.font = { bold: true, italic: true };

  let rowNum = 9;
  data.forEach((entry: any, index: number) => {
    const row = worksheet.addRow([
      index + 1,
      entry.entryDate ? new Date(entry.entryDate).toLocaleDateString("id-ID") : "-",
      entry.description,
      entry.reference || "-",
      entry.isPosted ? "Diposting" : "Draft",
      entry.createdByName || "-",
    ]);
    rowNum++;

    entry.lines.forEach((line: any) => {
      worksheet.addRow(["", line.accountCode, line.description || "-", Number(line.debit) > 0 ? Number(line.debit).toLocaleString("id-ID") : "", Number(line.credit) > 0 ? Number(line.credit).toLocaleString("id-ID") : ""]);
    });
    worksheet.addRow([]);
  });

  worksheet.columns.forEach((column) => {
    column.width = Math.max(column.width || 0, 15);
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="laporan-jurnal-${new Date().toISOString().split("T")[0]}.xlsx"`,
    },
  });
}

async function exportToPDF(reportType: string, data: any[], startDate?: string, endDate?: string) {
  const stream = await generateReportPDF({
    reportType,
    data,
    startDate,
    endDate,
    title: "Laporan SI-BUMDes",
  });

  const chunks: Buffer[] = [];

  await new Promise((resolve, reject) => {
    stream.on("data", (chunk: Buffer) => chunks.push(chunk));
    stream.on("end", resolve);
    stream.on("error", reject);
  });

  const buffer = Buffer.concat(chunks);

  let reportName = reportType;
  if (reportType === "transaksi") reportName = "transaksi";
  if (reportType === "aset") reportName = "aset";
  if (reportType === "surat") reportName = "surat";

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="laporan-${reportName}-${new Date().toISOString().split("T")[0]}.pdf"`,
    },
  });
}
