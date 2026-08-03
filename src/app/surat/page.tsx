"use client";

import { useEffect, useState } from "react";
import { Plus, Mail, FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import { usePermission } from "@/hooks/use-permission";

type Letter = {
  id: string;
  number: string;
  subject: string;
  type: string;
  status: string;
  outgoingDate: string | null;
  incomingDate: string | null;
  sender: string | null;
  recipient: string | null;
  createdBy: { name: string };
  approvals?: Approval[];
};

type Approval = {
  id: string;
  stepOrder: number;
  status: string;
  approver: { name: string };
};

export default function SuratPage() {
  const { allowed, canWrite, loading } = usePermission({ module: "letters", minLevel: "read" });
  const [letters, setLetters] = useState<Letter[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [tab, setTab] = useState<"keluar" | "masuk">("keluar");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    type: "keluar",
    content: "",
    outgoingDate: "",
    incomingDate: "",
    sender: "",
    recipient: "",
    firstApproverId: "",
  });
  const [users, setUsers] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [approvals, setApprovals] = useState<Approval[]>([]);

  useEffect(() => {
    Promise.all([
      fetch(`/api/surat?type=${tab}`).then((res) => res.json()),
      fetch("/api/master/pengguna").then((res) => res.json()),
    ]).then(([letterJson, userJson]) => {
      setLetters(letterJson.data || []);
      setUsers(userJson.data || []);
      setDataLoading(false);
    });
  }, [tab]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const res = await fetch("/api/surat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      const json = await res.json();
      setLetters([json.data, ...letters]);
      setForm({
        subject: "",
        type: tab,
        content: "",
        outgoingDate: "",
        incomingDate: "",
        sender: "",
        recipient: "",
        firstApproverId: "",
      });
      setShowForm(false);
      setMessage("Surat berhasil disimpan dengan nomor otomatis");
    } else {
      const data = await res.json();
      setMessage(data.error || "Gagal menyimpan surat");
    }
    setSaving(false);
  }

  async function viewApprovals(letter: Letter) {
    setSelectedLetter(letter);
    const res = await fetch(`/api/surat/approval?letterId=${letter.id}`);
    const json = await res.json();
    setApprovals(json.data || []);
  }

  async function approveStep(approvalId: string, status: "approved" | "rejected", notes: string) {
    await fetch("/api/surat/approval", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: approvalId, status, notes }),
    });

    if (selectedLetter) {
      const res = await fetch(`/api/surat/approval?letterId=${selectedLetter.id}`);
      const json = await res.json();
      setApprovals(json.data || []);
    }

    fetch(`/api/surat?type=${tab}`)
      .then((res) => res.json())
      .then((json) => {
        setLetters(json.data || []);
      });
  }

  if (dataLoading) return <div className="p-6">Memuat...</div>;
  if (!allowed) return null;

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Surat Menyurat</h1>
        {canWrite && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition"
          >
            <Plus size={16} />
            Buat Surat
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab("keluar")}
          className={`px-4 py-2 rounded-lg font-semibold transition ${tab === "keluar" ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        >
          Surat Keluar
        </button>
        <button
          onClick={() => setTab("masuk")}
          className={`px-4 py-2 rounded-lg font-semibold transition ${tab === "masuk" ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        >
          Surat Masuk
        </button>
      </div>

      {canWrite && showForm && (
        <form onSubmit={onSubmit} className="bg-white p-6 rounded-lg border border-gray-200 mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Perihal</label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Penerima/Pengirim</label>
              <input
                type="text"
                value={tab === "keluar" ? form.recipient : form.sender}
                onChange={(e) => setForm({ ...form, [tab === "keluar" ? "recipient" : "sender"]: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {tab === "keluar" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Tanggal Keluar</label>
                <input
                  type="date"
                  value={form.outgoingDate}
                  onChange={(e) => setForm({ ...form, outgoingDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Approver Pertama</label>
                <select
                  value={form.firstApproverId}
                  onChange={(e) => setForm({ ...form, firstApproverId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Pilih approver</option>
                  {users.filter((u) => u.role?.name !== "Staf/Operator").map((user) => (
                    <option key={user.id} value={user.id}>{user.name} ({user.role?.name})</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {tab === "masuk" && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Tanggal Masuk</label>
              <input
                type="date"
                value={form.incomingDate}
                onChange={(e) => setForm({ ...form, incomingDate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Konten / Isi Surat</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              rows={4}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-primary text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-primary-600 transition disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan Surat"}
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
          {tab === "keluar" ? <Mail size={18} className="text-primary" /> : <FileText size={18} className="text-primary" />}
          <h2 className="font-semibold text-gray-900">
            {tab === "keluar" ? "Surat Keluar" : "Surat Masuk"}
          </h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-gray-900 font-semibold">Nomor</th>
              <th className="text-left px-4 py-3 text-gray-900 font-semibold">Perihal</th>
              <th className="text-left px-4 py-3 text-gray-900 font-semibold">Tanggal</th>
              <th className="text-left px-4 py-3 text-gray-900 font-semibold">Pengirim/Penerima</th>
              <th className="text-left px-4 py-3 text-gray-900 font-semibold">Status</th>
              <th className="text-left px-4 py-3 text-gray-900 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {letters.map((letter) => (
              <tr key={letter.id} className="border-t border-gray-100">
                <td className="px-4 py-3 text-gray-900">{letter.number}</td>
                <td className="px-4 py-3 text-gray-900">{letter.subject}</td>
                <td className="px-4 py-3 text-gray-900">
                  {tab === "keluar" && letter.outgoingDate
                    ? new Date(letter.outgoingDate).toLocaleDateString("id-ID")
                    : tab === "masuk" && letter.incomingDate
                    ? new Date(letter.incomingDate).toLocaleDateString("id-ID")
                    : "-"}
                </td>
                <td className="px-4 py-3 text-gray-900">
                  {tab === "keluar" ? letter.recipient : letter.sender}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(letter.status)}`}>
                    {getStatusLabel(letter.status)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => viewApprovals(letter)}
                    className="text-primary hover:text-primary-600 text-sm font-medium"
                  >
                    Lihat Approval
                  </button>
                </td>
              </tr>
            ))}
            {letters.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  Belum ada surat
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedLetter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedLetter(null)}>
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Approval: {selectedLetter.number} - {selectedLetter.subject}
            </h3>

            {approvals.length === 0 ? (
              <p className="text-sm text-gray-500 mb-4">Belum ada approval step</p>
            ) : (
              <div className="space-y-3 mb-4">
                {approvals.map((approval) => (
                  <div key={approval.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">Step {approval.stepOrder}</p>
                        <p className="text-sm text-gray-600">{approval.approver.name}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(approval.status)}`}>
                        {getStatusLabel(approval.status)}
                      </span>
                    </div>
                    {approval.status === "pending" && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => approveStep(approval.id, "approved", "")}
                          className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700"
                        >
                          <CheckCircle size={14} />
                          Setuju
                        </button>
                        <button
                          onClick={() => {
                            const notes = prompt("Alasan penolakan:");
                            if (notes) approveStep(approval.id, "rejected", notes);
                          }}
                          className="flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded text-sm hover:bg-red-700"
                        >
                          <XCircle size={14} />
                          Tolak
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setSelectedLetter(null)}
              className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case "draft":
      return "bg-yellow-50 text-yellow-700";
    case "approved":
      return "bg-green-50 text-green-700";
    case "rejected":
      return "bg-red-50 text-red-700";
    case "pending":
      return "bg-blue-50 text-blue-700";
    case "received":
      return "bg-gray-50 text-gray-700";
    default:
      return "bg-gray-50 text-gray-700";
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "draft":
      return "Draft";
    case "approved":
      return "Disetujui";
    case "rejected":
      return "Ditolak";
    case "pending":
      return "Menunggu";
    case "received":
      return "Diterima";
    default:
      return status;
  }
}
