import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });
    }

    const role = await prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      return NextResponse.json({ error: "Peran tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ data: role });
  } catch (error) {
    console.error("Error fetching role:", error);
    return NextResponse.json({ error: "Gagal memuat peran" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, description, permissions } = body;

    if (!id) {
      return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });
    }

    const role = await prisma.role.update({
      where: { id },
      data: {
        name,
        description,
        permissions: permissions || {},
      },
    });

    return NextResponse.json({ data: role });
  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json({ error: "Gagal memperbarui peran" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });
    }

    await prisma.role.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting role:", error);
    return NextResponse.json({ error: "Gagal menghapus peran" }, { status: 500 });
  }
}
