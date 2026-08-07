import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { getPermissions, canAccess, hasPermission } from "@/lib/rbac";

export const dynamic = "force-dynamic";

const DEFAULT_SETTINGS = [
  { name: "pendapatan_asli_desa", percentage: 10, description: "Pendapatan Asli Desa" },
  { name: "cadangan", percentage: 20, description: "Cadangan Umum" },
  { name: "dana_sosial", percentage: 10, description: "Dana Sosial" },
  { name: "pengembangan", percentage: 60, description: "Pengembangan Desa" },
];

async function ensureDefaultSettings() {
  for (const setting of DEFAULT_SETTINGS) {
    const existing = await prisma.shuAllocationSetting.findUnique({
      where: { name: setting.name },
    });
    if (!existing) {
      await prisma.shuAllocationSetting.create({
        data: {
          name: setting.name,
          percentage: setting.percentage,
          description: setting.description,
        },
      });
    }
  }
}

export async function GET(request: Request) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const userPermissions = getPermissions(user.role.permissions as Record<string, any>);
    if (!canAccess(userPermissions, "accounting", "read")) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    await ensureDefaultSettings();

    const settings = await prisma.shuAllocationSetting.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error fetching SHU settings:", error);
    return NextResponse.json({ error: "Gagal memuat pengaturan SHU" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const userPermissions = getPermissions(user.role.permissions as Record<string, any>);
    if (!hasPermission(userPermissions, "accounting:crud")) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const body = await request.json();
    const { name, percentage, description } = body;

    if (!name || percentage === undefined) {
      return NextResponse.json({ error: "Nama dan persentase wajib diisi" }, { status: 400 });
    }

    const newSetting = await prisma.shuAllocationSetting.create({
      data: {
        name,
        percentage: Number(percentage),
        description: description || null,
      },
    });

    return NextResponse.json({ setting: newSetting });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Pengaturan dengan nama ini sudah ada" }, { status: 409 });
    }
    console.error("Error creating SHU setting:", error);
    return NextResponse.json({ error: "Gagal membuat pengaturan" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const userPermissions = getPermissions(user.role.permissions as Record<string, any>);
    if (!hasPermission(userPermissions, "accounting:crud")) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const body = await request.json();
    const { id, percentage, description } = body;

    if (!id || percentage === undefined) {
      return NextResponse.json({ error: "ID dan persentase wajib diisi" }, { status: 400 });
    }

    const updatedSetting = await prisma.shuAllocationSetting.update({
      where: { id: Number(id) },
      data: {
        percentage: Number(percentage),
        description: description || null,
      },
    });

    return NextResponse.json({ setting: updatedSetting });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Pengaturan tidak ditemukan" }, { status: 404 });
    }
    console.error("Error updating SHU setting:", error);
    return NextResponse.json({ error: "Gagal memperbarui pengaturan" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const userPermissions = getPermissions(user.role.permissions as Record<string, any>);
    if (!hasPermission(userPermissions, "accounting:crud")) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID wajib diisi" }, { status: 400 });
    }

    await prisma.shuAllocationSetting.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Pengaturan tidak ditemukan" }, { status: 404 });
    }
    console.error("Error deleting SHU setting:", error);
    return NextResponse.json({ error: "Gagal menghapus pengaturan" }, { status: 500 });
  }
}
