import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/api-auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ user: null });
    }

    const userWithRole = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        role: {
          select: { name: true, permissions: true },
        },
      },
    });

    return NextResponse.json({ user: userWithRole });
  } catch (error) {
    console.error("Error fetching current user:", error);
    return NextResponse.json({ user: null });
  }
}
