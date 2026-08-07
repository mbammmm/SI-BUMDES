"use client";

import { useEffect, useState, useCallback } from "react";
import { Calendar, Check, AlertCircle, Filter } from "lucide-react";
import { usePermission } from "@/hooks/use-permission";
import { useRefreshOnEvent } from "@/hooks/use-refresh-on-event";
import { emitRefresh } from "@/lib/refresh";

type ReconciliationItem = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: string;
  status: "matched" | "unmatched" | "disputed";
};

type ReconciliationResult = {
  startDate: string;
  endDate: string;
  bankBalance: number;
  systemBalance: number;
  difference: number;
  items: ReconciliationItem[];
  status: "reconciled" | "pending" | "discrepancy";
};

type Transaction = {
  id: string;
  transactionDate: string;
  description: string;
  amount: string;
  type: string;
  accountCode: string;
  unitUsahaId: string;
  isPosted: boolean;
  proofPath: string | null;
};

type UnitUsaha = {
  id: string;
  name: string;
};

type COA = {
  code: string;
  name: string;
};

export default function RekonsiliasiPage() {
  const { allowed, canWrite, loading } = usePermission({ module: "accounting", minLevel: "read" });
  const [data, setData] = useState<ReconciliationResult | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [bankBalance, setBankBalance] = useState("");
  const [itemStatuses, setItemStatuses] = useState<Record<string, "matched" | "unmatched" | "disputed">>({});
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [units, setUnits] = useState<UnitUsaha[]>([]);
  const [coa, setCoa] = useState<COA[]>([]);

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

  const loadData = useCallback(async () => {
    if (!startDate || !endDate) return;

    try {
      const [rekonRes, txRes, unitRes, coaRes] = await Promise.all([
        fetch(`/api/keuangan/rekonsiliasi?startDate=${startDate}&endDate=${endDate}`).then((res) => res.json()),
        fetch(`/api/keuangan/transaksi?startDate=${startDate}&endDate=${endDate}`).then((res) => res.json()),
        fetch("/api/master/unit-usaha").then((res) => res.json()),
        fetch("/api/master/coa").then((res) => res.json()),
      ]);

      setData(rekonRes);
      setTransactions(txRes.data || []);
      setUnits(unitRes.data || []);
      setCoa(coaRes.data || []);

      const initialStatuses: Record<string, "matched" | "unmatched" | "disputed"> = {};
      (txRes.data || []).forEach((tx: Transaction) => {
        if (tx.isPosted && tx.proofPath) {
          initialStatuses[tx.id] = "matched";
        } else {
          initialStatuses[tx.id] = "unmatched";
        }
      });
      setItemStatuses(initialStatuses);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setDataLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useRefreshOnEvent(loadData);

  useEffect(() => {
    if (!endDate) {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(firstDay.toISOString().split("T")[0]);
      setEndDate(today.toISOString().split("T")[0]);
    }
  }, []);

  async function onSaveReconciliation() {
    if (!startDate || !endDate) return;

    setSaving(true);
    setMessage("");

    const items = Object.entries(itemStatuses).map(([id, status]) => ({ id, status }));

    const res = await fetch("/api/keuangan/rekonsiliasi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startDate,
        endDate,
        bankBalance: Number(bankBalance) || 0,
        notes,
        itemStatuses: items,
      }),
    });

    if (res.ok) {
      setMessage("Rekonsiliasi berhasil disimpan");
      await loadData();
      emitRefresh();
    } else {
      const data = await res.json();
      setMessage(data.error || "Gagal menyimpan rekonsiliasi");
    }
    setSaving(false);
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case "matched":
        return "bg-green-50 text-green-700";
      case "unmatched":
        return "bg-yellow-50 text-yellow-700";
      case "disputed":
        return "bg-red-50 text-red-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  }

  function getStatusLabel(status: string): string {
    switch (status) {
      case "matched":
        return "Cocok";
      case "unmatched":
        return "Belum Cocok";
      case "disputed":
        return "Konflik";
      default:
        return status;
    }
  }

  function getRekonStatusColor(status: string): string {
    switch (status) {
      case "reconciled":
        return "bg-green-50 text-green-700";
      case "pending":
        return "bg-yellow-50 text-yellow-700";
      case "discrepancy":
        return "bg-red-50 text-red-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  }

  function getRekonStatusLabel(status: string): string {
    switch (status) {
      case "reconciled":
        return "Lunas";
      case "pending":
        return "Menunggu";
      case "discrepancy":
        return "Selisih";
      default:
        return status;
    }
  }

  if (dataLoading && !data) return <div className="p-6">Memuat...</div>;
  if (!allowed) return null;

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Rekonsiliasi Kas/Bank</h1>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Periode Rekonsiliasi</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Dari Tanggal</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Saldo Bank (Rp)</label>
            <input
              type="number"
              value={bankBalance}
              onChange={(e) => setBankBalance(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Masukkan saldo bank"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-900 mb-1">Catatan</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            rows={3}
            placeholder="Catatan rekonsiliasi (opsional)"
          />
        </div>

        {canWrite && (
          <div className="flex gap-2">
            <button
              onClick={onSaveReconciliation}
              disabled={saving || !bankBalance}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : <><Check size={16} /> Simpan Rekonsiliasi</>}
            </button>
          </div>
        )}
      </div>

      {message && (
        <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 rounded border border-green-200">
          {message}
        </div>
      )}

      {data && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Saldo Bank</p>
              <p className="text-xl font-bold text-blue-700 mt-1">
                {formatCurrency(data.bankBalance)}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Saldo Sistem</p>
              <p className="text-xl font-bold text-purple-700 mt-1">
                {formatCurrency(data.systemBalance)}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Selisih</p>
              <p className={`text-xl font-bold mt-1 ${data.difference >= 0 ? "text-orange-700" : "text-red-700"}`}>
                {formatCurrency(data.difference)}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Status Rekonsiliasi</p>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${getRekonStatusColor(data.status)}`}>
                {getRekonStatusLabel(data.status)}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Daftar Transaksi</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Filter size={16} />
                {data.items.length} transaksi
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[800px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-900 font-semibold">Tanggal</th>
                    <th className="text-left px-4 py-3 text-gray-900 font-semibold">Deskripsi</th>
                    <th className="text-left px-4 py-3 text-gray-900 font-semibold">Akun</th>
                    <th className="text-left px-4 py-3 text-gray-900 font-semibold">Unit Usaha</th>
                    <th className="text-right px-4 py-3 text-gray-900 font-semibold">Nominal</th>
                    <th className="text-center px-4 py-3 text-gray-900 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => {
                    const tx = transactions.find((t) => t.id === item.id);
                    return (
                      <tr key={item.id} className="border-t border-gray-100">
                        <td className="px-4 py-3 text-gray-900">
                          {formatDate(item.date)}
                        </td>
                        <td className="px-4 py-3 text-gray-900">{item.description}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {coa.find((c) => c.code === tx?.accountCode)?.name || tx?.accountCode || "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {units.find((u) => u.id === tx?.unitUsahaId)?.name || tx?.unitUsahaId || "-"}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-900 font-semibold">
                          {formatCurrency(item.amount)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <select
                            value={itemStatuses[item.id] || "unmatched"}
                            onChange={(e) =>
                              setItemStatuses({
                                ...itemStatuses,
                                [item.id]: e.target.value as "matched" | "unmatched" | "disputed",
                              })
                            }
                            className={`px-2 py-1 rounded text-xs font-semibold border-0 bg-transparent ${getStatusColor(itemStatuses[item.id] || "unmatched")}`}
                          >
                            <option value="matched">Cocok</option>
                            <option value="unmatched">Belum Cocok</option>
                            <option value="disputed">Konflik</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                  {data.items.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        Belum ada transaksi untuk periode ini
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {data.status === "discrepancy" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle size={20} className="text-yellow-600 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-800">Selisih terdeteksi</p>
                <p className="text-sm text-yellow-700">
                  Ada selisih antara saldo bank dan saldo sistem. Periksa kembali transaksi yang belum dicocokkan.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
