"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePermission } from "@/hooks/use-permission";
import { offlineFetch } from "@/lib/offline-fetch";

type User = {
  id: string;
  email: string;
  username: string;
  name: string;
  isActive: boolean;
  roleId: string;
  createdAt: string;
  role: { name: string };
};

type Role = {
  id: string;
  name: string;
  description: string | null;
  permissions: Record<string, any>;
};

export default function PenggunaPage() {
  const router = useRouter();
  const { allowed, canWrite, loading } = usePermission({ module: "users", minLevel: "read" });
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({
    id: "",
    username: "",
    email: "",
    name: "",
    password: "",
    roleId: "",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/master/pengguna").then((res) => res.json()),
      fetch("/api/master/roles").then((res) => res.json()),
    ]).then(([userJson, roleJson]) => {
      setUsers(userJson.data || []);
      setRoles(roleJson.data || []);
      setDataLoading(false);
    });
  }, []);

  function openEdit(user: User) {
    setEditingUser(user);
    setForm({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      password: "",
      roleId: user.roleId,
      isActive: user.isActive,
    });
    setShowForm(true);
  }

  function openCreate() {
    setEditingUser(null);
    setForm({
      id: "",
      username: "",
      email: "",
      name: "",
      password: "",
      roleId: "",
      isActive: true,
    });
    setShowForm(true);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const url = editingUser ? `/api/master/pengguna/${form.id}` : "/api/master/pengguna";
    const method = editingUser ? "PUT" : "POST";

    const res = await offlineFetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      const json = await res.json();
      if (editingUser) {
        setUsers(users.map((u) => (u.id === form.id ? { ...u, ...json.data } : u)));
      } else {
        setUsers([json.data, ...users]);
      }
      setShowForm(false);
      setMessage(editingUser ? "Pengguna berhasil diperbarui" : "Pengguna berhasil ditambah");
    } else {
      const data = await res.json();
      setMessage(data.error || "Gagal menyimpan pengguna");
    }
    setSaving(false);
  }

  async function deleteUser(id: string) {
    if (!confirm("Yakin ingin menghapus pengguna ini?")) return;
    await offlineFetch(`/api/master/pengguna/${id}`, { method: "DELETE" });
    setUsers(users.filter((u) => u.id !== id));
  }

  if (dataLoading) return <div className="p-6">Memuat...</div>;
  if (!allowed) return null;

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Pengguna</h1>
        {canWrite && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition"
          >
            <Plus size={16} />
            Tambah Pengguna
          </button>
        )}
      </div>

      {canWrite && showForm && (
        <form onSubmit={onSubmit} className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Username</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Nama Lengkap</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                {editingUser ? "Password Baru (opsional)" : "Password"}
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required={!editingUser}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Peran</label>
              <select
                value={form.roleId}
                onChange={(e) => setForm({ ...form, roleId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              >
                <option value="">Pilih peran</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Status</label>
              <select
                value={form.isActive ? "true" : "false"}
                onChange={(e) => setForm({ ...form, isActive: e.target.value === "true" })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="true">Aktif</option>
                <option value="false">Nonaktif</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-primary text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-primary-600 transition disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : editingUser ? "Perbarui" : "Simpan"}
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
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-gray-900 font-semibold">Nama</th>
              <th className="text-left px-4 py-3 text-gray-900 font-semibold">Username</th>
              <th className="text-left px-4 py-3 text-gray-900 font-semibold">Email</th>
              <th className="text-left px-4 py-3 text-gray-900 font-semibold">Peran</th>
              <th className="text-left px-4 py-3 text-gray-900 font-semibold">Status</th>
              <th className="text-left px-4 py-3 text-gray-900 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-gray-100">
                <td className="px-4 py-3 text-gray-900">{user.name}</td>
                <td className="px-4 py-3 text-gray-900">{user.username}</td>
                <td className="px-4 py-3 text-gray-900">{user.email}</td>
                <td className="px-4 py-3 text-gray-900">{user.role?.name || "-"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${user.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                    {user.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(user)}
                      className="text-primary hover:text-primary-600"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="text-red-600 hover:text-red-700"
                      title="Hapus"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  Belum ada pengguna
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
