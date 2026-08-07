import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { hasPermission, type Permission } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const expiringSoon = searchParams.get("expiringSoon");
    const expired = searchParams.get("expired");

    if (expiringSoon === "true" || expired === "true") {
      const now = new Date();
      const threeMonthsFromNow = new Date();
      threeMonthsFromNow.setMonth(now.getMonth() + 3);

      const where: any = {
        isDeleted: false,
        expiryDate: { not: null },
      };

      if (expiringSoon === "true") {
        where.expiryDate = {
          gte: now,
          lte: threeMonthsFromNow,
        };
      }

      if (expired === "true") {
        where.expiryDate = {
          lt: now,
        };
      }

      const documents = await prisma.archiveDocument.findMany({
        where,
        include: {
          createdBy: {
            select: { name: true },
          },
          category: {
            select: { name: true },
          },
        },
        orderBy: { expiryDate: expiringSoon === "true" ? "asc" : "desc" },
      });

      return NextResponse.json({ data: documents });
    }

    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    where.isDeleted = false;

    const documents = await prisma.archiveDocument.findMany({
      where,
      include: {
        createdBy: {
          select: { name: true },
        },
      },
      orderBy: { documentDate: "desc" },
    });

    return NextResponse.json({ data: documents });
  } catch (error) {
    console.error("Error fetching archive documents:", error);
    return NextResponse.json({ error: "Gagal memuat dokumen arsip" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const userPermissions = user!.role?.permissions as Record<string, any> || {};
    const { getPermissions } = await import("@/lib/rbac");
    const permissions = getPermissions(userPermissions);

    if (!hasPermission(permissions, "archives:upload") && !hasPermission(permissions, "archives:crud")) {
      return NextResponse.json({ error: "Tidak memiliki akses" }, { status: 403 });
    }

    const body = await request.json();

    let retentionDays = body.retentionDays;
    let expiryDate: Date | null = null;

    if (body.categoryId && !retentionDays) {
      const category = await prisma.documentCategory.findUnique({
        where: { id: body.categoryId },
        select: { retentionDays: true },
      });
      if (category?.retentionDays) {
        retentionDays = category.retentionDays;
      }
    }

    if (retentionDays) {
      expiryDate = new Date(body.documentDate);
      expiryDate.setDate(expiryDate.getDate() + Number(retentionDays));
    }

    const document = await prisma.archiveDocument.create({
      data: {
        title: body.title,
        categoryId: body.categoryId,
        documentDate: new Date(body.documentDate),
        tags: body.tags || [],
        filePath: body.filePath,
        relatedLetterId: body.relatedLetterId,
        relatedTransactionId: body.relatedTransactionId,
        retentionDays: retentionDays ? Number(retentionDays) : undefined,
        expiryDate,
        createdById: user!.id,
      },
      include: {
        createdBy: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json({ data: document });
  } catch (error) {
    console.error("Error creating archive document:", error);
    return NextResponse.json({ error: "Gagal menambah dokumen arsip" }, { status: 500 });
  }
}
