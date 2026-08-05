"use client";

import { useEffect, useState } from "react";
import { Clock, Filter } from "lucide-react";
import { usePermission } from "@/hooks/use-permission";

type AuditLog = {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  changes: Record<string, any> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
};

export default function AuditLogPage() {
  const { allowed, loading } = usePermission({ module: "users", minLevel: "crud" });
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [filterEntityType, setFilterEntityType] = useState("");
  const [filterAction, setFilterAction] = useState("");

  async function loadData() {
    try {
      const params = new URLSearchParams();
      if (filterEntityType) params.set("entityType", filterEntityType);
      if (filterAction) params.set("action", filterAction);

      const res = await fetch(`/api/audit-logs?${params.toString()}`);
      const json = await res.json();
      setLogs(json.data || []);
    } catch (error) {
      console.error("Failed to load audit logs:", error);
    } finally {
      setDataLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [filterEntityType, filterAction]);

  if (dataLoading) return <div className="p-6">Memuat...</div>;
  if (!allowed) return null;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock size={24} className="text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">Audit Trail</h1>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={18} className="text-gray-600" />
          <h2 className="font-semibold text-gray-900">Filter</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Tipe Entitas</label>
            <select
              value={filterEntityType}
              onChange={(e) => setFilterEntityType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
            >
              <option value="">Semua Tipe</option>
              <option value="Transaction">Transaksi</option>
              <option value="Letter">Surat</option>
              <option value="Asset">Aset</option>
              <option value="ArchiveDocument">Arsip</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Aksi</label>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
            >
              <option value="">Semua Aksi</option>
              <option value="create">Buat</option>
              <option value="update">Perbarui</option>
              <option value="delete">Hapus</option>
              <option value="approve">Setujui</option>
              <option value="reject">Tolak</option>
              <option value="post">Posting</option>
              <option value="unpost">Unposting</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Log Aktivitas ({logs.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-gray-900 font-semibold">Tanggal</th>
                <th className="text-left px-4 py-3 text-gray-900 font-semibold">Pengguna</th>
                <th className="text-left px-4 py-3 text-gray-900 font-semibold">Aksi</th>
                <th className="text-left px-4 py-3 text-gray-900 font-semibold">Entitas</th>
                <th className="text-left px-4 py-3 text-gray-900 font-semibold">ID Entitas</th>
                <th className="text-left px-4 py-3 text-gray-900 font-semibold">Perubahan</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 text-gray-900">
                    {new Date(log.createdAt).toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-3 text-gray-900">{log.user?.name || "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      log.action === "create" ? "bg-green-50 text-green-700" :
                      log.action === "update" ? "bg-blue-50 text-blue-700" :
                      log.action === "delete" ? "bg-red-50 text-red-700" :
                      "bg-gray-50 text-gray-700"
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-900">{log.entityType}</td>
                  <td className="px-4 py-3 text-gray-900">{log.entityId}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {log.changes ? JSON.stringify(log.changes) : "-"}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Belum ada log aktivitas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
