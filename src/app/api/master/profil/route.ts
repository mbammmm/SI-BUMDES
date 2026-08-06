import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { hasPermission, getPermissions } from "@/lib/rbac";

export async function GET() {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const profile = await prisma.bUMDesProfile.findFirst();
    return NextResponse.json({ data: profile });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Gagal memuat profil" }, { status: 500 });
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
    const existing = await prisma.bUMDesProfile.findFirst();

    if (!existing) {
      const created = await prisma.bUMDesProfile.create({ data: body });
      return NextResponse.json({ data: created });
    }

    const updated = await prisma.bUMDesProfile.update({
      where: { id: existing.id },
      data: body,
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Gagal menyimpan profil" }, { status: 500 });
  }
}
