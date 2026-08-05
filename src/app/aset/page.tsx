"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, Package, QrCode } from "lucide-react";
import QRCode from "qrcode";
import { usePermission } from "@/hooks/use-permission";
import { emitRefresh } from "@/lib/refresh";
import { useRefreshOnEvent } from "@/hooks/use-refresh-on-event";
import { offlineFetch } from "@/lib/offline-fetch";

type Asset = {
  id: string;
  name: string;
  category: string;
  acquisitionDate: string;
  acquisitionValue: string;
  usefulLife: number;
  salvageValue: string;
  unitUsahaId: string;
  condition: string;
  status: string;
  currentValue: string | null;
  createdBy: { name: string };
};

type UnitUsaha = {
  id: string;
  name: string;
};

export default function AsetPage() {
  const { allowed, canWrite, loading } = usePermission({ module: "assets", minLevel: "read" });
  const [assets, setAssets] = useState<Asset[]>([]);
  const [units, setUnits] = useState<UnitUsaha[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "",
    acquisitionDate: new Date().toISOString().split("T")[0],
    acquisitionValue: "",
    usefulLife: "",
    salvageValue: "",
    unitUsahaId: "",
    condition: "baik",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [qrAsset, setQrAsset] = useState<Asset | null>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  async function loadData() {
    try {
      const [assetJson, unitJson] = await Promise.all([
        fetch("/api/aset").then((res) => res.json()),
        fetch("/api/master/unit-usaha").then((res) => res.json()),
      ]);
      setAssets(assetJson.data || []);
      setUnits(unitJson.data || []);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setDataLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useRefreshOnEvent(loadData);

  useEffect(() => {
    if (qrAsset && qrCanvasRef.current) {
      QRCode.toCanvas(qrCanvasRef.current, JSON.stringify({
        id: qrAsset.id,
        name: qrAsset.name,
        category: qrAsset.category,
      }), { width: 200 });
    }
  }, [qrAsset]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const res = await offlineFetch("/api/aset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setForm({
        name: "",
        category: "",
        acquisitionDate: new Date().toISOString().split("T")[0],
        acquisitionValue: "",
        usefulLife: "",
        salvageValue: "",
        unitUsahaId: "",
        condition: "baik",
      });
      setShowForm(false);
      setMessage("Aset berhasil ditambah");
      await loadData();
      emitRefresh();
    } else {
      const data = await res.json().catch(() => ({ error: "Gagal menambah aset" }));
      setMessage(data.error || "Gagal menambah aset");
    }
    setSaving(false);
  }

  function calculateDepreciation(asset: Asset) {
    const value = Number(asset.acquisitionValue);
    const life = asset.usefulLife;
    const salvage = Number(asset.salvageValue);
    const monthly = (value - salvage) / (life * 12);
    return monthly;
  }

  if (dataLoading) return <div className="p-6">Memuat...</div>;
  if (!allowed) return null;

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Aset</h1>
        <div className="flex gap-2">
          {canWrite && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition"
            >
              <Plus size={16} />
              Tambah Aset
            </button>
          )}
          <button
            onClick={() => window.open("/api/keuangan/export?format=excel&reportType=aset", "_blank")}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition text-sm"
          >
            Export Excel
          </button>
          <button
            onClick={() => window.open("/api/keuangan/export?format=pdf&reportType=aset", "_blank")}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition text-sm"
          >
            Export PDF
          </button>
        </div>
      </div>

      {canWrite && showForm && (
        <form onSubmit={onSubmit} className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Nama Aset</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="misal: Traktor"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Kategori</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="misal: Alat Pertanian"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Tanggal Perolehan</label>
              <input
                type="date"
                value={form.acquisitionDate}
                onChange={(e) => setForm({ ...form, acquisitionDate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Unit Usaha</label>
              <select
                value={form.unitUsahaId}
                onChange={(e) => setForm({ ...form, unitUsahaId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              >
                <option value="">Pilih unit usaha</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Nilai Perolehan (Rp)</label>
              <input
                type="number"
                value={form.acquisitionValue}
                onChange={(e) => setForm({ ...form, acquisitionValue: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Masa Pakai (tahun)</label>
              <input
                type="number"
                value={form.usefulLife}
                onChange={(e) => setForm({ ...form, usefulLife: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Nilai Sisa (Rp)</label>
              <input
                type="number"
                value={form.salvageValue}
                onChange={(e) => setForm({ ...form, salvageValue: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Kondisi</label>
            <select
              value={form.condition}
              onChange={(e) => setForm({ ...form, condition: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="baik">Baik</option>
              <option value="rusak ringan">Rusak Ringan</option>
              <option value="rusak berat">Rusak Berat</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-primary text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-primary-600 transition disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan Aset"}
          </button>
        </form>
      )}

      {message && (
        <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 rounded border border-green-200">
          {message}
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
          <Package size={18} className="text-primary" />
          <h2 className="font-semibold text-gray-900">Daftar Aset</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-gray-900 font-semibold">Nama</th>
                <th className="text-left px-4 py-3 text-gray-900 font-semibold">Kategori</th>
                <th className="text-left px-4 py-3 text-gray-900 font-semibold">Unit Usaha</th>
                <th className="text-left px-4 py-3 text-gray-900 font-semibold">Nilai</th>
                <th className="text-left px-4 py-3 text-gray-900 font-semibold">Penyusutan/bln</th>
                <th className="text-left px-4 py-3 text-gray-900 font-semibold">Status</th>
                <th className="text-left px-4 py-3 text-gray-900 font-semibold">QR</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => {
                const monthlyDep = calculateDepreciation(asset);
                return (
                  <tr key={asset.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 text-gray-900">{asset.name}</td>
                    <td className="px-4 py-3 text-gray-900">{asset.category}</td>
                    <td className="px-4 py-3 text-gray-900">
                      {units.find((u) => u.id === asset.unitUsahaId)?.name || asset.unitUsahaId}
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      {Number(asset.acquisitionValue).toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      {monthlyDep.toLocaleString("id-ID", { maximumFractionDigits: 0 })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${asset.status === "aktif" ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-700"}`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setQrAsset(asset)}
                        className="text-primary hover:text-primary-600"
                        title="Lihat QR Code"
                      >
                        <QrCode size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {assets.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Belum ada aset
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {qrAsset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setQrAsset(null)}>
          <div className="bg-white p-6 rounded-lg max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">QR Code Aset</h3>
            <canvas ref={qrCanvasRef} className="mx-auto mb-4" />
            <p className="text-sm text-gray-600 text-center mb-2">{qrAsset.name}</p>
            <p className="text-xs text-gray-500 text-center mb-4">ID: {qrAsset.id}</p>
            <button
              onClick={() => setQrAsset(null)}
              className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary-600 transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
