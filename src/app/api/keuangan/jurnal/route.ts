import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const entries = await prisma.journalEntry.findMany({
      include: {
        lines: true,
      },
      orderBy: { entryDate: "desc" },
    });

    return NextResponse.json({ data: entries });
  } catch (error) {
    console.error("Error fetching journal entries:", error);
    return NextResponse.json({ error: "Gagal memuat jurnal" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const entry = await prisma.journalEntry.create({
      data: {
        entryDate: new Date(body.entryDate),
        description: body.description,
        reference: body.reference,
        isPosted: body.isPosted || false,
        createdById: body.createdById,
        lines: {
          create: body.lines.map((line: any) => ({
            accountCode: line.accountCode,
            debit: line.debit || 0,
            credit: line.credit || 0,
            description: line.description,
          })),
        },
      },
      include: {
        lines: true,
      },
    });

    return NextResponse.json({ data: entry });
  } catch (error) {
    console.error("Error creating journal entry:", error);
    return NextResponse.json({ error: "Gagal menambah jurnal" }, { status: 500 });
  }
}
