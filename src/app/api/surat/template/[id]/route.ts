import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { hasPermission, getPermissions } from "@/lib/rbac";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const userPermissions = user!.role?.permissions as Record<string, any> || {};
    const permissions = getPermissions(userPermissions);

    if (!hasPermission(permissions, "letters:crud")) {
      return NextResponse.json({ error: "Tidak memiliki akses" }, { status: 403 });
    }
    const { id } = await params;
    const body = await request.json();
    const template = await prisma.letterTemplate.update({
      where: { id },
      data: {
        name: body.name,
        type: body.type,
        content: body.content,
        numberingFormat: body.numberingFormat || null,
      },
    });

    return NextResponse.json({ data: template });
  } catch (error) {
    console.error("Error updating letter template:", error);
    return NextResponse.json({ error: "Gagal memperbarui template surat" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const userPermissions = user!.role?.permissions as Record<string, any> || {};
    const permissions = getPermissions(userPermissions);

    if (!hasPermission(permissions, "letters:crud")) {
      return NextResponse.json({ error: "Tidak memiliki akses" }, { status: 403 });
    }
    const { id } = await params;
    await prisma.letterTemplate.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting letter template:", error);
    return NextResponse.json({ error: "Gagal menghapus template surat" }, { status: 500 });
  }
}
