import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { hasPermission, type Permission } from "@/lib/rbac";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const where: any = {};
    if (type) where.type = type;

    const letters = await prisma.letter.findMany({
      where,
      include: {
        createdBy: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: letters });
  } catch (error) {
    console.error("Error fetching letters:", error);
    return NextResponse.json({ error: "Gagal memuat surat" }, { status: 500 });
  }
}

async function generateLetterNumber(type: string, templateId?: string, letterDate?: string): Promise<string> {
  const baseDate = letterDate ? new Date(letterDate) : new Date();
  const year = baseDate.getFullYear();
  const month = String(baseDate.getMonth() + 1).padStart(2, "0");

  if (type === "keluar") {
    const count = prisma.letter.count({
      where: {
        type: "keluar",
        createdAt: {
          gte: new Date(`${year}-${month}-01`),
        },
      },
    });
    return new Promise((resolve) => {
      count.then((c) => {
        const sequence = c + 1;
        resolve(`${String(sequence).padStart(3, "0")}/BUMDes/${month}/${year}`);
      });
    });
  }

  if (type === "masuk") {
    const count = prisma.letter.count({
      where: {
        type: "masuk",
        createdAt: {
          gte: new Date(`${year}-${month}-01`),
        },
      },
    });
    return new Promise((resolve) => {
      count.then((c) => {
        const sequence = c + 1;
        resolve(`IN-${String(sequence).padStart(3, "0")}/${month}/${year}`);
      });
    });
  }

  return Promise.resolve(`LET-${Date.now()}`);
}

export async function POST(request: Request) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const userPermissions = user!.role?.permissions as Record<string, any> || {};
    const { getPermissions } = await import("@/lib/rbac");
    const permissions = getPermissions(userPermissions);

    if (!hasPermission(permissions, "letters:input") && !hasPermission(permissions, "letters:crud")) {
      return NextResponse.json({ error: "Tidak memiliki akses" }, { status: 403 });
    }

    const body = await request.json();
    const { type, subject, content, outgoingDate, incomingDate, sender, recipient, templateId } = body;

    const letterDate = type === "keluar" ? outgoingDate : incomingDate;
    const number = await generateLetterNumber(type, templateId, letterDate);

    const letter = await prisma.letter.create({
      data: {
        number,
        subject,
        type,
        content,
        outgoingDate: outgoingDate ? new Date(outgoingDate) : null,
        incomingDate: incomingDate ? new Date(incomingDate) : null,
        sender,
        recipient,
        status: type === "keluar" ? "draft" : "received",
        createdById: user!.id,
      },
      include: {
        createdBy: {
          select: { name: true },
        },
      },
    });

    if (type === "keluar" && body.firstApproverId) {
      await prisma.approvalStep.create({
        data: {
          letterId: letter.id,
          stepOrder: 1,
          approverId: body.firstApproverId,
          status: "pending",
        },
      });
    }

    return NextResponse.json({ data: letter });
  } catch (error) {
    console.error("Error creating letter:", error);
    return NextResponse.json({ error: "Gagal menambah surat" }, { status: 500 });
  }
}
