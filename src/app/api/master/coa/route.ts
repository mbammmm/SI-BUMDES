import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { hasPermission, getPermissions } from "@/lib/rbac";

export async function GET() {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const accounts = await prisma.chartOfAccount.findMany({
      orderBy: { code: "asc" },
    });
    return NextResponse.json({ data: accounts });
  } catch (error) {
    console.error("Error fetching COA:", error);
    return NextResponse.json({ error: "Gagal memuat chart of account" }, { status: 500 });
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
    const account = await prisma.chartOfAccount.create({
      data: {
        code: body.code,
        name: body.name,
        category: body.category,
        type: body.type,
        parentId: body.parentId || null,
      },
    });
    return NextResponse.json({ data: account });
  } catch (error) {
    console.error("Error creating COA:", error);
    return NextResponse.json({ error: "Gagal menambah akun" }, { status: 500 });
  }
}
