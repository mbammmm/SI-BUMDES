import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate") || new Date().toISOString();

    const where: any = {};
    if (startDate) {
      where.transactionDate = { gte: new Date(startDate), lte: new Date(endDate) };
    } else {
      where.transactionDate = { lte: new Date(endDate) };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        createdBy: { select: { name: true } },
      },
      orderBy: { transactionDate: "asc" },
    });

    const cashIn = transactions
      .filter((t) => t.type === "pemasukan")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const cashOut = transactions
      .filter((t) => t.type === "pengeluaran")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const netCashFlow = cashIn - cashOut;

    const byDate = transactions.reduce((acc: any, t) => {
      const date = new Date(t.transactionDate).toISOString().split("T")[0];
      if (!acc[date]) acc[date] = { date, pemasukan: 0, pengeluaran: 0 };
      if (t.type === "pemasukan") acc[date].pemasukan += Number(t.amount);
      else acc[date].pengeluaran += Number(t.amount);
      return acc;
    }, {});

    const dailyBreakdown = Object.values(byDate).map((d: any) => ({
      ...d,
      net: d.pemasukan - d.pengeluaran,
    }));

    return NextResponse.json({
      startDate: startDate || "Awal",
      endDate,
      summary: {
        cashIn,
        cashOut,
        netCashFlow,
      },
      dailyBreakdown,
    });
  } catch (error) {
    console.error("Error fetching arus kas:", error);
    return NextResponse.json({ error: "Gagal memuat arus kas" }, { status: 500 });
  }
}
