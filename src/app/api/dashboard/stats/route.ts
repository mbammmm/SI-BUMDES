import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export async function GET() {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const [
      totalTransactions,
      totalAssets,
      totalLetters,
      pendingLetters,
    ] = await Promise.all([
      prisma.transaction.count(),
      prisma.asset.count(),
      prisma.letter.count(),
      prisma.letter.count({ where: { status: "draft" } }),
    ]);

    const recentTransactions = await prisma.transaction.findMany({
      take: 5,
      orderBy: { transactionDate: "desc" },
      include: {
        createdBy: { select: { name: true } },
      },
    });

    const recentLetters = await prisma.letter.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      stats: {
        totalTransactions,
        totalAssets,
        totalLetters,
        pendingLetters,
      },
      recentTransactions,
      recentLetters,
    });
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    return NextResponse.json({ error: "Gagal memuat dashboard" }, { status: 500 });
  }
}
