"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, Save, Plus, Trash2 } from "lucide-react";
import { usePermission } from "@/hooks/use-permission";

type Setting = {
  id: number;
  name: string;
  percentage: number;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function ShuSettingsPage() {
  const router = useRouter();
  const { allowed, loading: permLoading } = usePermission({ module: "accounting", minLevel: "crud" });
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    const res = await fetch("/api/keuangan/shu/settings");
    const json = await res.json();
    if (json.settings) {
      setSettings(json.settings);
    }
    setLoading(false);
  }

  async function updatePercentage(id: number, percentage: number) {
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/keuangan/shu/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, percentage }),
    });
    if (res.ok) {
      setMessage("Persentase berhasil diperbarui");
      fetchSettings();
    } else {
      const json = await res.json();
      setMessage(json.error || "Gagal memperbarui");
    }
    setSaving(false);
  }

  function handlePercentageChange(id: number, value: string) {
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, percentage: parseFloat(value) || 0 } : s))
    );
  }

  if (permLoading || loading) return <div className="p-6">Memuat...</div>;
  if (!allowed) {
    router.replace("/");
    return null;
  }

  const total = settings.reduce((sum, s) => sum + s.percentage, 0);

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Settings size={24} className="text-primary" />
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan Persentase SHU</h1>
      </div>

      {message && (
        <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 rounded border border-green-200">
          {message}
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Daftar Persentase Alokasi SHU</h2>
          <div className="text-sm text-gray-600">
            Total: <span className={total === 100 ? "text-green-700 font-bold" : "text-red-700 font-bold"}>{total.toFixed(2)}%</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 text-gray-900 font-semibold">Nama</th>
                <th className="text-left px-4 py-2 text-gray-900 font-semibold">Deskripsi</th>
                <th className="text-center px-4 py-2 text-gray-900 font-semibold">Persentase (%)</th>
                <th className="text-center px-4 py-2 text-gray-900 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {settings.map((setting) => (
                <tr key={setting.id} className="border-t border-gray-100">
                  <td className="px-4 py-2 text-gray-900 font-medium">{setting.name}</td>
                  <td className="px-4 py-2 text-gray-600">{setting.description || "-"}</td>
                  <td className="px-4 py-2 text-center">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={setting.percentage}
                      onChange={(e) => handlePercentageChange(setting.id, e.target.value)}
                      className="w-20 text-center border border-gray-300 rounded-lg px-2 py-1.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => updatePercentage(setting.id, setting.percentage)}
                      disabled={saving}
                      className="inline-flex items-center gap-1 px-2 py-1.5 text-sm text-primary border border-primary rounded hover:bg-primary/10 disabled:opacity-50"
                    >
                      <Save size={14} />
                      Simpan
                    </button>
                  </td>
                </tr>
              ))}
              {settings.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                    Belum ada pengaturan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {total !== 100 && (
        <div className="mb-6 p-3 text-sm text-amber-700 bg-amber-50 rounded border border-amber-200">
          ⚠️ Total persentase harus tepat 100%. Saat ini: {total.toFixed(2)}%
        </div>
      )}

      <div className="flex items-center justify-between pt-4">
        <button
          onClick={() => router.push("/keuangan/shu")}
          className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Kembali ke SHU
        </button>
        <button
          onClick={() => fetchSettings()}
          className="px-4 py-2 text-sm text-primary border border-primary rounded-lg hover:bg-primary/10"
        >
          Refresh Data
        </button>
      </div>
    </div>
  );
}
