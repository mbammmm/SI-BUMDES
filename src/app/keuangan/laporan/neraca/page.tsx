"use client";

import { useEffect, useState } from "react";

type NeracaData = {
  asOfDate: string;
  aset: { code: string; name: string; balance: number }[];
  liabilitas: { code: string; name: string; balance: number }[];
  ekuitas: { code: string; name: string; balance: number }[];
  totals: { aset: number; liabilitas: number; ekuitas: number };
};

export default function NeracaPage() {
  const [data, setData] = useState<NeracaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [asOfDate, setAsOfDate] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (asOfDate) params.set("asOfDate", asOfDate);

    fetch(`/api/keuangan/laporan/neraca?${params.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      });
  }, [asOfDate]);

  if (loading) return <div className="p-6">Memuat...</div>;

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Neraca (Laporan Posisi Keuangan)</h1>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-1">Per Tanggal</label>
        <input
          type="date"
          value={asOfDate}
          onChange={(e) => setAsOfDate(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
        />
      </div>

      {data && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-4 py-3 bg-primary/10 border-b border-gray-200">
              <h2 className="font-semibold text-primary">Aset</h2>
            </div>
            <table className="w-full text-sm">
              <tbody>
                {data.aset.map((item) => (
                  <tr key={item.code} className="border-t border-gray-100">
                    <td className="px-4 py-2 text-gray-600 w-16">{item.code}</td>
                    <td className="px-4 py-2 text-gray-900">{item.name}</td>
                    <td className="px-4 py-2 text-right text-gray-900">
                      {item.balance.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-gray-300 bg-gray-50">
                  <td colSpan={2} className="px-4 py-3 font-semibold text-gray-900">Total Aset</td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900">
                    {data.totals.aset.toLocaleString("id-ID")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-4 py-3 bg-primary/10 border-b border-gray-200">
              <h2 className="font-semibold text-primary">Liabilitas</h2>
            </div>
            <table className="w-full text-sm">
              <tbody>
                {data.liabilitas.map((item) => (
                  <tr key={item.code} className="border-t border-gray-100">
                    <td className="px-4 py-2 text-gray-600 w-16">{item.code}</td>
                    <td className="px-4 py-2 text-gray-900">{item.name}</td>
                    <td className="px-4 py-2 text-right text-gray-900">
                      {item.balance.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-gray-300 bg-gray-50">
                  <td colSpan={2} className="px-4 py-3 font-semibold text-gray-900">Total Liabilitas</td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900">
                    {data.totals.liabilitas.toLocaleString("id-ID")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-4 py-3 bg-primary/10 border-b border-gray-200">
              <h2 className="font-semibold text-primary">Ekuitas</h2>
            </div>
            <table className="w-full text-sm">
              <tbody>
                {data.ekuitas.map((item) => (
                  <tr key={item.code} className="border-t border-gray-100">
                    <td className="px-4 py-2 text-gray-600 w-16">{item.code}</td>
                    <td className="px-4 py-2 text-gray-900">{item.name}</td>
                    <td className="px-4 py-2 text-right text-gray-900">
                      {item.balance.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-gray-300 bg-gray-50">
                  <td colSpan={2} className="px-4 py-3 font-semibold text-gray-900">Total Ekuitas</td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900">
                    {data.totals.ekuitas.toLocaleString("id-ID")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-primary/10 rounded-lg border border-primary/20 p-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-primary">Total Liabilitas + Ekuitas</span>
              <span className="text-xl font-bold text-primary">
                {(data.totals.liabilitas + data.totals.ekuitas).toLocaleString("id-ID")}
              </span>
            </div>
            <p className="text-xs text-primary mt-1">
              {data.totals.aset === data.totals.liabilitas + data.totals.ekuitas
                ? "✓ Neraca seimbang"
                : "⚠ Neraca tidak seimbang"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
