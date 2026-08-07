import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { sendEmail, generateApprovalEmailHtml } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const onlyUnread = searchParams.get("unread") === "true";
    const roleName = searchParams.get("roleName");

    let targetUserId: string | undefined;

    if (roleName) {
      const isAdmin = user!.role?.name === "Admin Sistem";
      if (!isAdmin) {
        return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });
      }

      const usersInRole = await prisma.user.findMany({
        where: {
          role: { name: roleName },
          isActive: true,
        },
        select: { id: true },
      });

      if (usersInRole.length === 0) {
        return NextResponse.json({ data: [], unreadCount: 0 });
      }

      const targetIds = usersInRole.map((u: any) => u.id);
      const notifications = await prisma.notification.findMany({
        where: {
          userId: { in: targetIds },
          ...(onlyUnread ? { isRead: false } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      const unreadCount = await prisma.notification.count({
        where: {
          userId: { in: targetIds },
          isRead: false,
        },
      });

      return NextResponse.json({ data: notifications, unreadCount });
    }

    const where: any = {
      userId: user!.id,
    };
    if (onlyUnread) {
      where.isRead = false;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: {
        userId: user!.id,
        isRead: false,
      },
    });

    return NextResponse.json({ data: notifications, unreadCount });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Gagal memuat notifikasi" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const body = await request.json();
    
    // Support creating notification for self or for specific user/role
    let targetUserId = body.userId;
    
    if (!targetUserId && body.roleName) {
      const usersInRole = await prisma.user.findMany({
        where: {
          role: { name: body.roleName },
          isActive: true,
        },
        select: { id: true, email: true, name: true },
      });
      
      if (usersInRole.length === 0) {
        return NextResponse.json({ error: `Tidak ada user aktif dengan role ${body.roleName}` }, { status: 404 });
      }
      
      for (const u of usersInRole) {
        await prisma.notification.create({
          data: {
            userId: u.id,
            title: body.title,
            message: body.message,
            type: body.type || "info",
          },
        });

        if (u.email && process.env.SMTP_HOST && process.env.SMTP_HOST !== "localhost") {
          const html = generateApprovalEmailHtml(body.title, body.message);
          await sendEmail({
            to: u.email,
            subject: body.title,
            html,
          });
        }
      }
      
      return NextResponse.json({ ok: true, count: usersInRole.length });
    }
    
    if (!targetUserId) {
      targetUserId = user!.id;
    }

     const notification = await prisma.notification.create({
       data: {
         userId: targetUserId,
         title: body.title,
         message: body.message,
         type: body.type || "info",
       },
      });

      Promise.resolve().then(async () => {
        const user = await prisma.user.findUnique({
          where: { id: targetUserId },
          select: { email: true, name: true },
        });
        if (user?.email && process.env.SMTP_HOST && process.env.SMTP_HOST !== "localhost") {
          const html = generateApprovalEmailHtml(body.title, body.message);
          await sendEmail({
            to: user.email,
            subject: body.title,
            html,
          });
       }
     });

     return NextResponse.json({ data: notification });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json({ error: "Gagal membuat notifikasi" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const body = await request.json();
    const { id, isRead } = body;

    if (!id) {
      return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });
    }

    const notification = await prisma.notification.updateMany({
      where: {
        id,
        userId: user!.id,
      },
      data: {
        isRead: isRead ?? true,
      },
    });

    return NextResponse.json({ data: notification });
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json({ error: "Gagal memperbarui notifikasi" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });
    }

    await prisma.notification.deleteMany({
      where: {
        id,
        userId: user!.id,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json({ error: "Gagal menghapus notifikasi" }, { status: 500 });
  }
}
