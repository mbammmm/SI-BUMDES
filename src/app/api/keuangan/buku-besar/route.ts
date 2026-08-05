import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/api-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const accountId = url.searchParams.get("accountId");

    if (!accountId) {
      return NextResponse.json({ entries: [], saldoAwal: 0, saldoAkhir: 0 });
    }

    const transactions = await prisma.transaction.findMany({
      where: { accountCode: accountId },
      orderBy: { transactionDate: "asc" },
    });

    let saldo = 0;
    const entries = transactions.map((tx: any) => {
      const isDebit = tx.type === "pemasukan";
      const isCredit = tx.type === "pengeluaran";

      let debitAmount = 0;
      let creditAmount = 0;

      if (isDebit) debitAmount = Number(tx.amount);
      if (isCredit) creditAmount = Number(tx.amount);

      if (isDebit) {
        saldo += debitAmount;
      } else {
        saldo -= creditAmount;
      }

      return {
        date: tx.transactionDate,
        reference: tx.id,
        description: tx.description,
        debit: debitAmount,
        kredit: creditAmount,
        saldo: saldo,
      };
    });

    const saldoAwal = 0;
    const saldoAkhir = entries.length > 0 ? entries[entries.length - 1].saldo : 0;

    return NextResponse.json({
      entries,
      saldoAwal,
      saldoAkhir,
    });
  } catch (error) {
    console.error("Error fetching buku besar:", error);
    return NextResponse.json({ error: "Gagal memuat buku besar" }, { status: 500 });
  }
}
