"use client";

import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { usePermission } from "@/hooks/use-permission";
import { useRefreshOnEvent } from "@/hooks/use-refresh-on-event";

type JournalEntry = {
  id: string;
  entryDate: string;
  description: string;
  reference: string | null;
  isPosted: boolean;
  lines: JournalLine[];
};

type JournalLine = {
  id: string;
  accountCode: string;
  debit: string;
  credit: string;
  description: string | null;
};

export default function JurnalPage() {
  const { allowed, loading } = usePermission({ module: "accounting", minLevel: "read" });
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  async function loadData() {
    try {
      const res = await fetch("/api/keuangan/jurnal");
      const json = await res.json();
      setEntries(json.data || []);
    } catch (error) {
      console.error("Failed to load jurnal:", error);
    } finally {
      setDataLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useRefreshOnEvent(loadData);

  if (dataLoading) return <div className="p-6">Memuat...</div>;
  if (!allowed) return null;

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Jurnal Umum</h1>

      <div className="space-y-4">
        {entries.map((entry) => (
          <div key={entry.id} className="bg-white rounded-lg border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <BookOpen size={18} className="text-primary" />
                  <span className="font-semibold text-gray-900">
                    {new Date(entry.entryDate).toLocaleDateString("id-ID", { dateStyle: "full" })}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{entry.description}</p>
                {entry.reference && (
                  <p className="text-xs text-gray-500">Ref: {entry.reference}</p>
                )}
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${entry.isPosted ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
                  {entry.isPosted ? "Diposting" : "Draft"}
                </span>
              </div>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2 text-gray-900 font-semibold">Kode Akun</th>
                  <th className="text-left px-4 py-2 text-gray-900 font-semibold">Deskripsi</th>
                  <th className="text-right px-4 py-2 text-gray-900 font-semibold">Debit</th>
                  <th className="text-right px-4 py-2 text-gray-900 font-semibold">Kredit</th>
                </tr>
              </thead>
              <tbody>
                {entry.lines.map((line) => (
                  <tr key={line.id} className="border-t border-gray-100">
                    <td className="px-4 py-2 text-gray-900">{line.accountCode}</td>
                    <td className="px-4 py-2 text-gray-600">{line.description || "-"}</td>
                    <td className="px-4 py-2 text-right text-gray-900">
                      {Number(line.debit) > 0 ? Number(line.debit).toLocaleString("id-ID") : "-"}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-900">
                      {Number(line.credit) > 0 ? Number(line.credit).toLocaleString("id-ID") : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
        {entries.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
            Belum ada jurnal
          </div>
        )}
      </div>
    </div>
  );
}
