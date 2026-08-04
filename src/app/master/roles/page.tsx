"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit } from "lucide-react";
import { usePermission } from "@/hooks/use-permission";
import { offlineFetch } from "@/lib/offline-fetch";

type Role = {
  id: string;
  name: string;
  description: string | null;
  permissions: Record<string, any>;
};

const moduleLabels: Record<string, string> = {
  users: "Manajemen Pengguna",
  accounting: "Akuntansi",
  assets: "Aset",
  letters: "Surat Menyurat",
  archives: "Arsip",
  reports: "Laporan",
};

const levelLabels: Record<string, string> = {
  none: "Tidak Ada",
  read: "Lihat",
  input: "Input",
  upload: "Upload",
  approve: "Approve",
  approve_sign: "Approve/TTD",
  read_approve: "Lihat+Approve",
  crud: "CRUD",
};

export default function RolesPage() {
  const { allowed, canWrite, loading } = usePermission({ module: "users", minLevel: "read" });
  const [roles, setRoles] = useState<Role[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form, setForm] = useState({
    id: "",
    name: "",
    description: "",
    permissions: {} as Record<string, string>,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const modules = Object.keys(moduleLabels);
  const levels: { value: string; label: string }[] = [
    { value: "none", label: "Tidak Ada" },
    { value: "read", label: "Lihat" },
    { value: "input", label: "Input" },
    { value: "upload", label: "Upload" },
    { value: "approve", label: "Approve" },
    { value: "approve_sign", label: "Approve/TTD" },
    { value: "read_approve", label: "Lihat+Approve" },
    { value: "crud", label: "CRUD" },
  ];

  useEffect(() => {
    fetch("/api/master/roles")
      .then((res) => res.json())
      .then((json) => {
        setRoles(json.data || []);
        setDataLoading(false);
      });
  }, []);

  function openEdit(role: Role) {
    setEditingRole(role);
    setForm({
      id: role.id,
      name: role.name,
      description: role.description || "",
      permissions: Object.fromEntries(
        Object.entries(role.permissions).map(([k, v]) => [k, String(v)])
      ) as Record<string, string>,
    });
    setShowForm(true);
  }

  function openCreate() {
    setEditingRole(null);
    const defaultPerms: Record<string, string> = {};
    modules.forEach((m) => (defaultPerms[m] = "none"));
    setForm({
      id: "",
      name: "",
      description: "",
      permissions: defaultPerms,
    });
    setShowForm(true);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const url = editingRole ? `/api/master/roles/${form.id}` : "/api/master/roles";
    const method = editingRole ? "PUT" : "POST";

    const res = await offlineFetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      const json = await res.json();
      if (editingRole) {
        setRoles(roles.map((r) => (r.id === form.id ? { ...r, ...json.data } : r)));
      } else {
        setRoles([...roles, json.data]);
      }
      setShowForm(false);
      setMessage(editingRole ? "Peran berhasil diperbarui" : "Peran berhasil ditambah");
    } else {
      const data = await res.json();
      setMessage(data.error || "Gagal menyimpan peran");
    }
    setSaving(false);
  }

  async function deleteRole(id: string) {
    if (!confirm("Yakin ingin menghapus peran ini?")) return;
    await offlineFetch(`/api/master/roles/${id}`, { method: "DELETE" });
    setRoles(roles.filter((r) => r.id !== id));
  }

  if (dataLoading) return <div className="p-6">Memuat...</div>;
  if (!allowed) return null;

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Peran</h1>
        {canWrite && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition"
          >
            <Plus size={16} />
            Tambah Peran
          </button>
        )}
      </div>

      {canWrite && showForm && (
        <form onSubmit={onSubmit} className="bg-white p-6 rounded-lg border border-gray-200 mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Nama Peran</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Deskripsi</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Hak Akses</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {modules.map((module) => (
                <div key={module} className="border border-gray-200 rounded-lg p-3">
                  <p className="text-sm font-semibold text-gray-900 mb-2">{moduleLabels[module]}</p>
                  <select
                    value={form.permissions[module] || "none"}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        permissions: { ...form.permissions, [module]: e.target.value },
                      })
                    }
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    {levels.map((lvl) => (
                      <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-primary text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-primary-600 transition disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : editingRole ? "Perbarui" : "Simpan"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Batal
            </button>
          </div>
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
              <th className="text-left px-4 py-3 text-gray-900 font-semibold">Nama Peran</th>
              <th className="text-left px-4 py-3 text-gray-900 font-semibold">Deskripsi</th>
              <th className="text-left px-4 py-3 text-gray-900 font-semibold">Hak Akses</th>
              <th className="text-left px-4 py-3 text-gray-900 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id} className="border-t border-gray-100">
                <td className="px-4 py-3 text-gray-900">{role.name}</td>
                <td className="px-4 py-3 text-gray-600">{role.description || "-"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(role.permissions).map(([module, level]) => (
                      <span
                        key={module}
                        className="px-2 py-1 bg-primary-50 text-primary text-xs rounded font-medium"
                      >
                        {moduleLabels[module]}: {levelLabels[String(level)]}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(role)}
                      className="text-primary hover:text-primary-600"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => deleteRole(role.id)}
                      className="text-red-600 hover:text-red-700"
                      title="Hapus"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {roles.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  Belum ada peran
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
