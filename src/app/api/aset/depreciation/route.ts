import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { hasPermission, getPermissions } from "@/lib/rbac";
import { logAuditEvent } from "@/lib/audit-logger";

export const dynamic = "force-dynamic";

interface DepreciationResult {
  assetId: string;
  assetName: string;
  period: string;
  depreciationAmount: number;
  scheduleId: string;
}

function monthDiff(start: Date, end: Date): number {
  return (end.getFullYear() - start.getFullYear()) * 12 - (start.getMonth() - end.getMonth());
}

function calculateDepreciation(
  assetValue: number,
  salvageValue: number,
  usefulLife: number,
  acquisitionDate: Date,
  periodDate: Date
): number {
  const depreciableAmount = assetValue - salvageValue;
  if (depreciableAmount <= 0 || usefulLife <= 0) return 0;

  const monthlyDepreciation = depreciableAmount / (usefulLife * 12);

  const monthsOwned = periodDate.getMonth() - acquisitionDate.getMonth() +
    (periodDate.getFullYear() - acquisitionDate.getFullYear()) * 12 + 1;

  if (monthsOwned <= 0) return 0;

  return monthlyDepreciation * monthsOwned;
}

export async function GET(request: Request) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");
    const month = searchParams.get("month");

    let where: any = {};
    if (year) {
      where.period = { startsWith: year };
      if (month) {
        where.period = { contains: `/${month}/` };
      }
    }

    const schedules = await prisma.assetDepreciationSchedule.findMany({
      where,
      include: {
        asset: {
          select: {
            name: true,
            acquisitionValue: true,
            salvageValue: true,
            usefulLife: true,
            acquisitionDate: true,
            currentValue: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: schedules });
  } catch (error) {
    console.error("Error fetching depreciation schedules:", error);
    return NextResponse.json({ error: "Gagal memuat jadwal penyusutan" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const userPermissions = user!.role?.permissions as Record<string, any> || {};
    const permissions = getPermissions(userPermissions);

    if (!hasPermission(permissions, "assets:crud")) {
      return NextResponse.json({ error: "Tidak memiliki akses" }, { status: 403 });
    }

    const body = await request.json();
    const { year, month, apply } = body;

    if (!year && !month) {
      return NextResponse.json({ error: "Tahun dan/atau bulan diperlukan" }, { status: 400 });
    }

    const assets = await prisma.asset.findMany({
      where: {
        isDeleted: false,
        status: "aktif",
      },
    });

    const depreciationResults: DepreciationResult[] = [];

    const periodYear = year ? parseInt(year) : new Date().getFullYear();
    const periodMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    const periodString = `${periodYear}-${String(periodMonth).padStart(2, "0")}`;
    const periodLabel = `${periodYear}/${String(periodMonth).padStart(2, "0")}`;

    for (const asset of assets) {
      const acquisitionDate = new Date(asset.acquisitionDate);
      const periodDate = new Date(periodYear, periodMonth - 1, 1);

      if (acquisitionDate > periodDate) {
        continue;
      }

      let depreciationAmount = calculateDepreciation(
        Number(asset.acquisitionValue),
        Number(asset.salvageValue),
        asset.usefulLife,
        acquisitionDate,
        periodDate
      );

      const existingSchedule = await prisma.assetDepreciationSchedule.findFirst({
        where: {
          assetId: asset.id,
          period: periodLabel,
        },
      });

      if (existingSchedule) {
        continue;
      }

      const schedule = await prisma.assetDepreciationSchedule.create({
        data: {
          assetId: asset.id,
          period: periodLabel,
          amount: depreciationAmount,
          isAccrued: false,
        },
      });

      if (apply) {
        const accrued = await prisma.assetDepreciationSchedule.update({
          where: { id: schedule.id },
          data: { isAccrued: true },
        });

        const depreciableAmount = Number(asset.acquisitionValue) - Number(asset.salvageValue);
        const currentAccumulated = await prisma.journalLine.aggregate({
          where: {
            accountCode: "1520",
            journalEntry: {
              reference: { contains: asset.id },
            },
          },
          _sum: {
            credit: true,
          },
        });

        const totalAccumulated = Number(currentAccumulated._sum.credit || 0) + depreciationAmount;

        if (totalAccumulated <= depreciableAmount) {
          const newCurrentValue = Number(asset.acquisitionValue) - totalAccumulated;
          await prisma.asset.update({
            where: { id: asset.id },
            data: { currentValue: newCurrentValue },
          });

          const journalEntry = await prisma.journalEntry.create({
            data: {
              entryDate: periodDate,
              description: `Penyusutan ${asset.name} - ${periodLabel}`,
              reference: `DEPR-${asset.id}-${periodLabel}`,
              isPosted: true,
              createdById: user!.id,
              lines: {
                create: [
                  {
                    accountCode: "1510",
                    debit: depreciationAmount,
                    credit: 0,
                    description: `Penyusutan ${asset.name}`,
                  },
                  {
                    accountCode: "1520",
                    debit: 0,
                    credit: depreciationAmount,
                    description: `Akumulasi penyusutan ${asset.name}`,
                  },
                ],
              },
            },
          });

          await logAuditEvent({
            userId: user!.id,
            action: "create",
            entityType: "AssetDepreciation",
            entityId: asset.id,
            changes: {
              period: periodLabel,
              depreciationAmount,
              journalEntryId: journalEntry.id,
              newCurrentValue,
            },
          });
        }
      }

      depreciationResults.push({
        assetId: asset.id,
        assetName: asset.name,
        period: periodLabel,
        depreciationAmount,
        scheduleId: schedule.id,
      });
    }

    await logAuditEvent({
      userId: user!.id,
      action: "post",
      entityType: "AssetDepreciation",
      entityId: `${periodYear}-${periodMonth}`,
      changes: {
        count: depreciationResults.length,
        applied: apply,
        results: depreciationResults,
      },
    });

    return NextResponse.json({ data: depreciationResults });
  } catch (error) {
    console.error("Error calculating depreciation:", error);
    return NextResponse.json({ error: "Gagal menghitung penyusutan" }, { status: 500 });
  }
}
