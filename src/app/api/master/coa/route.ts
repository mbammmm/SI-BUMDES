import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const accounts = await prisma.chartOfAccount.findMany({
      orderBy: { code: "asc" },
    });
    return NextResponse.json({ data: accounts });
  } catch (error) {
    console.error("Error fetching COA:", error);
    return NextResponse.json({ error: "Gagal memuat chart of account" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const account = await prisma.chartOfAccount.create({
      data: {
        code: body.code,
        name: body.name,
        category: body.category,
        type: body.type,
        parentId: body.parentId || null,
      },
    });
    return NextResponse.json({ data: account });
  } catch (error) {
    console.error("Error creating COA:", error);
    return NextResponse.json({ error: "Gagal menambah akun" }, { status: 500 });
  }
}
