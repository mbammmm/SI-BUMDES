import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { hasPermission, getPermissions } from "@/lib/rbac";

export async function GET() {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

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
    const { user, error } = await requireAuth();
    if (error) return error;

    const userPermissions = user!.role?.permissions as Record<string, any> || {};
    const permissions = getPermissions(userPermissions);

    if (!hasPermission(permissions, "accounting:crud")) {
      return NextResponse.json({ error: "Tidak memiliki akses" }, { status: 403 });
    }
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
