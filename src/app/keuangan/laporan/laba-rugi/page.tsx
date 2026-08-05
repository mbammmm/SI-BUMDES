"use client";

import { useEffect, useState } from "react";
import { usePermission } from "@/hooks/use-permission";

type LabaRugiData = {
  startDate: string;
  endDate: string;
  pendapatan: { code: string; name: string; total: number }[];
  beban: { code: string; name: string; total: number }[];
  totals: { pendapatan: number; beban: number; labaRugi: number };
};

export default function LabaRugiPage() {
  const { allowed, loading } = usePermission({ module: "accounting", minLevel: "read" });
  const [data, setData] = useState<LabaRugiData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);

    fetch(`/api/keuangan/laporan/laba-rugi?${params.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setDataLoading(false);
      });
  }, [startDate, endDate]);

  if (dataLoading) return <div className="p-6">Memuat...</div>;
  if (!allowed) return null;

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Laporan Laba Rugi</h1>

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
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-4 py-3 bg-green-50 border-b border-gray-200">
              <h2 className="font-semibold text-green-700">Pendapatan</h2>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[400px]">
              <tbody>
                {data.pendapatan.map((item) => (
                  <tr key={item.code} className="border-t border-gray-100">
                    <td className="px-4 py-2 text-gray-600 w-16">{item.code}</td>
                    <td className="px-4 py-2 text-gray-900">{item.name}</td>
                    <td className="px-4 py-2 text-right text-green-700">
                      {item.total.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-gray-300 bg-gray-50">
                  <td colSpan={2} className="px-4 py-3 font-semibold text-gray-900">Total Pendapatan</td>
                  <td className="px-4 py-3 text-right font-bold text-green-700">
                    {data.totals.pendapatan.toLocaleString("id-ID")}
                  </td>
                </tr>
              </tbody>
            </table>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-4 py-3 bg-red-50 border-b border-gray-200">
              <h2 className="font-semibold text-red-700">Beban</h2>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[400px]">
              <tbody>
                {data.beban.map((item) => (
                  <tr key={item.code} className="border-t border-gray-100">
                    <td className="px-4 py-2 text-gray-600 w-16">{item.code}</td>
                    <td className="px-4 py-2 text-gray-900">{item.name}</td>
                    <td className="px-4 py-2 text-right text-red-700">
                      {item.total.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-gray-300 bg-gray-50">
                  <td colSpan={2} className="px-4 py-3 font-semibold text-gray-900">Total Beban</td>
                  <td className="px-4 py-3 text-right font-bold text-red-700">
                    {data.totals.beban.toLocaleString("id-ID")}
                  </td>
                </tr>
              </tbody>
            </table>
            </div>
          </div>

          <div className={`rounded-lg border p-4 ${data.totals.labaRugi >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Laba/Rugi</span>
              <span className={`text-2xl font-bold ${data.totals.labaRugi >= 0 ? "text-green-700" : "text-red-700"}`}>
                {data.totals.labaRugi.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
