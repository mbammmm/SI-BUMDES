"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit, FileText } from "lucide-react";
import { usePermission } from "@/hooks/use-permission";
import { offlineFetch } from "@/lib/offline-fetch";

type LetterTemplate = {
  id: string;
  name: string;
  type: string;
  content: string;
  numberingFormat: string | null;
};

export default function TemplateSuratPage() {
  const { allowed, canWrite, loading } = usePermission({ module: "letters", minLevel: "read" });
  const [templates, setTemplates] = useState<LetterTemplate[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<LetterTemplate | null>(null);
  const [form, setForm] = useState({
    id: "",
    name: "",
    type: "keluar",
    content: "",
    numberingFormat: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadData() {
    try {
      const res = await fetch("/api/surat/template");
      const json = await res.json();
      setTemplates(json.data || []);
    } catch (error) {
      console.error("Failed to load templates:", error);
    } finally {
      setDataLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function openCreate() {
    setEditingTemplate(null);
    setForm({
      id: "",
      name: "",
      type: "keluar",
      content: "",
      numberingFormat: "",
    });
    setShowForm(true);
  }

  function openEdit(template: LetterTemplate) {
    setEditingTemplate(template);
    setForm({
      id: template.id,
      name: template.name,
      type: template.type,
      content: template.content,
      numberingFormat: template.numberingFormat || "",
    });
    setShowForm(true);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const url = editingTemplate ? `/api/surat/template/${form.id}` : "/api/surat/template";
    const method = editingTemplate ? "PUT" : "POST";

    const res = await offlineFetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      const json = await res.json();
      if (editingTemplate) {
        setTemplates(templates.map((t) => (t.id === form.id ? { ...t, ...json.data } : t)));
      } else {
        setTemplates([...templates, json.data]);
      }
      setShowForm(false);
      setMessage(editingTemplate ? "Template berhasil diperbarui" : "Template berhasil ditambah");
    } else {
      const data = await res.json().catch(() => ({ error: "Gagal menyimpan template" }));
      setMessage(data.error || "Gagal menyimpan template");
    }
    setSaving(false);
  }

  async function deleteTemplate(id: string) {
    if (!confirm("Yakin ingin menghapus template ini?")) return;
    await offlineFetch(`/api/surat/template/${id}`, { method: "DELETE" });
    setTemplates(templates.filter((t) => t.id !== id));
  }

  if (dataLoading) return <div className="p-6">Memuat...</div>;
  if (!allowed) return null;

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText size={24} className="text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">Template Surat</h1>
        </div>
        {canWrite && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition"
          >
            <Plus size={16} />
            Tambah Template
          </button>
        )}
      </div>

      {message && (
        <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 rounded border border-green-200">
          {message}
        </div>
      )}

      {showForm && (
        <form onSubmit={onSubmit} className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Nama Template</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Contoh: SK Keterangan"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Jenis Surat</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="keluar">Surat Keluar</option>
                <option value="masuk">Surat Masuk</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Format Penomoran (opsional)</label>
            <input
              type="text"
              value={form.numberingFormat}
              onChange={(e) => setForm({ ...form, numberingFormat: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Contoh: SK-{nomor}/BUMDes/{bulan}/{tahun}"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Konten Template</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              rows={8}
              placeholder="Tulis konten surat di sini. Gunakan placeholder seperti {{nama}}, {{tanggal}}, {{alamat}} jika diperlukan."
              required
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-primary-600 transition disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : editingTemplate ? "Perbarui Template" : "Simpan Template"}
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

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Daftar Template</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {templates.map((template) => (
            <div key={template.id} className="px-4 py-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{template.name}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {template.type === "keluar" ? "Surat Keluar" : "Surat Masuk"}
                  {template.numberingFormat && (
                    <span className="text-xs text-gray-500 ml-2">
                      Format: {template.numberingFormat}
                    </span>
                  )}
                </p>
              </div>
              {canWrite && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(template)}
                    className="p-2 text-gray-600 hover:text-primary transition"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => deleteTemplate(template.id)}
                    className="p-2 text-gray-600 hover:text-red-600 transition"
                    title="Hapus"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>
          ))}
          {templates.length === 0 && (
            <div className="px-4 py-8 text-center text-gray-500">
              Belum ada template surat
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
