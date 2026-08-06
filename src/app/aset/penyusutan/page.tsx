"use client";

import { useEffect, useState, useCallback } from "react";
import { Calendar, Calculator, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { usePermission } from "@/hooks/use-permission";
import { useRefreshOnEvent } from "@/hooks/use-refresh-on-event";
import { emitRefresh } from "@/lib/refresh";

type Asset = {
  id: string;
  name: string;
  category: string;
  acquisitionDate: string;
  acquisitionValue: string;
  usefulLife: number;
  salvageValue: string;
  currentValue: string | null;
  condition: string;
  status: string;
  isDeleted?: boolean;
};

type DepreciationSchedule = {
  id: string;
  assetId: string;
  period: string;
  amount: string;
  isAccrued: boolean;
  createdAt: string;
  asset: Asset;
};

export default function DepreciationPage() {
  const { allowed, canWrite, loading } = usePermission({ module: "assets", minLevel: "read" });
  const [schedules, setSchedules] = useState<DepreciationSchedule[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState("");
  const [calculating, setCalculating] = useState(false);
  const [message, setMessage] = useState("");

  const loadData = useCallback(async () => {
    try {
      const [scheduleRes, assetRes] = await Promise.all([
        fetch(`/api/aset/depreciation?year=${selectedYear}`).then((res) => res.json()),
        fetch("/api/aset").then((res) => res.json()),
      ]);
      setSchedules(scheduleRes.data || []);
      setAssets(assetRes.data || []);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setDataLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useRefreshOnEvent(loadData);

  async function calculateDepreciation(apply: boolean) {
    setCalculating(true);
    setMessage("");

    const res = await fetch("/api/aset/depreciation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        year: selectedYear,
        month: selectedMonth || undefined,
        apply,
      }),
    });

    if (res.ok) {
      const json = await res.json();
      setMessage(
        `${json.data.length} aset berhasil dihitung` +
        (apply ? " dan akumulasi diterapkan" : "") +
        ", " +
        (apply ? "akumulasi penyusutan telah dibuat" : "jadwal disimpan sebagai draft")
      );
      await loadData();
      emitRefresh();
    } else {
      const data = await res.json();
      setMessage(data.error || "Gagal menghitung penyusutan");
    }
    setCalculating(false);
  }

  function formatCurrency(value: string | number): string {
    return Number(value).toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    });
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function getStatusColor(isAccrued: boolean): string {
    return isAccrued
      ? "bg-green-50 text-green-700"
      : "bg-yellow-50 text-yellow-700";
  }

  function getStatusLabel(isAccrued: boolean): string {
    return isAccrued ? "Diterapkan" : "Draft";
  }

  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear - 5; i <= currentYear + 2; i++) {
    years.push(i);
  }

  const months = [
    { value: "01", label: "Januari" },
    { value: "02", label: "Februari" },
    { value: "03", label: "Maret" },
    { value: "04", label: "April" },
    { value: "05", label: "Mei" },
    { value: "06", label: "Juni" },
    { value: "07", label: "Juli" },
    { value: "08", label: "Agustus" },
    { value: "09", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" },
  ];

  if (dataLoading) return <div className="p-6">Memuat...</div>;
  if (!allowed) return null;

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Penyusutan Aset</h1>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Hitung Penyusutan</h2>
        <p className="text-sm text-gray-600 mb-4">
          Metode: Garis Lurus (Straight Line). Akumulasi penyusutan dihitung berdasarkan nilai
          perolehan dikurangi nilai sisa, dibagi rata-rata masa pakai (bulan).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Tahun</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              {years.map((year) => (
                <option key={year} value={year.toString()}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Bulan (opsional)</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">Semua bulan</option>
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => calculateDepreciation(false)}
              disabled={calculating}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {calculating ? "Menghitung..." : <><Calculator size={16} /> Hitung Draft</>}
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          {canWrite && (
            <button
              onClick={() => calculateDepreciation(true)}
              disabled={calculating}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition disabled:opacity-50"
            >
              {calculating ? "Memproses..." : <><CheckCircle size={16} /> Hitung & Terapkan</>}
            </button>
          )}
          <button
            onClick={() => calculateDepreciation(false)}
            disabled={calculating}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition disabled:opacity-50"
          >
            {calculating ? "Memproses..." : "Hitung Draft"}
          </button>
        </div>
      </div>

      {message && (
        <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 rounded border border-green-200">
          {message}
        </div>
      )}

      <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Jadwal Penyusutan</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-gray-900 font-semibold">Aset</th>
                <th className="text-left px-4 py-3 text-gray-900 font-semibold">Periode</th>
                <th className="text-right px-4 py-3 text-gray-900 font-semibold">Jumlah Penyusutan</th>
                <th className="text-center px-4 py-3 text-gray-900 font-semibold">Status</th>
                <th className="text-left px-4 py-3 text-gray-900 font-semibold">Tanggal Dibuat</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((schedule) => (
                <tr key={schedule.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 text-gray-900">{schedule.asset.name}</td>
                  <td className="px-4 py-3 text-gray-600">{schedule.period}</td>
                  <td className="px-4 py-3 text-right text-red-700 font-semibold">
                    {formatCurrency(schedule.amount)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(schedule.isAccrued)}`}>
                      {getStatusLabel(schedule.isAccrued)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDate(schedule.createdAt)}
                  </td>
                </tr>
              ))}
              {schedules.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    Belum ada jadwal penyusutan untuk periode ini
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
        <h2 className="font-semibold text-gray-900 mb-4">Daftar Aset</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-gray-900 font-semibold">Nama Aset</th>
                <th className="text-left px-4 py-3 text-gray-900 font-semibold">Kategori</th>
                <th className="text-right px-4 py-3 text-gray-900 font-semibold">Nilai Perolehan</th>
                <th className="text-right px-4 py-3 text-gray-900 font-semibold">Nilai Sisa</th>
                <th className="text-center px-4 py-3 text-gray-900 font-semibold">Masa Pakai (th)</th>
              </tr>
            </thead>
            <tbody>
              {assets
                .filter((a) => a.status === "aktif" && !a.isDeleted)
                .map((asset) => (
                  <tr key={asset.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 text-gray-900">{asset.name}</td>
                    <td className="px-4 py-3 text-gray-600">{asset.category}</td>
                    <td className="px-4 py-3 text-right text-gray-900">
                      {formatCurrency(asset.acquisitionValue)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">
                      {formatCurrency(asset.salvageValue)}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-900">
                      {asset.usefulLife}
                    </td>
                  </tr>
                ))}
              {assets.filter((a) => a.status === "aktif" && !a.isDeleted).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    Belum ada aset aktif
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
