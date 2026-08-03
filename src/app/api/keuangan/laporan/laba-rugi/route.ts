import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate") || new Date().toISOString();

    const accounts = await prisma.chartOfAccount.findMany();
    const where: any = {};
    if (startDate) where.transactionDate = { gte: new Date(startDate), lte: new Date(endDate) };
    else where.transactionDate = { lte: new Date(endDate) };

    const transactions = await prisma.transaction.findMany({ where });

    const pendapatanAccounts = accounts.filter((a) => a.category === "Pendapatan" && a.type === "Kredit");
    const bebanAccounts = accounts.filter((a) => a.category === "Beban" && a.type === "Debit");

    const pendapatan = pendapatanAccounts.map((acc) => {
      const total = transactions
        .filter((t) => t.accountCode === acc.code)
        .reduce((sum, t) => sum + Number(t.amount), 0);
      return { code: acc.code, name: acc.name, total };
    });

    const beban = bebanAccounts.map((acc) => {
      const total = transactions
        .filter((t) => t.accountCode === acc.code)
        .reduce((sum, t) => sum + Number(t.amount), 0);
      return { code: acc.code, name: acc.name, total };
    });

    const totalPendapatan = pendapatan.reduce((sum, item) => sum + item.total, 0);
    const totalBeban = beban.reduce((sum, item) => sum + item.total, 0);
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
