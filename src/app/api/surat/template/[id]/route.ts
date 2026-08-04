import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const template = await prisma.letterTemplate.update({
      where: { id: params.id },
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

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.letterTemplate.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting letter template:", error);
    return NextResponse.json({ error: "Gagal menghapus template surat" }, { status: 500 });
  }
}
