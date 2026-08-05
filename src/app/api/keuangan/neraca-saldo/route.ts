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

    const accounts = await prisma.chartOfAccount.findMany({
      select: {
        code: true,
        name: true,
        category: true,
        type: true,
      },
    });

    const data = accounts.map((account) => {
      let debit = 0;
      let kredit = 0;

      return {
        code: account.code,
        name: account.name,
        category: account.category,
        type: account.type,
        normalBalance: account.type === "Debit" ? "debit" : "kredit",
        debit,
        kredit,
      };
    });

    const transactions = await prisma.transaction.findMany({
      select: {
        accountCode: true,
        type: true,
        amount: true,
      },
    });

    transactions.forEach((tx) => {
      const account = data.find((a) => a.code === tx.accountCode);
      if (account) {
        const amount = Number(tx.amount);
        if (tx.type === "pemasukan") {
          if (account.type === "Debit") {
            account.debit += amount;
          } else {
            account.kredit += amount;
          }
        } else {
          if (account.type === "Debit") {
            account.kredit += amount;
          } else {
            account.debit += amount;
          }
        }
      }
    });

    const totalDebit = data.reduce((sum, a) => sum + a.debit, 0);
    const totalKredit = data.reduce((sum, a) => sum + a.kredit, 0);

    return NextResponse.json({
      data,
      totalDebit,
      totalKredit,
    });
  } catch (error) {
    console.error("Error fetching neraca saldo:", error);
    return NextResponse.json({ error: "Gagal memuat neraca saldo" }, { status: 500 });
  }
}
