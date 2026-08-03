import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
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
    const body = await request.json();
    const { name, description, permissions } = body;

    if (!name) {
      return NextResponse.json({ error: "Nama peran wajib diisi" }, { status: 400 });
    }

    const role = await prisma.role.create({
      data: {
        name,
        description,
        permissions: permissions || {},
      },
    });

    return NextResponse.json({ data: role });
  } catch (error) {
    console.error("Error creating role:", error);
    return NextResponse.json({ error: "Gagal menambah peran" }, { status: 500 });
  }
}
