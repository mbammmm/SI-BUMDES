import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { hasPermission, getPermissions } from "@/lib/rbac";

export async function GET() {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const categories = await prisma.documentCategory.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error("Error fetching document categories:", error);
    return NextResponse.json({ error: "Gagal memuat kategori dokumen" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const userPermissions = user!.role?.permissions as Record<string, any> || {};
    const permissions = getPermissions(userPermissions);

    if (!hasPermission(permissions, "archives:crud")) {
      return NextResponse.json({ error: "Tidak memiliki akses" }, { status: 403 });
    }
    const body = await request.json();
    const category = await prisma.documentCategory.create({
      data: {
        name: body.name,
        description: body.description,
        retentionDays: body.retentionDays,
      },
    });

    return NextResponse.json({ data: category });
  } catch (error) {
    console.error("Error creating document category:", error);
    return NextResponse.json({ error: "Gagal menambah kategori dokumen" }, { status: 500 });
  }
}
