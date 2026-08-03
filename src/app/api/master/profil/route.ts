import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const profile = await prisma.bUMDesProfile.findFirst();
    return NextResponse.json({ data: profile });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Gagal memuat profil" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const existing = await prisma.bUMDesProfile.findFirst();

    if (!existing) {
      const created = await prisma.bUMDesProfile.create({ data: body });
      return NextResponse.json({ data: created });
    }

    const updated = await prisma.bUMDesProfile.update({
      where: { id: existing.id },
      data: body,
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Gagal menyimpan profil" }, { status: 500 });
  }
}
