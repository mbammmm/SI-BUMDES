import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { hasPermission, getPermissions } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get("assetId");

    if (!assetId) {
      return NextResponse.json({ error: "ID aset diperlukan" }, { status: 400 });
    }

    const mutations = await prisma.assetMutation.findMany({
      where: { assetId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: mutations });
  } catch (error) {
    console.error("Error fetching asset mutations:", error);
    return NextResponse.json({ error: "Gagal memuat mutasi aset" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const userPermissions = user!.role?.permissions as Record<string, any> || {};
    const permissions = getPermissions(userPermissions);

    if (!hasPermission(permissions, "assets:input")) {
      return NextResponse.json({ error: "Tidak memiliki akses" }, { status: 403 });
    }
    const body = await request.json();
    const mutation = await prisma.assetMutation.create({
      data: {
        assetId: body.assetId,
        type: body.type,
        description: body.description,
        fromValue: body.fromValue,
        toValue: body.toValue,
        createdById: body.createdById,
      },
    });

    return NextResponse.json({ data: mutation });
  } catch (error) {
    console.error("Error creating asset mutation:", error);
    return NextResponse.json({ error: "Gagal menambah mutasi aset" }, { status: 500 });
  }
}
