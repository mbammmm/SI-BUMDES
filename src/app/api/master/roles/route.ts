import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { hasPermission, getPermissions } from "@/lib/rbac";

export async function GET() {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const roles = await prisma.role.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ data: roles });
  } catch (error) {
    console.error("Error fetching roles:", error);
    return NextResponse.json({ error: "Gagal memuat peran" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const userPermissions = user!.role?.permissions as Record<string, any> || {};
    const permissions = getPermissions(userPermissions);

    if (!hasPermission(permissions, "users:crud")) {
      return NextResponse.json({ error: "Tidak memiliki akses" }, { status: 403 });
    }
    const body = await request.json();
    const { name, description, rolePermissions } = body;

    if (!name) {
      return NextResponse.json({ error: "Nama peran wajib diisi" }, { status: 400 });
    }

    const role = await prisma.role.create({
      data: {
        name,
        description,
        permissions: rolePermissions || {},
      },
    });

    return NextResponse.json({ data: role });
  } catch (error) {
    console.error("Error creating role:", error);
    return NextResponse.json({ error: "Gagal menambah peran" }, { status: 500 });
  }
}
