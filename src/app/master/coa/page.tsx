"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { usePermission } from "@/hooks/use-permission";
import { offlineFetch } from "@/lib/offline-fetch";

type COA = {
  id: string;
  code: string;
  name: string;
  category: string;
  type: string;
};

export default function CoaPage() {
  const { allowed, canWrite, loading } = usePermission({ module: "accounting", minLevel: "read" });
  const [accounts, setAccounts] = useState<COA[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [form, setForm] = useState({
    code: "",
    name: "",
    category: "Aset",
    type: "Debit",
    parentId: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/master/coa")
      .then((res) => res.json())
      .then((json) => {
        setAccounts(json.data || []);
        setDataLoading(false);
      });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const res = await offlineFetch("/api/master/coa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      const json = await res.json();
      setAccounts([...accounts, json.data]);
      setForm({ code: "", name: "", category: "Aset", type: "Debit", parentId: "" });
      setMessage("Akun berhasil ditambah");
    } else {
      setMessage("Gagal menambah akun");
    }
    setSaving(false);
  }

  if (dataLoading) return <div className="p-6">Memuat...</div>;
  if (!allowed) return null;

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Chart of Account</h1>

      {canWrite && (
        <form onSubmit={onSubmit} className="bg-white p-6 rounded-lg border border-gray-200 mb-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Kode Akun</label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="misal: 1000"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Nama Akun</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="misal: Kas"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Kategori</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="Aset">Aset</option>
              <option value="Liabilitas">Liabilitas</option>
              <option value="Ekuitas">Ekuitas</option>
              <option value="Pendapatan">Pendapatan</option>
              <option value="Beban">Beban</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Tipe</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="Debit">Debit</option>
              <option value="Kredit">Kredit</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-primary-600 transition disabled:opacity-50"
        >
          <Plus size={16} />
          {saving ? "Menyimpan..." : "Tambah Akun"}
        </button>
      </form>
      )}

      {message && (
        <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 rounded border border-green-200">
          {message}
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-gray-900 font-semibold">Kode</th>
              <th className="text-left px-4 py-3 text-gray-900 font-semibold">Nama</th>
              <th className="text-left px-4 py-3 text-gray-900 font-semibold">Kategori</th>
              <th className="text-left px-4 py-3 text-gray-900 font-semibold">Tipe</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((acc) => (
              <tr key={acc.id} className="border-t border-gray-100">
                <td className="px-4 py-3 text-gray-900">{acc.code}</td>
                <td className="px-4 py-3 text-gray-900">{acc.name}</td>
                <td className="px-4 py-3 text-gray-900">{acc.category}</td>
                <td className="px-4 py-3 text-gray-900">{acc.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
