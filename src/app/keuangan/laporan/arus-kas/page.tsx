"use client";

import { useEffect, useState } from "react";
import { usePermission } from "@/hooks/use-permission";

type ArusKasData = {
  startDate: string;
  endDate: string;
  summary: { cashIn: number; cashOut: number; netCashFlow: number };
  dailyBreakdown: { date: string; pemasukan: number; pengeluaran: number; net: number }[];
};

export default function ArusKasPage() {
  const { allowed, loading } = usePermission({ module: "accounting", minLevel: "read" });
  const [data, setData] = useState<ArusKasData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);

    fetch(`/api/keuangan/laporan/arus-kas?${params.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setDataLoading(false);
      });
  }, [startDate, endDate]);

  if (dataLoading) return <div className="p-6">Memuat...</div>;
  if (!allowed) return null;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Laporan Arus Kas</h1>

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

      {data && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Total Pemasukan</p>
              <p className="text-xl font-bold text-green-700 mt-1">
                {data.summary.cashIn.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Total Pengeluaran</p>
              <p className="text-xl font-bold text-red-700 mt-1">
                {data.summary.cashOut.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Net Arus Kas</p>
              <p className={`text-xl font-bold mt-1 ${data.summary.netCashFlow >= 0 ? "text-green-700" : "text-red-700"}`}>
                {data.summary.netCashFlow.toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Rincian Harian</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-900 font-semibold">Tanggal</th>
                    <th className="text-right px-4 py-3 text-gray-900 font-semibold">Pemasukan</th>
                    <th className="text-right px-4 py-3 text-gray-900 font-semibold">Pengeluaran</th>
                    <th className="text-right px-4 py-3 text-gray-900 font-semibold">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {data.dailyBreakdown.map((item) => (
                    <tr key={item.date} className="border-t border-gray-100">
                      <td className="px-4 py-3 text-gray-900">
                        {new Date(item.date).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-4 py-3 text-right text-green-700">
                        {item.pemasukan.toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-3 text-right text-red-700">
                        {item.pengeluaran.toLocaleString("id-ID")}
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold ${item.net >= 0 ? "text-green-700" : "text-red-700"}`}>
                        {item.net.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                  {data.dailyBreakdown.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                        Belum ada transaksi
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
