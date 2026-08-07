export async function createNotification(params: {
  userId?: string;
  roleName?: string;
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "approval";
}) {
  const body: any = {
    title: params.title,
    message: params.message,
    type: params.type || "info",
  };

  if (params.userId) {
    body.userId = params.userId;
  }
  if (params.roleName) {
    body.roleName = params.roleName;
  }

  const res = await fetch("/api/notifikasi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Gagal mengirim notifikasi" }));
    throw new Error(error.error || "Gagal mengirim notifikasi");
  }

  return true;
}

export async function notifyRole(roleName: string, title: string, message: string, type?: "info" | "success" | "warning" | "approval") {
  return createNotification({ roleName, title, message, type });
}

export async function notifyUser(userId: string, title: string, message: string, type?: "info" | "success" | "warning" | "approval") {
  return createNotification({ userId, title, message, type });
}
