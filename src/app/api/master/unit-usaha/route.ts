import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { hasPermission, type Permission } from "@/lib/rbac";

export async function GET() {
  try {
    const units = await prisma.unitUsaha.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ data: units });
  } catch (error) {
    console.error("Error fetching unit usaha:", error);
    return NextResponse.json({ error: "Gagal memuat unit usaha" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const userPermissions = user!.role?.permissions as Record<string, any> || {};
    const { getPermissions } = await import("@/lib/rbac");
    const permissions = getPermissions(userPermissions);

    if (!hasPermission(permissions, "users:crud")) {
      return NextResponse.json({ error: "Tidak memiliki akses" }, { status: 403 });
    }

    const body = await request.json();
    const unit = await prisma.unitUsaha.create({
      data: {
        name: body.name,
        type: body.type,
        startDate: new Date(body.startDate),
        initialCapital: body.initialCapital,
        description: body.description,
      },
    });
    return NextResponse.json({ data: unit });
  } catch (error) {
    console.error("Error creating unit usaha:", error);
    return NextResponse.json({ error: "Gagal menambah unit usaha" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const userPermissions = user!.role?.permissions as Record<string, any> || {};
    const { getPermissions, hasPermission } = await import("@/lib/rbac");
    const permissions = getPermissions(userPermissions);

    if (!hasPermission(permissions, "users:crud")) {
      return NextResponse.json({ error: "Tidak memiliki akses" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });
    }

    await prisma.unitUsaha.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting unit usaha:", error);
    return NextResponse.json({ error: "Gagal menghapus unit usaha" }, { status: 500 });
  }
}
