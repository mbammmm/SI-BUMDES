import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { hasPermission, getPermissions } from "@/lib/rbac";
import { logAuditEvent } from "@/lib/audit-logger";

export const dynamic = "force-dynamic";

interface ReconciliationItem {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: string;
  status: "matched" | "unmatched" | "disputed";
}

interface ReconciliationResult {
  startDate: string;
  endDate: string;
  bankBalance: number;
  systemBalance: number;
  difference: number;
  items: ReconciliationItem[];
  status: "reconciled" | "pending" | "discrepancy";
}

export async function GET(request: Request) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Tanggal awal dan akhir diperlukan" }, { status: 400 });
    }

    const dateFilter = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };

    const transactions = await prisma.transaction.findMany({
      where: {
        transactionDate: dateFilter,
        isDeleted: false,
      },
      include: {
        createdBy: { select: { name: true, username: true } },
      },
      orderBy: { transactionDate: "desc" },
    });

    const accounts = await prisma.chartOfAccount.findMany();
    const accountMap = new Map(accounts.map((a) => [a.code, a]));

    let totalPemasukan = 0;
    let totalPengeluaran = 0;

    const items: ReconciliationItem[] = transactions.map((tx) => {
      const account = accountMap.get(tx.accountCode);
      const amount = Number(tx.amount);

      if (tx.type === "pemasukan") {
        totalPemasukan += amount;
      } else {
        totalPengeluaran += amount;
      }

      let status: "matched" | "unmatched" | "disputed" = "unmatched";
      if (tx.isPosted && tx.proofPath) {
        status = "matched";
      }

      return {
        id: tx.id,
        date: tx.transactionDate.toISOString().split("T")[0],
        description: tx.description,
        amount,
        type: tx.type,
        status,
      };
    });

    const systemBalance = totalPemasukan - totalPengeluaran;

    const existingReconciliation = await prisma.reconciliation.findFirst({
      where: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
      include: {
        items: true,
      },
    });

    let bankBalance = 0;
    if (existingReconciliation) {
      bankBalance = Number(existingReconciliation.bankBalance);
    }

    let status: "reconciled" | "pending" | "discrepancy" = "pending";
    const difference = bankBalance - systemBalance;

    if (existingReconciliation && Math.abs(difference) < 0.01) {
      status = "reconciled";
    } else if (existingReconciliation) {
      status = "discrepancy";
    }

    const result: ReconciliationResult = {
      startDate,
      endDate,
      bankBalance,
      systemBalance,
      difference,
      items,
      status,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching reconciliation:", error);
    return NextResponse.json({ error: "Gagal memuat rekonsiliasi" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const userPermissions = user!.role?.permissions as Record<string, any> || {};
    const permissions = getPermissions(userPermissions);

    if (!hasPermission(permissions, "accounting:crud")) {
      return NextResponse.json({ error: "Tidak memiliki akses" }, { status: 403 });
    }

    const body = await request.json();
    const { startDate, endDate, bankBalance, notes, itemStatuses } = body;

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Tanggal awal dan akhir diperlukan" }, { status: 400 });
    }

    const reconciliation = await prisma.reconciliation.create({
      data: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        bankBalance: Number(bankBalance || 0),
        status: "pending",
        notes,
        createdById: user!.id,
        items: {
          create: await Promise.all(
            (itemStatuses || []).map(async (item: any) => {
              const tx = await prisma.transaction.findUnique({
                where: { id: item.id },
                select: { amount: true, type: true },
              });

              return {
                transactionId: item.id,
                status: item.status,
                notes: item.notes,
              };
            })
          ),
        },
      },
      include: {
        items: true,
      },
    });

    await logAuditEvent({
      userId: user!.id,
      action: "post",
      entityType: "Reconciliation",
      entityId: reconciliation.id,
      changes: { startDate, endDate, bankBalance, status: reconciliation.status },
    });

    return NextResponse.json({ data: reconciliation });
  } catch (error) {
    console.error("Error creating reconciliation:", error);
    return NextResponse.json({ error: "Gagal membuat rekonsiliasi" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const userPermissions = user!.role?.permissions as Record<string, any> || {};
    const permissions = getPermissions(userPermissions);

    if (!hasPermission(permissions, "accounting:crud")) {
      return NextResponse.json({ error: "Tidak memiliki akses" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID rekonsiliasi diperlukan" }, { status: 400 });
    }

    const body = await request.json();
    const updates: any = {};
    if (body.status !== undefined) updates.status = body.status;
    if (body.notes !== undefined) updates.notes = body.notes;

    const updated = await prisma.reconciliation.update({
      where: { id },
      data: updates,
      include: {
        items: true,
      },
    });

    await logAuditEvent({
      userId: user!.id,
      action: "update",
      entityType: "Reconciliation",
      entityId: id,
      changes: updates,
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Error updating reconciliation:", error);
    return NextResponse.json({ error: "Gagal memperbarui rekonsiliasi" }, { status: 500 });
  }
}
