"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { usePermission } from "@/hooks/use-permission";
import { offlineFetch } from "@/lib/offline-fetch";

type UnitUsaha = {
  id: string;
  name: string;
  type: string;
  startDate: string;
  initialCapital: string;
  description?: string;
};

export default function UnitUsahaPage() {
  const { allowed, canWrite, loading } = usePermission({ module: "users", minLevel: "read" });
  const [units, setUnits] = useState<UnitUsaha[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    type: "",
    startDate: "",
    initialCapital: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/master/unit-usaha")
      .then((res) => res.json())
      .then((json) => {
        setUnits(json.data || []);
        setDataLoading(false);
      });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const res = await offlineFetch("/api/master/unit-usaha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      const json = await res.json();
      setUnits([...units, json.data]);
      setForm({ name: "", type: "", startDate: "", initialCapital: "", description: "" });
      setMessage("Unit usaha berhasil ditambah");
    } else {
      setMessage("Gagal menambah unit usaha");
    }
    setSaving(false);
  }

  async function deleteUnit(id: string) {
    if (!confirm("Yakin ingin menghapus unit usaha ini?")) return;
    await offlineFetch(`/api/master/unit-usaha/${id}`, { method: "DELETE" });
    setUnits(units.filter((u) => u.id !== id));
  }

  if (dataLoading) return <div className="p-6">Memuat...</div>;
  if (!allowed) return null;

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Unit Usaha</h1>

      {canWrite && (
        <form onSubmit={onSubmit} className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 mb-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Nama Unit Usaha</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="misal: Pertanian"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Jenis</label>
            <input
              type="text"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="misal: Pertanian"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Tanggal Mulai</label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Modal Awal (Rp)</label>
            <input
              type="number"
              value={form.initialCapital}
              onChange={(e) => setForm({ ...form, initialCapital: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">Deskripsi</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            rows={2}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-primary-600 transition disabled:opacity-50"
        >
          <Plus size={16} />
          {saving ? "Menyimpan..." : "Tambah Unit Usaha"}
        </button>
      </form>
      )}

      {message && (
        <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 rounded border border-green-200">
          {message}
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-gray-900 font-semibold">Nama</th>
              <th className="text-left px-4 py-3 text-gray-900 font-semibold">Jenis</th>
              <th className="text-left px-4 py-3 text-gray-900 font-semibold">Modal Awal</th>
              <th className="text-left px-4 py-3 text-gray-900 font-semibold">Mulai</th>
            </tr>
          </thead>
          <tbody>
            {units.map((unit) => (
              <tr key={unit.id} className="border-t border-gray-100">
                <td className="px-4 py-3 text-gray-900">{unit.name}</td>
                <td className="px-4 py-3 text-gray-900">{unit.type}</td>
                <td className="px-4 py-3 text-gray-900">
                  {Number(unit.initialCapital).toLocaleString("id-ID")}
                </td>
                <td className="px-4 py-3 text-gray-900">
                  {new Date(unit.startDate).toLocaleDateString("id-ID")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
