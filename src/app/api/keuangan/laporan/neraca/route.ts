import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

function getBalance(transactions: any[], accountCode: string): number {
  return transactions
    .filter((t: any) => t.accountCode === accountCode)
    .reduce((sum: number, t: any) => {
      const amount = Number(t.amount);
      return t.type === "pemasukan" ? sum + amount : sum - amount;
    }, 0);
}

export async function GET(request: Request) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const asOfDate = searchParams.get("asOfDate") || new Date().toISOString();

    const accounts = await prisma.chartOfAccount.findMany();
    const transactions = await prisma.transaction.findMany({
      where: {
        transactionDate: { lte: new Date(asOfDate) },
      },
    });

    const asetAccounts = accounts.filter((a: any) => a.category === "Aset" && a.type === "Debit");
    const liabilitasAccounts = accounts.filter((a: any) => a.category === "Liabilitas" && a.type === "Kredit");
    const ekuitasAccounts = accounts.filter((a: any) => a.category === "Ekuitas" && a.type === "Kredit");

    const aset = asetAccounts.map((acc: any) => ({
      code: acc.code,
      name: acc.name,
      balance: getBalance(transactions, acc.code),
    }));

    const liabilitas = liabilitasAccounts.map((acc: any) => ({
      code: acc.code,
      name: acc.name,
      balance: getBalance(transactions, acc.code),
    }));

    const ekuitas = ekuitasAccounts.map((acc: any) => ({
      code: acc.code,
      name: acc.name,
      balance: getBalance(transactions, acc.code),
    }));

    const totalAset = aset.reduce((sum: number, item: any) => sum + item.balance, 0);
    const totalLiabilitas = liabilitas.reduce((sum: number, item: any) => sum + item.balance, 0);
    const totalEkuitas = ekuitas.reduce((sum: number, item: any) => sum + item.balance, 0);

    return NextResponse.json({
      asOfDate,
      aset,
      liabilitas,
      ekuitas,
      totals: {
        aset: totalAset,
        liabilitas: totalLiabilitas,
        ekuitas: totalEkuitas,
      },
    });
  } catch (error) {
    console.error("Error fetching neraca:", error);
    return NextResponse.json({ error: "Gagal memuat neraca" }, { status: 500 });
  }
}
