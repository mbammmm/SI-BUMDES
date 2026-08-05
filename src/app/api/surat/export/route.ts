import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/api-auth";
import ExcelJS from "exceljs";

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
    const tab = url.searchParams.get("tab") || "keluar";

    const letterData = await prisma.letter.findMany({
      where: { type: tab as "keluar" | "masuk" },
      include: {
        createdBy: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const approvalData = await prisma.approvalStep.findMany({
      where: {
        letterId: { in: letterData.map((l) => l.id) },
      },
      include: {
        approver: { select: { name: true } },
      },
    });

    const approvalMap = new Map<string, any[]>();
    approvalData.forEach((a) => {
      const arr = approvalMap.get(a.letterId) || [];
      arr.push(a);
      approvalMap.set(a.letterId, arr);
    });

    const letters = letterData.map((letter) => ({
      ...letter,
      approvalStatuses: approvalMap.get(letter.id)?.map((a) => `${a.approver.name}: ${a.status}`).join(", ") || "-",
    }));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(tab === "keluar" ? "Surat Keluar" : "Surat Masuk");

    worksheet.addRow([]);
    worksheet.addRow([
      { value: `LAPORAN SURAT ${tab === "keluar" ? "KELUAR" : "MASUK"}`, colspan: 8, font: { bold: true, size: 14 } },
    ]);
    worksheet.addRow([]);

    const headerRow = worksheet.addRow([
      "No",
      "Nomor",
      "Perihal",
      tab === "keluar" ? "Penerima" : "Pengirim",
      "Tanggal",
      "Status",
      "Dibuat Oleh",
      "Approval",
    ]);
    headerRow.font = { bold: true };

    letters.forEach((letter, index) => {
      worksheet.addRow([
        index + 1,
        letter.number,
        letter.subject,
        tab === "keluar" ? letter.recipient || "-" : letter.sender || "-",
        letter.outgoingDate
          ? new Date(letter.outgoingDate).toLocaleDateString("id-ID")
          : letter.incomingDate
          ? new Date(letter.incomingDate).toLocaleDateString("id-ID")
          : "-",
        letter.status,
        letter.createdBy?.name || "-",
        letter.approvalStatuses,
      ]);
    });

    worksheet.columns.forEach((column) => {
      column.width = Math.max(column.width || 0, 12);
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="surat-${tab}-${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Error exporting letters:", error);
    return NextResponse.json({ error: "Gagal mengekspor surat" }, { status: 500 });
  }
}
