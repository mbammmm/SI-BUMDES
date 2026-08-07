"use client";

import { useEffect, useState } from "react";
import { Plus, AlertTriangle, Calendar, CheckCircle, XCircle } from "lucide-react";
import { usePermission } from "@/hooks/use-permission";
import { emitRefresh } from "@/lib/refresh";
import { useRefreshOnEvent } from "@/hooks/use-refresh-on-event";
import { offlineFetch } from "@/lib/offline-fetch";

type Category = {
  id: string;
  name: string;
  retentionDays: number | null;
};

type Document = {
  id: string;
  title: string;
  categoryId: string;
  documentDate: string;
  tags: string[];
  filePath: string;
  relatedLetterId: string | null;
  relatedTransactionId: string | null;
  retentionDays: number | null;
  expiryDate: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  createdBy: { name: string };
  category?: { name: string };
};

export default function ArsipPage() {
  const { allowed, canWrite, loading } = usePermission({ module: "archives", minLevel: "read" });
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    categoryId: "",
    documentDate: new Date().toISOString().split("T")[0],
    tags: "",
    filePath: "",
    relatedLetterId: "",
    relatedTransactionId: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState<"all" | "expiring" | "expired">("all");

  async function loadData() {
    try {
      let url = "/api/arsip";
      if (filter === "expiring") {
        url = "/api/arsip?expiringSoon=true";
      } else if (filter === "expired") {
        url = "/api/arsip?expired=true";
      }

      const [docJson, catJson] = await Promise.all([
        fetch(url).then((res) => res.json()),
        fetch("/api/arsip/kategori").then((res) => res.json()),
      ]);
      setDocuments(docJson.data || []);
      setCategories(catJson.data || []);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setDataLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [filter]);

  useRefreshOnEvent(loadData);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const categoryId = form.categoryId;
    let retentionDays = 0;
    const cat = categories.find((c) => c.id === categoryId);
    if (cat?.retentionDays) {
      retentionDays = cat.retentionDays;
    }

    const res = await offlineFetch("/api/arsip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        retentionDays: retentionDays || undefined,
      }),
    });

    if (res.ok) {
      setForm({
        title: "",
        categoryId: "",
        documentDate: new Date().toISOString().split("T")[0],
        tags: "",
        filePath: "",
        relatedLetterId: "",
        relatedTransactionId: "",
      });
      setShowForm(false);
      setMessage("Dokumen berhasil disimpan");
      await loadData();
      emitRefresh();
    } else {
      setMessage("Gagal menyimpan dokumen");
    }
    setSaving(false);
  }

  function getStatusInfo(doc: Document) {
    if (!doc.expiryDate) return { label: "Tidak terbatas", color: "bg-gray-50 text-gray-700", icon: null };

    const now = new Date();
    const expiry = new Date(doc.expiryDate);
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: "Kadaluarsa", color: "bg-red-50 text-red-700", icon: <XCircle size={12} /> };
    }
    if (diffDays <= 30) {
      return { label: `${diffDays} hari lagi`, color: "bg-yellow-50 text-yellow-700", icon: <AlertTriangle size={12} /> };
    }
    return { label: `${diffDays} hari`, color: "bg-green-50 text-green-700", icon: <CheckCircle size={12} /> };
  }

  if (dataLoading) return <div className="p-6">Memuat...</div>;
  if (!allowed) return null;

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Arsip Digital</h1>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded text-sm font-semibold transition ${filter === "all" ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilter("expiring")}
              className={`px-3 py-1 rounded text-sm font-semibold transition ${filter === "expiring" ? "bg-yellow-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              Akan Kadaluarsa
            </button>
            <button
              onClick={() => setFilter("expired")}
              className={`px-3 py-1 rounded text-sm font-semibold transition ${filter === "expired" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              Kadaluarsa
            </button>
          </div>
        </div>
        {canWrite && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition"
          >
            <Plus size={16} />
            Upload Dokumen
          </button>
        )}
      </div>

      {canWrite && showForm && (
        <form onSubmit={onSubmit} className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Judul Dokumen</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Kategori</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              >
                <option value="">Pilih kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name} {cat.retentionDays && `(${cat.retentionDays} hari)`}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Tanggal Dokumen</label>
              <input
                type="date"
                value={form.documentDate}
                onChange={(e) => setForm({ ...form, documentDate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Path File (simulasi)</label>
              <input
                type="text"
                value={form.filePath}
                onChange={(e) => setForm({ ...form, filePath: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="/uploads/dokumen.pdf"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Tags (pisahkan dengan koma)</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="misal: keuangan, laporan, 2026"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-primary text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-primary-600 transition disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan Dokumen"}
          </button>
        </form>
      )}

      {message && (
        <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 rounded border border-green-200">
          {message}
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Daftar Dokumen Arsip</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-gray-900 font-semibold">Judul</th>
                <th className="text-left px-4 py-3 text-gray-900 font-semibold">Kategori</th>
                <th className="text-left px-4 py-3 text-gray-900 font-semibold">Tanggal</th>
                <th className="text-left px-4 py-3 text-gray-900 font-semibold">Masa Retensi</th>
                <th className="text-left px-4 py-3 text-gray-900 font-semibold">Status Kadaluarsa</th>
                <th className="text-left px-4 py-3 text-gray-900 font-semibold">Tags</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => {
                const statusInfo = getStatusInfo(doc);
                return (
                  <tr key={doc.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 text-gray-900">{doc.title}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {doc.category?.name || categories.find((c) => c.id === doc.categoryId)?.name || doc.categoryId}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(doc.documentDate).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {doc.retentionDays ? `${doc.retentionDays} hari` : "Tidak terbatas"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {statusInfo.icon}
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {doc.tags?.join(", ") || "-"}
                    </td>
                  </tr>
                );
              })}
              {documents.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Belum ada dokumen arsip
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
