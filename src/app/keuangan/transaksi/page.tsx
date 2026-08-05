"use client";

import { useEffect, useState } from "react";
import { Plus, Wallet } from "lucide-react";
import { usePermission } from "@/hooks/use-permission";
import { emitRefresh } from "@/lib/refresh";
import { useRefreshOnEvent } from "@/hooks/use-refresh-on-event";
import { offlineFetch } from "@/lib/offline-fetch";

type Transaction = {
  id: string;
  transactionDate: string;
  unitUsahaId: string;
  type: string;
  amount: string;
  accountCode: string;
  description: string;
  createdBy: { name: string };
};

type UnitUsaha = {
  id: string;
  name: string;
};

type COA = {
  code: string;
  name: string;
};

export default function TransaksiPage() {
  const { allowed, canWrite, loading } = usePermission({ module: "accounting", minLevel: "read" });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [units, setUnits] = useState<UnitUsaha[]>([]);
  const [accounts, setAccounts] = useState<COA[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [form, setForm] = useState({
    transactionDate: new Date().toISOString().split("T")[0],
    unitUsahaId: "",
    type: "pemasukan",
    amount: "",
    accountCode: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadData() {
    try {
      const [txJson, unitJson, coaJson] = await Promise.all([
        fetch("/api/keuangan/transaksi").then((res) => res.json()),
        fetch("/api/master/unit-usaha").then((res) => res.json()),
        fetch("/api/master/coa").then((res) => res.json()),
      ]);
      setTransactions(txJson.data || []);
      setUnits(unitJson.data || []);
      setAccounts(coaJson.data || []);
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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const res = await offlineFetch("/api/keuangan/transaksi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      const json = await res.json();
      setMessage("Transaksi berhasil disimpan");
      setForm({
        transactionDate: new Date().toISOString().split("T")[0],
        unitUsahaId: form.unitUsahaId,
        type: "pemasukan",
        amount: "",
        accountCode: "",
        description: "",
      });
      await loadData();
      emitRefresh();
    } else {
      setMessage("Gagal menyimpan transaksi");
    }
    setSaving(false);
  }

  if (dataLoading) return <div className="p-6">Memuat...</div>;
  if (!allowed) return null;

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Transaksi Keuangan</h1>

      {canWrite && (
        <form onSubmit={onSubmit} className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Tanggal</label>
              <input
                type="date"
                value={form.transactionDate}
                onChange={(e) => setForm({ ...form, transactionDate: e.target.value })}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Jenis</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="pemasukan">Pemasukan</option>
                <option value="pengeluaran">Pengeluaran</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Nominal (Rp)</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="0"
                required
              />
            </div>
          </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">Akun (COA)</label>
          <select
            value={form.accountCode}
            onChange={(e) => setForm({ ...form, accountCode: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            required
          >
            <option value="">Pilih akun</option>
            {accounts.map((acc) => (
              <option key={acc.code} value={acc.code}>{acc.code} - {acc.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">Keterangan</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            rows={2}
            placeholder="Jelaskan transaksi..."
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-primary-600 transition disabled:opacity-50"
        >
          <Plus size={16} />
          {saving ? "Menyimpan..." : "Simpan Transaksi"}
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
          <Wallet size={18} className="text-primary" />
          <h2 className="font-semibold text-gray-900">Riwayat Transaksi</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-gray-900 font-semibold">Tanggal</th>
                <th className="text-left px-4 py-3 text-gray-900 font-semibold">Unit Usaha</th>
                <th className="text-left px-4 py-3 text-gray-900 font-semibold">Jenis</th>
                <th className="text-left px-4 py-3 text-gray-900 font-semibold">Akun</th>
                <th className="text-left px-4 py-3 text-gray-900 font-semibold">Nominal</th>
                <th className="text-left px-4 py-3 text-gray-900 font-semibold">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 text-gray-900">
                    {new Date(tx.transactionDate).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {units.find((u) => u.id === tx.unitUsahaId)?.name || tx.unitUsahaId}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${tx.type === "pemasukan" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                      {tx.type === "pemasukan" ? "Pemasukan" : "Pengeluaran"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-900">{tx.accountCode}</td>
                  <td className="px-4 py-3 text-gray-900 font-semibold">
                    <span className={tx.type === "pemasukan" ? "text-green-700" : "text-red-700"}>
                      {tx.type === "pemasukan" ? "+" : "-"}
                    </span>
                    {" "}{Number(tx.amount).toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{tx.description}</td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Belum ada transaksi
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
