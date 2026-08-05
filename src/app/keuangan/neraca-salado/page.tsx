"use client";

import { useState, useEffect } from "react";
import { usePermission } from "@/hooks/use-permission";
import { useRefreshOnEvent } from "@/hooks/use-refresh-on-event";
import { Download } from "lucide-react";

export default function NeracaSaldoPage() {
  const { allowed, loading } = usePermission({
    module: "accounting",
    minLevel: "read",
  });
  const [data, setData] = useState<any[]>([]);
  const [totalDebit, setTotalDebit] = useState(0);
  const [totalKredit, setTotalKredit] = useState(0);

  useRefreshOnEvent(() => {
    loadData();
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await fetch("/api/keuangan/neraca-saldo");
      const result = await res.json();
      setData(result.data || []);
      setTotalDebit(result.totalDebit || 0);
      setTotalKredit(result.totalKredit || 0);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  }

  if (loading) return <div className="p-6">Memuat...</div>;
  if (!allowed) return null;

  return (
    <div className="p-6 max-w-6xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Neraca Saldo</h1>
          <div className="flex gap-2">
            <button
              onClick={() => window.open("/api/keuangan/export?format=excel&reportType=jurnal", "_blank")}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition text-sm"
            >
              <Download size={16} />
              Export Excel
            </button>
          </div>
        </div>

        {data.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Tidak ada data akun
          </div>
        ) : (
          <>
            <table className="w-full divide-y divide-gray-200 bg-white rounded-lg border border-gray-200 overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900">Kode Akun</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900">Nama Akun</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900">Kategori</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-gray-900">Saldo Normal</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-900">Debit</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-900">Kredit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm text-gray-700">{item.code}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{item.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{item.category}</td>
                    <td className="px-4 py-2 text-center">
                      <span className={`px-2 py-1 rounded text-xs ${item.normalBalance === "debit" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}>
                        {item.normalBalance === "debit" ? "Debit" : "Kredit"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-right text-gray-900">
                      Rp {Number(item.debit).toLocaleString("id-IN")}
                    </td>
                    <td className="px-4 py-2 text-sm text-right text-gray-900">
                      Rp {Number(item.kredit).toLocaleString("id-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={4} className="px-4 py-2 text-right font-semibold text-gray-900">Total:</td>
                  <td className="px-4 py-2 text-right font-bold text-gray-900">
                    Rp {totalDebit.toLocaleString("id-IN")}
                  </td>
                  <td className="px-4 py-2 text-right font-bold text-gray-900">
                    Rp {totalKredit.toLocaleString("id-IN")}
                  </td>
                </tr>
              </tfoot>
            </table>

            {Math.abs(totalDebit - totalKredit) > 0.01 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-semibold">
                  ⚠️ Saldo tidak seimbang! Selisih: Rp {Math.abs(totalDebit - totalKredit).toLocaleString("id-IN")}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
