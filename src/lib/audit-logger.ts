import prisma from "@/lib/prisma";

type AuditAction = "create" | "update" | "delete" | "approve" | "reject" | "post" | "unpost";

interface AuditLogParams {
  userId: string | null;
  action: AuditAction;
  entityType: string;
  entityId: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

let auditLoggerDisabled = false;

function suppressAuditLog() {
  auditLoggerDisabled = true;
}

function restoreAuditLog() {
  auditLoggerDisabled = false;
}

export async function logAuditEvent(params: AuditLogParams) {
  if (auditLoggerDisabled) return;

  const {
    userId,
    action,
    entityType,
    entityId,
    changes,
    ipAddress,
    userAgent,
  } = params;

  try {
    if (!userId) return;

    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        changes: changes || undefined,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}

export { suppressAuditLog, restoreAuditLog, type AuditAction };
