"use client";

import { useState, useEffect } from "react";
import { usePermission } from "@/hooks/use-permission";
import { useRefreshOnEvent } from "@/hooks/use-refresh-on-event";
import { Plus, Download } from "lucide-react";

export default function BukuBesarPage() {
  const { allowed, canWrite, loading } = usePermission({
    module: "accounting",
    minLevel: "read",
  });
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [entries, setEntries] = useState<any[]>([]);
  const [saldoAwal, setSaldoAwal] = useState(0);
  const [saldoAkhir, setSaldoAkhir] = useState(0);
  const [loadingEntries, setLoadingEntries] = useState(false);

  useRefreshOnEvent(() => {
    loadAccounts();
    if (selectedAccount) loadEntries();
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      loadEntries();
    }
  }, [selectedAccount]);

  async function loadAccounts() {
    try {
      const res = await fetch("/api/keuangan/accounts");
      const data = await res.json();
      setAccounts(data);
    } catch (error) {
      console.error("Error loading accounts:", error);
    }
  }

  async function loadEntries() {
    if (!selectedAccount) return;
    setLoadingEntries(true);
    try {
      const res = await fetch(`/api/keuangan/buku-besar?accountId=${selectedAccount}`);
      const data = await res.json();
      setEntries(data.entries || []);
      setSaldoAwal(data.saldoAwal || 0);
      setSaldoAkhir(data.saldoAkhir || 0);
    } catch (error) {
      console.error("Error loading entries:", error);
    } finally {
      setLoadingEntries(false);
    }
  }

  if (loading) return <div className="p-6">Memuat...</div>;
  if (!allowed) return null;

  return (
    <div className="p-6 max-w-6xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Buku Besar</h1>
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

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Pilih Akun
          </label>
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full text-gray-900"
          >
            <option value="">-- Pilih Akun --</option>
            {accounts.map((account) => (
              <option key={account.code} value={account.code}>
                {account.code} - {account.name}
              </option>
            ))}
          </select>
        </div>

        {selectedAccount && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">
                {accounts.find((a) => a.code === selectedAccount)?.name || selectedAccount}
              </h2>
              <div className="text-right">
                <span className="text-sm text-gray-600">Saldo Awal:</span>
                <span className="font-bold text-gray-900">
                  Rp {saldoAwal.toLocaleString("id-IN")}
                </span>
                <br />
                <span className="text-sm text-gray-600">Saldo Akhir:</span>
                <span className="font-bold text-gray-900">
                  Rp {saldoAkhir.toLocaleString("id-IN")}
                </span>
              </div>
            </div>

            {loadingEntries ? (
              <div className="p-6">Memuat...</div>
            ) : entries.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                Tidak ada transaksi untuk akun ini
              </div>
            ) : (
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900">Tanggal</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900">No Ref</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900">Keterangan</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-900">Debit</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-900">Kredit</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-900">Saldo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {entries.map((entry, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {new Date(entry.date).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">{entry.reference || "-"}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{entry.description || "-"}</td>
                      <td className="px-4 py-2 text-sm text-right text-gray-900">
                        {entry.debit > 0 ? Number(entry.debit).toLocaleString("id-IN") : "-"}
                      </td>
                      <td className="px-4 py-2 text-sm text-right text-gray-900">
                        {entry.kredit > 0 ? Number(entry.kredit).toLocaleString("id-IN") : "-"}
                      </td>
                      <td className="px-4 py-2 text-sm text-right font-bold text-gray-900">
                        Rp {Number(entry.saldo).toLocaleString("id-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
