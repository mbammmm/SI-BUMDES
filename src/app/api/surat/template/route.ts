import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
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
    const body = await request.json();
    const template = await prisma.letterTemplate.create({
      data: {
        name: body.name,
        type: body.type,
        content: body.content,
        numberingFormat: body.numberingFormat,
      },
    });

    return NextResponse.json({ data: template });
  } catch (error) {
    console.error("Error creating letter template:", error);
    return NextResponse.json({ error: "Gagal menambah template surat" }, { status: 500 });
  }
}
