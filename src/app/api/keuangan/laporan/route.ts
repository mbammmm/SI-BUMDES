import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {};
    if (type) where.type = type;
    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) where.transactionDate.gte = new Date(startDate);
      if (endDate) where.transactionDate.lte = new Date(endDate);
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        createdBy: {
          select: { name: true },
        },
      },
      orderBy: { transactionDate: "asc" },
    });

    const totalIncome = transactions
      .filter((t: any) => t.type === "pemasukan")
      .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

    const totalExpense = transactions
      .filter((t: any) => t.type === "pengeluaran")
      .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

    return NextResponse.json({
      data: transactions,
      summary: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
      },
    });
  } catch (error) {
    console.error("Error fetching report:", error);
    return NextResponse.json({ error: "Gagal memuat laporan" }, { status: 500 });
  }
}
