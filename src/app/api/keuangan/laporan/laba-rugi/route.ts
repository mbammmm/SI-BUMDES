import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate") || new Date().toISOString();

    const accounts = await prisma.chartOfAccount.findMany();
    const where: any = {};
    if (startDate) where.transactionDate = { gte: new Date(startDate), lte: new Date(endDate) };
    else where.transactionDate = { lte: new Date(endDate) };

    const transactions = await prisma.transaction.findMany({ where });

    const journalEntries = await prisma.journalEntry.findMany({
      where: {
        isPosted: true,
        entryDate: where.transactionDate,
      },
      include: {
        lines: true,
      },
    });

    const pendapatanAccounts = accounts.filter((a: any) => a.category === "Pendapatan" && a.type === "Kredit");
    const bebanAccounts = accounts.filter((a: any) => a.category === "Beban" && a.type === "Debit");

    const pendapatan = pendapatanAccounts.map((acc: any) => {
      const total = transactions
        .filter((t: any) => t.accountCode === acc.code)
        .reduce((sum: number, t: any) => sum + Number(t.amount), 0);
      return { code: acc.code, name: acc.name, total };
    });

    const beban = bebanAccounts.map((acc: any) => {
      const txTotal = transactions
        .filter((t: any) => t.accountCode === acc.code)
        .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

      let journalTotal = 0;
      if (acc.code === "1510") {
        journalTotal = journalEntries.reduce((sum: number, entry: any) => {
          const depLine = entry.lines.find((l: any) => l.accountCode === acc.code);
          return sum + (depLine ? Number(depLine.debit) : 0);
        }, 0);
      }

      return { code: acc.code, name: acc.name, total: txTotal + journalTotal };
    });

    const totalPendapatan = pendapatan.reduce((sum: number, item: any) => sum + item.total, 0);
    const totalBeban = beban.reduce((sum: number, item: any) => sum + item.total, 0);
    const labaRugi = totalPendapatan - totalBeban;

    return NextResponse.json({
      startDate: startDate || "Awal",
      endDate,
      pendapatan,
      beban,
      totals: {
        pendapatan: totalPendapatan,
        beban: totalBeban,
        labaRugi,
      },
    });
  } catch (error) {
    console.error("Error fetching laba rugi:", error);
    return NextResponse.json({ error: "Gagal memuat laba rugi" }, { status: 500 });
  }
}
