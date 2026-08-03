import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ data: notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Gagal memuat notifikasi" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const notification = await prisma.notification.create({
      data: {
        userId: body.userId,
        title: body.title,
        message: body.message,
        type: body.type,
      },
    });

    return NextResponse.json({ data: notification });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json({ error: "Gagal membuat notifikasi" }, { status: 500 });
  }
}
