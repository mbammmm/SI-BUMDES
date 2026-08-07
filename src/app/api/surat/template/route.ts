import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { hasPermission, getPermissions } from "@/lib/rbac";

export async function GET() {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const templates = await prisma.letterTemplate.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ data: templates });
  } catch (error) {
    console.error("Error fetching letter templates:", error);
    return NextResponse.json({ error: "Gagal memuat template surat" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const userPermissions = user!.role?.permissions as Record<string, any> || {};
    const permissions = getPermissions(userPermissions);

    if (!hasPermission(permissions, "letters:crud")) {
      return NextResponse.json({ error: "Tidak memiliki akses" }, { status: 403 });
    }
    const body = await request.json();
    const template = await prisma.letterTemplate.create({
      data: {
        name: body.name,
        type: body.type,
        content: body.content,
        numberingFormat: body.numberingFormat || null,
      },
    });

    return NextResponse.json({ data: template });
  } catch (error) {
    console.error("Error creating letter template:", error);
    return NextResponse.json({ error: "Gagal menambah template surat" }, { status: 500 });
  }
}
