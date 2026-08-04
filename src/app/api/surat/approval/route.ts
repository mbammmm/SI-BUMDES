import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const letterId = searchParams.get("letterId");

    if (!letterId) {
      return NextResponse.json({ error: "ID surat diperlukan" }, { status: 400 });
    }

    const approvals = await prisma.approvalStep.findMany({
      where: { letterId },
      include: {
        approver: {
          select: { name: true, username: true },
        },
      },
      orderBy: { stepOrder: "asc" },
    });

    return NextResponse.json({ data: approvals });
  } catch (error) {
    console.error("Error fetching approvals:", error);
    return NextResponse.json({ error: "Gagal memuat approval" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const body = await request.json();
    const { letterId, stepOrder, approverId, status, notes } = body;

    const approval = await prisma.approvalStep.create({
      data: {
        letterId,
        stepOrder,
        approverId,
        status: status || "pending",
        notes,
      },
    });

    const approvalWithApprover = await prisma.approvalStep.findUnique({
      where: { id: approval.id },
      include: {
        approver: {
          select: { name: true, username: true },
        },
      },
    });

    return NextResponse.json({ data: approvalWithApprover });
  } catch (error) {
    console.error("Error creating approval:", error);
    return NextResponse.json({ error: "Gagal menambah approval" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const body = await request.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });
    }

    const existing = await prisma.approvalStep.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Approval tidak ditemukan" }, { status: 404 });
    }

    if (existing.approverId !== user!.id) {
      return NextResponse.json({ error: "Tidak memiliki akses untuk approval ini" }, { status: 403 });
    }

    const approval = await prisma.approvalStep.update({
      where: { id },
      data: {
        status,
        notes,
        decidedAt: new Date(),
      },
    });

    const approvalWithApprover = await prisma.approvalStep.findUnique({
      where: { id: approval.id },
      include: {
        approver: {
          select: { name: true, username: true },
        },
      },
    });

    if (status === "approved") {
      const pendingCount = await prisma.approvalStep.count({
        where: {
          letterId: existing.letterId,
          status: "pending",
        },
      });

      if (pendingCount === 0) {
        await prisma.letter.update({
          where: { id: existing.letterId },
          data: { status: "approved" },
        });
      }
    }

    if (status === "rejected") {
      await prisma.letter.update({
        where: { id: existing.letterId },
        data: { status: "rejected" },
      });
    }

    return NextResponse.json({ data: approvalWithApprover });
  } catch (error) {
    console.error("Error updating approval:", error);
    return NextResponse.json({ error: "Gagal memperbarui approval" }, { status: 500 });
  }
}
