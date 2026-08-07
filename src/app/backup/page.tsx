"use client";

import { useEffect, useState } from "react";
import { Database, Download, RefreshCw, Trash2, Calendar, Clock } from "lucide-react";
import { usePermission } from "@/hooks/use-permission";
import { useRefreshOnEvent } from "@/hooks/use-refresh-on-event";
import { emitRefresh } from "@/lib/refresh";

type Backup = {
  filename: string;
  path: string;
  size: number;
  createdAt: string;
};

export default function BackupPage() {
  const { allowed, loading } = usePermission({ module: "users", minLevel: "crud" });
  const [backups, setBackups] = useState<Backup[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  useRefreshOnEvent(loadData);

  async function loadData() {
    try {
      const res = await fetch("/api/backup?action=list");
      const json = await res.json();
      setBackups(json.data || []);
    } catch (error) {
      console.error("Failed to load backups:", error);
    } finally {
      setDataLoading(false);
    }
  }

  async function createBackup() {
    setCreating(true);
    setMessage("");

    const res = await fetch("/api/backup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create" }),
    });

    const json = await res.json();

    if (res.ok) {
      setMessage("Backup berhasil dibuat");
      await loadData();
      emitRefresh();
    } else {
      setMessage(json.error || "Gagal membuat backup");
    }
    setCreating(false);
  }

  async function deleteBackup(filename: string) {
    if (!confirm(`Hapus backup ${filename}?`)) return;

    const res = await fetch("/api/backup", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename }),
    });

    const json = await res.json();

    if (res.ok) {
      setMessage("Backup berhasil dihapus");
      await loadData();
    } else {
      setMessage(json.error || "Gagal menghapus backup");
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (dataLoading) return <div className="p-6">Memuat...</div>;
  if (!allowed) return null;

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Database size={24} className="text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">Backup Database</h1>
        </div>
        <button
          onClick={createBackup}
          disabled={creating}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition disabled:opacity-50"
        >
          {creating ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
          {creating ? "Membuat backup..." : "Buat Backup Sekarang"}
        </button>
      </div>

      {message && (
        <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 rounded border border-green-200">
          {message}
        </div>
      )}

      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <h2 className="font-semibold text-gray-900 mb-2">Informasi Backup Otomas</h2>
        <p className="text-sm text-gray-600">
          Backup database dilakukan otomatis setiap hari pukul 02:00 WIB.
          Backup disimpan di: <code className="bg-gray-100 px-1 rounded text-xs">/var/backups/si-bumdes/</code>
        </p>
        <p className="text-sm text-gray-600 mt-1">
          Harga: Backup otomatis akan menimpa jadwal yang sudah ada di crontab. Backup lama (lebih dari 30 hari) akan otomatis dihapus.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
          <Clock size={18} className="text-primary" />
          <h2 className="font-semibold text-gray-900">Riwayat Backup</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-gray-900 font-semibold">File</th>
                <th className="text-left px-4 py-3 text-gray-900 font-semibold">Tanggal</th>
                <th className="text-right px-4 py-3 text-gray-900 font-semibold">Ukuran</th>
                <th className="text-center px-4 py-3 text-gray-900 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {backups.map((backup) => (
                <tr key={backup.filename} className="border-t border-gray-100">
                  <td className="px-4 py-3 text-gray-900 font-mono text-xs">
                    {backup.filename}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDate(backup.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900">
                    {formatFileSize(backup.size)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => deleteBackup(backup.filename)}
                      className="text-red-600 hover:text-red-800"
                      title="Hapus backup"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {backups.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    Belum ada backup
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
        <Calendar size={16} />
        <span>Backup otomatis: 02:00 WIB setiap hari</span>
      </div>
    </div>
  );
}
