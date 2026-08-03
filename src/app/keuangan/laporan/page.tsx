"use client";

import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";

type ReportData = {
  data: any[];
  summary: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
  };
};

export default function LaporanPage() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);

    fetch(`/api/keuangan/laporan?${params.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        setReport(json);
        setLoading(false);
      });
  }, [startDate, endDate]);

  if (loading) return <div className="p-6">Memuat...</div>;

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Laporan Keuangan</h1>

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

      {report && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Total Pemasukan</p>
              <p className="text-xl font-bold text-green-700 mt-1">
                {report.summary.totalIncome.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Total Pengeluaran</p>
              <p className="text-xl font-bold text-red-700 mt-1">
                {report.summary.totalExpense.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Saldo</p>
              <p className="text-xl font-bold text-primary mt-1">
                {report.summary.balance.toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
              <BarChart3 size={18} className="text-primary" />
              <h2 className="font-semibold text-gray-900">Rincian Transaksi</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-900 font-semibold">Tanggal</th>
                  <th className="text-left px-4 py-3 text-gray-900 font-semibold">Jenis</th>
                  <th className="text-left px-4 py-3 text-gray-900 font-semibold">Akun</th>
                  <th className="text-right px-4 py-3 text-gray-900 font-semibold">Nominal</th>
                </tr>
              </thead>
              <tbody>
                {report.data.map((tx: any) => (
                  <tr key={tx.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 text-gray-900">
                      {new Date(tx.transactionDate).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${tx.type === "pemasukan" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                        {tx.type === "pemasukan" ? "Pemasukan" : "Pengeluaran"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-900">{tx.accountCode}</td>
                    <td className="px-4 py-3 text-right text-gray-900 font-semibold">
                      {Number(tx.amount).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
                {report.data.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      Belum ada transaksi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
