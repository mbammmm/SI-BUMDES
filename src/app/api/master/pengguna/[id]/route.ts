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
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });
    }

    const userData = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        isActive: true,
        roleId: true,
        createdAt: true,
        role: {
          select: { name: true, permissions: true },
        },
      },
    });

    if (!userData) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ data: userData });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Gagal memuat pengguna" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const userPermissions = user!.role?.permissions as Record<string, any> || {};
    const permissions = getPermissions(userPermissions);

    if (!hasPermission(permissions, "users:crud")) {
      return NextResponse.json({ error: "Tidak memiliki akses" }, { status: 403 });
    }
    const body = await request.json();
    const { id, name, email, roleId, isActive, password } = body;

    if (!id) {
      return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });
    }

    const updateData: any = { name, email, roleId, isActive };
    if (password) {
      const { hashPassword } = await import("@/lib/auth");
      updateData.passwordHash = await hashPassword(password);
    }

    const userData = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        isActive: true,
        roleId: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Gagal memperbarui pengguna" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const userPermissions = user!.role?.permissions as Record<string, any> || {};
    const permissions = getPermissions(userPermissions);

    if (!hasPermission(permissions, "users:crud")) {
      return NextResponse.json({ error: "Tidak memiliki akses" }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Gagal menghapus pengguna" }, { status: 500 });
  }
}
