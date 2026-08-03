"use client";

import { useEffect, useState } from "react";
import { usePermission } from "@/hooks/use-permission";

type Profile = {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  nib?: string;
  registrationNumber?: string;
};

export default function ProfilPage() {
  const { allowed, canWrite, loading } = usePermission({ module: "users", minLevel: "read" });
  const [form, setForm] = useState<Profile>({
    id: "",
    name: "",
    address: "",
    phone: "",
    email: "",
    nib: "",
    registrationNumber: "",
  });
  const [dataLoading, setDataLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/master/profil")
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setForm(json.data);
        setDataLoading(false);
      });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const res = await fetch("/api/master/profil", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setMessage("Profil berhasil disimpan");
    } else {
      setMessage("Gagal menyimpan profil");
    }
    setSaving(false);
  }

  if (dataLoading) return <div className="p-6">Memuat...</div>;
  if (!allowed) return null;

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profil BUMDes</h1>

      {canWrite ? (
        <form onSubmit={onSubmit} className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
          {message && (
            <div className="p-3 text-sm text-green-700 bg-green-50 rounded border border-green-200">
              {message}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Nama BUMDes</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Alamat</label>
            <textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Telepon</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">NIB</label>
              <input
                type="text"
                value={form.nib}
                onChange={(e) => setForm({ ...form, nib: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Nomor SK Pendirian</label>
              <input
                type="text"
                value={form.registrationNumber}
                onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-primary text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primary-600 transition disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </form>
      ) : (
        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Nama BUMDes</label>
            <p className="text-gray-900">{form.name}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Alamat</label>
            <p className="text-gray-900 whitespace-pre-wrap">{form.address}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Telepon</label>
              <p className="text-gray-900">{form.phone || "-"}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Email</label>
              <p className="text-gray-900">{form.email || "-"}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">NIB</label>
              <p className="text-gray-900">{form.nib || "-"}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Nomor SK Pendirian</label>
              <p className="text-gray-900">{form.registrationNumber || "-"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
