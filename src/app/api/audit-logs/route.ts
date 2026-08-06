import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { hasPermission, getPermissions } from "@/lib/rbac";

export async function GET(request: Request) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const url = new URL(request.url);
    const entityType = url.searchParams.get("entityType");
    const entityId = url.searchParams.get("entityId");
    const action = url.searchParams.get("action");
    const limit = parseInt(url.searchParams.get("limit") || "50", 10);

    const where: any = {};
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (action) where.action = action;

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json({ data: logs });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const userPermissions = user!.role?.permissions as Record<string, any> || {};
    const permissions = getPermissions(userPermissions);

    if (!hasPermission(permissions, "users:crud")) {
      return NextResponse.json({ error: "Tidak memiliki akses" }, { status: 403 });
    }
    const body = await request.json();
    const { action, entityType, entityId, changes, ipAddress, userAgent } = body;

    const userId = user!.id || body.userId || null;

    const log = await prisma.auditLog.create({
      data: {
        userId: userId,
        action,
        entityType,
        entityId,
        changes,
        ipAddress,
        userAgent,
      },
    });

    return NextResponse.json({ data: log });
  } catch (error) {
    console.error("Error creating audit log:", error);
    return NextResponse.json({ error: "Failed to create log" }, { status: 500 });
  }
}
