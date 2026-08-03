import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, getCurrentUser } from "@/lib/api-auth";
import { hasPermission, type Permission } from "@/lib/rbac";

export async function GET() {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const currentUser = user!;
    const userPermissions = currentUser.role?.permissions as Record<string, any> || {};
    const { getPermissions } = await import("@/lib/rbac");
    const permissions = getPermissions(userPermissions);

    if (!hasPermission(permissions, "users:read") && !hasPermission(permissions, "users:crud")) {
      return NextResponse.json({ error: "Tidak memiliki akses" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        isActive: true,
        roleId: true,
        createdAt: true,
        role: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Gagal memuat pengguna" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { user: currentUser, error } = await requireAuth();
    if (error) return error;

    const userPermissions = currentUser!.role?.permissions as Record<string, any> || {};
    const { getPermissions, hasPermission } = await import("@/lib/rbac");
    const permissions = getPermissions(userPermissions);

    if (!hasPermission(permissions, "users:crud")) {
      return NextResponse.json({ error: "Tidak memiliki akses" }, { status: 403 });
    }

    const body = await request.json();
    const { username, email, name, password, roleId, isActive } = body;

    if (!username || !email || !name || !password || !roleId) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email atau username sudah digunakan" }, { status: 409 });
    }

    const { hashPassword } = await import("@/lib/auth");
    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        name,
        passwordHash,
        roleId,
        isActive: isActive ?? true,
      },
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
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Gagal menambah pengguna" }, { status: 500 });
  }
}
