import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { hasPermission, type Permission } from "@/lib/rbac";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const unitUsahaId = searchParams.get("unitUsahaId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {};
    if (unitUsahaId) where.unitUsahaId = unitUsahaId;
    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) where.transactionDate.gte = new Date(startDate);
      if (endDate) where.transactionDate.lte = new Date(endDate);
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        createdBy: {
          select: { name: true, username: true },
        },
      },
      orderBy: { transactionDate: "desc" },
    });

    return NextResponse.json({ data: transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ error: "Gagal memuat transaksi" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const userPermissions = user!.role?.permissions as Record<string, any> || {};
    const { getPermissions } = await import("@/lib/rbac");
    const permissions = getPermissions(userPermissions);

    if (!hasPermission(permissions, "accounting:input") && !hasPermission(permissions, "accounting:crud")) {
      return NextResponse.json({ error: "Tidak memiliki akses" }, { status: 403 });
    }

    const body = await request.json();
    const amount = Number(body.amount);

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Nominal transaksi harus lebih dari 0" }, { status: 400 });
    }

    const transaction = await prisma.transaction.create({
      data: {
        transactionDate: new Date(body.transactionDate),
        unitUsahaId: body.unitUsahaId,
        type: body.type,
        amount,
        accountCode: body.accountCode,
        description: body.description,
        proofPath: body.proofPath,
        createdById: user!.id,
      },
      include: {
        createdBy: {
          select: { name: true, username: true },
        },
      },
    });

    const account = await prisma.chartOfAccount.findUnique({
      where: { code: body.accountCode },
    });

    if (account) {
      const isDebit = account.type === "Debit";
      const isPemasukan = body.type === "pemasukan";
      const debit = isDebit === isPemasukan ? amount : 0;
      const credit = isDebit !== isPemasukan ? amount : 0;

      await prisma.journalEntry.create({
        data: {
          entryDate: new Date(body.transactionDate),
          description: body.description || `Transaksi ${body.type} - ${account.name}`,
          reference: transaction.id,
          isPosted: true,
          createdById: user!.id,
          lines: {
            create: [
              {
                accountCode: body.accountCode,
                debit,
                credit,
                description: body.description,
              },
            ],
          },
        },
        include: {
          lines: true,
        },
      });
    }

    return NextResponse.json({ data: transaction });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json({ error: "Gagal menambah transaksi" }, { status: 500 });
  }
}
