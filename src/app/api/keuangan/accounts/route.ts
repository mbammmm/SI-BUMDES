import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const accounts = await prisma.chartOfAccount.findMany({
      select: {
        code: true,
        name: true,
        type: true,
      },
      orderBy: { code: "asc" },
    });

    return NextResponse.json(accounts);
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return NextResponse.json({ error: "Gagal memuat akun" }, { status: 500 });
  }
}
