import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { hasPermission, type Permission } from "@/lib/rbac";
import { logAuditEvent } from "@/lib/audit-logger";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const unitUsahaId = searchParams.get("unitUsahaId");
    const status = searchParams.get("status");

    const where: any = {};
    if (unitUsahaId) where.unitUsahaId = unitUsahaId;
    if (status) where.status = status;
    where.isDeleted = false;

    const assets = await prisma.asset.findMany({
      where,
      include: {
        createdBy: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: assets });
  } catch (error) {
    console.error("Error fetching assets:", error);
    return NextResponse.json({ error: "Gagal memuat aset" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const userPermissions = user!.role?.permissions as Record<string, any> || {};
    const { getPermissions } = await import("@/lib/rbac");
    const permissions = getPermissions(userPermissions);

    if (!hasPermission(permissions, "assets:input") && !hasPermission(permissions, "assets:crud")) {
      return NextResponse.json({ error: "Tidak memiliki akses" }, { status: 403 });
    }

    const body = await request.json();
    const asset = await prisma.asset.create({
      data: {
        name: body.name,
        category: body.category,
        acquisitionDate: new Date(body.acquisitionDate),
        acquisitionValue: body.acquisitionValue,
        usefulLife: Number(body.usefulLife),
        salvageValue: body.salvageValue || 0,
        unitUsahaId: body.unitUsahaId,
        condition: body.condition || "baik",
        photoPath: body.photoPath,
        createdById: user!.id,
      },
      include: {
        createdBy: {
          select: { name: true },
        },
      },
    });

    await logAuditEvent({
      userId: user!.id,
      action: "create",
      entityType: "Asset",
      entityId: asset.id,
      changes: { name: body.name, category: body.category, acquisitionValue: body.acquisitionValue },
    });

    return NextResponse.json({ data: asset });
  } catch (error) {
    console.error("Error creating asset:", error);
    return NextResponse.json({ error: "Gagal menambah aset" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const userPermissions = user!.role?.permissions as Record<string, any> || {};
    const { getPermissions } = await import("@/lib/rbac");
    const permissions = getPermissions(userPermissions);

    if (!hasPermission(permissions, "assets:crud")) {
      return NextResponse.json({ error: "Tidak memiliki akses menghapus" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID aset diperlukan" }, { status: 400 });
    }

    const existing = await prisma.asset.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Aset tidak ditemukan" }, { status: 404 });
    }

    if (existing.isDeleted) {
      return NextResponse.json({ error: "Aset sudah dihapus" }, { status: 400 });
    }

    await prisma.asset.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        status: "hapusbukukan",
      },
    });

    await logAuditEvent({
      userId: user!.id,
      action: "delete",
      entityType: "Asset",
      entityId: id,
      changes: { softDeleted: true, previousStatus: existing.status },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting asset:", error);
    return NextResponse.json({ error: "Gagal menghapus aset" }, { status: 500 });
  }
}
