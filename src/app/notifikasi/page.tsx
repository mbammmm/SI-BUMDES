"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCircle, Trash2, Info, AlertTriangle, CheckCircle2, Users } from "lucide-react";
import { usePermission } from "@/hooks/use-permission";
import { useAutoRefresh } from "@/hooks/use-auto-refresh";
import { useRefreshOnEvent } from "@/hooks/use-refresh-on-event";
import { offlineFetch } from "@/lib/offline-fetch";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

type Role = {
  id: string;
  name: string;
};

const typeConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  info: { icon: <Info size={18} />, color: "text-blue-700 bg-blue-50" },
  warning: { icon: <AlertTriangle size={18} />, color: "text-yellow-700 bg-yellow-50" },
  success: { icon: <CheckCircle2 size={18} />, color: "text-green-700 bg-green-50" },
  approval: { icon: <CheckCircle size={18} />, color: "text-primary bg-primary/10" },
};

export default function NotifikasiPage() {
  const { allowed, loading } = usePermission({ module: "notifications", minLevel: "read" });
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((json) => {
        setCurrentUserRole(json.user?.role?.name || null);
      });

    fetch("/api/master/roles")
      .then((res) => res.json())
      .then((json) => setRoles(json.data || []));
  }, []);

  const { data: notifications, loading: dataLoading, error, refetch } = useAutoRefresh<Notification[]>(
    async () => {
      const params = new URLSearchParams();
      if (selectedRole) params.set("roleName", selectedRole);
      if (!selectedRole) params.set("unread", "true");

      const res = await fetch(`/api/notifikasi?${params.toString()}`);
      const json = await res.json();
      return json.data || [];
    },
    [selectedRole]
  );

  const { data: unreadData } = useAutoRefresh<{ unreadCount: number }>(
    async () => {
      const res = await fetch("/api/notifikasi?unread=true");
      return res.json();
    }
  );

  useEffect(() => {
    if (unreadData?.unreadCount !== undefined) {
      setUnreadCount(unreadData.unreadCount);
    }
  }, [unreadData]);

  useRefreshOnEvent(refetch);

  async function markAsRead(id: string) {
    await offlineFetch("/api/notifikasi", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isRead: true }),
    });
    refetch();
  }

  async function markAllAsRead() {
    await offlineFetch("/api/notifikasi", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: true }),
    });
    refetch();
  }

  async function deleteNotification(id: string) {
    await offlineFetch(`/api/notifikasi?id=${id}`, { method: "DELETE" });
    refetch();
  }

  if (loading || dataLoading) return <div className="p-6">Memuat...</div>;
  if (!allowed) return null;

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifikasi</h1>
          <p className="text-sm text-gray-600 mt-1">
            {unreadCount > 0
              ? `${unreadCount} notifikasi belum dibaca`
              : "Semua notifikasi sudah dibaca"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <CheckCircle size={16} />
            Tandai semua dibaca
          </button>
        )}
      </div>

      {currentUserRole === "Admin Sistem" && (
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-900 mb-1">Filter Notifikasi (Role)</label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
          >
            <option value="">Notifikasi Saya</option>
            {roles.map((role) => (
              <option key={role.id} value={role.name}>{role.name}</option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 rounded border border-red-200">
          {error}
        </div>
      )}

      {!notifications || notifications.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
          <Bell size={40} className="mx-auto mb-3 text-gray-300" />
          Belum ada notifikasi
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const config = typeConfig[notification.type] || typeConfig.info;
            return (
              <div
                key={notification.id}
                className={`bg-white rounded-lg border p-4 flex items-start gap-4 ${
                  notification.isRead ? "border-gray-200" : "border-primary/30 bg-primary/5"
                }`}
              >
                <div className={`p-2 rounded-lg ${config.color}`}>{config.icon}</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{notification.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(notification.createdAt).toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-2 text-gray-600 hover:text-primary transition"
                      title="Tandai dibaca"
                    >
                      <CheckCircle size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="p-2 text-gray-600 hover:text-red-600 transition"
                    title="Hapus"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
