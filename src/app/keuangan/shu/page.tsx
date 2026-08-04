"use client";

import { useEffect, useState } from "react";
import { Wallet, TrendingUp, TrendingDown, PieChart } from "lucide-react";
import { usePermission } from "@/hooks/use-permission";

type SHUData = {
  period: { startDate: string | null; endDate: string | null };
  totalRevenue: number;
  totalExpense: number;
  shu: number;
  revenueByAccount: { code: string; name: string; amount: number }[];
  expenseByAccount: { code: string; name: string; amount: number }[];
  revenueByUnit: { name: string; amount: number }[];
  expenseByUnit: { name: string; amount: number }[];
  allocation: {
    pendapatanAsliDesa: number;
    cadangan: number;
    danaSosial: number;
    pengembangan: number;
  };
};

export default function SHUPage() {
  const { allowed, loading } = usePermission({ module: "accounting", minLevel: "read" });
  const [data, setData] = useState<SHUData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);

    fetch(`/api/keuangan/shu?${params.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setDataLoading(false);
      });
  }, [startDate, endDate]);

  if (dataLoading) return <div className="p-6">Memuat...</div>;
  if (!allowed) return null;

  if (!data) {
    return <div className="p-6 text-red-700">Gagal memuat data SHU</div>;
  }

  return (
    <div className="p-6 max-w-6xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Sisa Hasil Usaha (SHU)</h1>

      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">Dari Tanggal</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">Sampai Tanggal</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="text-green-700" />
            <p className="text-sm text-gray-600">Total Pendapatan</p>
          </div>
          <p className="text-xl font-bold text-green-700">{data.totalRevenue.toLocaleString("id-ID")}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={18} className="text-red-700" />
            <p className="text-sm text-gray-600">Total Beban</p>
          </div>
          <p className="text-xl font-bold text-red-700">{data.totalExpense.toLocaleString("id-ID")}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={18} className="text-primary" />
            <p className="text-sm text-gray-900">SHU</p>
          </div>
          <p className={`text-xl font-bold ${data.shu >= 0 ? "text-primary" : "text-red-700"}`}>
            {data.shu.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Pendapatan per Akun</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 text-gray-900 font-semibold">Kode</th>
                <th className="text-left px-4 py-2 text-gray-900 font-semibold">Nama</th>
                <th className="text-right px-4 py-2 text-gray-900 font-semibold">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {data.revenueByAccount.map((item) => (
                <tr key={item.code} className="border-t border-gray-100">
                  <td className="px-4 py-2 text-gray-600">{item.code}</td>
                  <td className="px-4 py-2 text-gray-900">{item.name}</td>
                  <td className="px-4 py-2 text-right text-green-700">{item.amount.toLocaleString("id-ID")}</td>
                </tr>
              ))}
              {data.revenueByAccount.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-gray-500">Belum ada pendapatan</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Beban per Akun</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 text-gray-900 font-semibold">Kode</th>
                <th className="text-left px-4 py-2 text-gray-900 font-semibold">Nama</th>
                <th className="text-right px-4 py-2 text-gray-900 font-semibold">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {data.expenseByAccount.map((item) => (
                <tr key={item.code} className="border-t border-gray-100">
                  <td className="px-4 py-2 text-gray-600">{item.code}</td>
                  <td className="px-4 py-2 text-gray-900">{item.name}</td>
                  <td className="px-4 py-2 text-right text-red-700">{item.amount.toLocaleString("id-ID")}</td>
                </tr>
              ))}
              {data.expenseByAccount.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-gray-500">Belum ada beban</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <PieChart size={18} className="text-primary" />
          <h2 className="font-semibold text-gray-900">Pembagian SHU</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-700 mb-1">Pendapatan Asli Desa (10%)</p>
            <p className="text-lg font-bold text-blue-900">{data.allocation.pendapatanAsliDesa.toLocaleString("id-ID")}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-700 mb-1">Cadangan (20%)</p>
            <p className="text-lg font-bold text-green-900">{data.allocation.cadangan.toLocaleString("id-ID")}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <p className="text-sm text-yellow-700 mb-1">Dana Sosial (10%)</p>
            <p className="text-lg font-bold text-yellow-900">{data.allocation.danaSosial.toLocaleString("id-ID")}</p>
          </div>
          <div className="bg-primary/10 rounded-lg p-4">
            <p className="text-sm text-primary mb-1">Pengembangan (60%)</p>
            <p className="text-lg font-bold text-primary">{data.allocation.pengembangan.toLocaleString("id-ID")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
