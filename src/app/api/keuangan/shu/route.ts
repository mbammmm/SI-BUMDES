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
    const endDate = searchParams.get("endDate");

    const where: any = {};
    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) where.transactionDate.gte = new Date(startDate);
      if (endDate) where.transactionDate.lte = new Date(endDate);
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { transactionDate: "desc" },
    });

    const accountCodes = [...new Set(transactions.map((tx: any) => tx.accountCode))];
    const unitUsahaIds = [...new Set(transactions.map((tx: any) => tx.unitUsahaId))];

    const [accounts, units] = await Promise.all([
      prisma.chartOfAccount.findMany({
        where: { code: { in: accountCodes } },
      }),
      prisma.unitUsaha.findMany({
        where: { id: { in: unitUsahaIds } },
      }),
    ]);

    const accountMap: Map<string, any> = new Map(accounts.map((a: any) => [a.code, a]));
    const unitMap: Map<string, any> = new Map(units.map((u: any) => [u.id, u]));

    const revenueByAccount: Record<string, { code: string; name: string; amount: number }> = {};
    const expenseByAccount: Record<string, { code: string; name: string; amount: number }> = {};
    const revenueByUnit: Record<string, { name: string; amount: number }> = {};
    const expenseByUnit: Record<string, { name: string; amount: number }> = {};

    let totalRevenue = 0;
    let totalExpense = 0;

    for (const tx of transactions) {
      const account = accountMap.get(tx.accountCode);
      const category = account?.category;
      if (!category) continue;

      const amount = Number(tx.amount);
      const unit = unitMap.get(tx.unitUsahaId);
      const unitName = unit?.name || "Umum";

      if (tx.type === "pemasukan") {
        if (category === "Pendapatan") {
          totalRevenue += amount;
          if (!revenueByAccount[tx.accountCode]) {
            revenueByAccount[tx.accountCode] = {
              code: tx.accountCode,
              name: account?.name || tx.accountCode,
              amount: 0,
            };
          }
          revenueByAccount[tx.accountCode].amount += amount;
          revenueByUnit[unitName] = revenueByUnit[unitName] || { name: unitName, amount: 0 };
          revenueByUnit[unitName].amount += amount;
        }
      } else if (tx.type === "pengeluaran") {
        if (category === "Beban") {
          totalExpense += amount;
          if (!expenseByAccount[tx.accountCode]) {
            expenseByAccount[tx.accountCode] = {
              code: tx.accountCode,
              name: account?.name || tx.accountCode,
              amount: 0,
            };
          }
          expenseByAccount[tx.accountCode].amount += amount;
          expenseByUnit[unitName] = expenseByUnit[unitName] || { name: unitName, amount: 0 };
          expenseByUnit[unitName].amount += amount;
        }
      }
    }

    const shu = totalRevenue - totalExpense;

    const allocation = {
      pendapatanAsliDesa: shu * 0.10,
      cadangan: shu * 0.20,
      danaSosial: shu * 0.10,
      pengembangan: shu * 0.60,
    };

    return NextResponse.json({
      period: {
        startDate: startDate || null,
        endDate: endDate || null,
      },
      totalRevenue,
      totalExpense,
      shu,
      revenueByAccount: Object.values(revenueByAccount),
      expenseByAccount: Object.values(expenseByAccount),
      revenueByUnit: Object.values(revenueByUnit),
      expenseByUnit: Object.values(expenseByUnit),
      allocation,
    });
  } catch (error) {
    console.error("Error fetching SHU:", error);
    return NextResponse.json({ error: "Gagal memuat SHU" }, { status: 500 });
  }
}
